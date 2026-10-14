import { createClientFromRequest } from "npm:@base44/sdk@0.8.52";
import { requireFeature } from "../../shared/planGuard.ts";
import {
  QB_AUTH_URL,
  QB_TOKEN_URL,
  QB_ACCOUNTING_SCOPE,
  credentials,
  redirectUri,
  appOrigin,
  rows,
  qbQuery,
} from "../../shared/quickbooks.ts";

// Connects one shop's own QuickBooks company.
//
// The platform's QuickBooks connector is shared: it would point every shop at
// the app owner's company. This flow instead authorizes each shop against the
// workspace's own Intuit app and keeps that shop's tokens in a service-only
// record, so no shop can ever see or use another shop's books.

function publicConnection(connection: any) {
  if (!connection) return null;
  const { pending_state, ...rest } = connection;
  return rest;
}

async function loadConnection(sr: any, shopId: string) {
  const found = await sr.entities.QuickBooksConnection.filter(
    { shop_id: shopId },
    { limit: 1 }
  );
  return rows(found)[0] || null;
}

// Intuit sends the shop's browser back here with ?code&state&realmId.
async function handleCallback(base44: any, req: Request, url: URL) {
  const origin = appOrigin(req);
  const back = (query: string) =>
    origin
      ? Response.redirect(`${origin}/quickbooks${query}`, 302)
      : Response.json({ error: "Missing app address." }, { status: 400 });

  const code = url.searchParams.get("code") || "";
  const state = url.searchParams.get("state") || "";
  const realmId = url.searchParams.get("realmId") || "";
  if (!code || !state || !realmId) return back("?quickbooks=error");

  const sr = base44.asServiceRole;
  // The single-use state written to the shop's own connection record when the
  // flow started is the check on this request.
  const found = await sr.entities.QuickBooksConnection.filter(
    { pending_state: state },
    { limit: 1 }
  );
  const connection = rows(found)[0];
  if (!connection) return back("?quickbooks=error");

  const pair = credentials();
  if (!pair) return back("?quickbooks=unconfigured");

  const res = await fetch(QB_TOKEN_URL, {
    method: "POST",
    headers: {
      Authorization: `Basic ${btoa(`${pair.clientId}:${pair.clientSecret}`)}`,
      "Content-Type": "application/x-www-form-urlencoded",
      Accept: "application/json",
    },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      code,
      redirect_uri: redirectUri(req),
    }),
    signal: AbortSignal.timeout(15000),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok || !json.access_token) {
    await sr.entities.QuickBooksConnection.update(connection.id, {
      status: "error",
      pending_state: "",
      last_error:
        json?.error_description || "QuickBooks did not accept the connection.",
    });
    return back("?quickbooks=error");
  }

  const environment =
    connection.environment === "sandbox" ? "sandbox" : "production";
  const payload = {
    shop_id: connection.shop_id,
    realm_id: realmId,
    environment,
    access_token: json.access_token,
    refresh_token: json.refresh_token || "",
    expires_at: new Date(
      Date.now() + (json.expires_in || 3600) * 1000
    ).toISOString(),
    refresh_expires_at: json.x_refresh_token_expires_in
      ? new Date(
          Date.now() + json.x_refresh_token_expires_in * 1000
        ).toISOString()
      : "",
  };

  const existing = await sr.entities.QuickBooksCredential.filter(
    { shop_id: connection.shop_id },
    { limit: 1 }
  );
  const row = rows(existing)[0];
  if (row) await sr.entities.QuickBooksCredential.update(row.id, payload);
  else await sr.entities.QuickBooksCredential.create(payload);

  let companyName = "";
  try {
    const info = await qbQuery(
      base44,
      connection.shop_id,
      "select * from CompanyInfo"
    );
    companyName = info?.CompanyInfo?.[0]?.CompanyName || "";
  } catch (e: any) {
    console.error("quickbooks company lookup failed", e?.message);
  }

  await sr.entities.QuickBooksConnection.update(connection.id, {
    status: "connected",
    realm_id: realmId,
    company_name: companyName,
    pending_state: "",
    last_error: "",
    connected_at: new Date().toISOString(),
  });

  return back("?quickbooks=connected");
}

export default async function (req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const url = new URL(req.url);

    if (req.method === "GET") {
      if (url.searchParams.get("code")) {
        return await handleCallback(base44, req, url);
      }
      return new Response(
        "<html><body style=\"font-family:sans-serif;padding:24px\">QuickBooks connection endpoint. Open ShopClutter to connect a company.</body></html>",
        { status: 200, headers: { "Content-Type": "text/html" } }
      );
    }

    const user = await base44.auth.me().catch(() => null);
    if (!user) {
      return Response.json({ error: "Please sign in." }, { status: 401 });
    }
    const guard = await requireFeature(base44, user, "quickbooks");
    if (!guard.ok) return guard.response;
    if (user.role !== "admin") {
      return Response.json(
        { error: "Only a shop administrator can manage QuickBooks." },
        { status: 403 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const action = String(body?.action || "");
    const shopId = guard.shop.id;
    const sr = base44.asServiceRole;
    const connection = await loadConnection(sr, shopId);

    if (action === "status") {
      return Response.json({
        connection: publicConnection(connection),
        configured: !!credentials(),
        redirect_uri: redirectUri(req),
      });
    }

    if (action === "start") {
      const pair = credentials();
      if (!pair) {
        return Response.json(
          {
            error:
              "QuickBooks is not set up on this app yet. The Intuit app keys are still needed.",
          },
          { status: 400 }
        );
      }
      if (!appOrigin(req)) {
        return Response.json(
          { error: "Missing app address." },
          { status: 400 }
        );
      }
      const environment =
        body?.environment === "sandbox" ? "sandbox" : "production";
      const state = crypto.randomUUID();
      const record = connection
        ? await sr.entities.QuickBooksConnection.update(connection.id, {
            pending_state: state,
            environment,
            last_error: "",
          })
        : await sr.entities.QuickBooksConnection.create({
            shop_id: shopId,
            pending_state: state,
            environment,
            status: "disconnected",
          });

      const params = new URLSearchParams({
        client_id: pair.clientId,
        response_type: "code",
        scope: QB_ACCOUNTING_SCOPE,
        redirect_uri: redirectUri(req),
        state,
      });
      return Response.json({
        url: `${QB_AUTH_URL}?${params.toString()}`,
        connection: publicConnection(record),
      });
    }

    if (action === "disconnect") {
      const existing = await sr.entities.QuickBooksCredential.filter(
        { shop_id: shopId },
        { limit: 5 }
      );
      await Promise.all(
        rows(existing).map((c: any) =>
          sr.entities.QuickBooksCredential.delete(c.id)
        )
      );
      if (connection) {
        await sr.entities.QuickBooksConnection.update(connection.id, {
          status: "disconnected",
          realm_id: "",
          company_name: "",
          pending_state: "",
          last_error: "",
        });
      }
      return Response.json({ ok: true });
    }

    if (action === "direction") {
      if (!connection) {
        return Response.json(
          { error: "Connect QuickBooks first." },
          { status: 400 }
        );
      }
      const direction = ["push", "pull", "two_way"].includes(body?.direction)
        ? body.direction
        : "two_way";
      const updated = await sr.entities.QuickBooksConnection.update(
        connection.id,
        { accounting_direction: direction }
      );
      return Response.json({ connection: publicConnection(updated) });
    }

    return Response.json({ error: "Unknown action." }, { status: 400 });
  } catch (error: any) {
    console.error("quickbooksAuth failed", error?.message);
    return Response.json(
      { error: error?.message || "QuickBooks could not be reached." },
      { status: 500 }
    );
  }
}