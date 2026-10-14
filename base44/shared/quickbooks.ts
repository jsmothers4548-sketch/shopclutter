// Shared QuickBooks helpers used by every QuickBooks backend function.
//
// Each shop connects its OWN Intuit company. The tokens are therefore stored
// per shop (QuickBooksCredential, readable by the service role only) and are
// never shared between shops — unlike a shared app connector, which would point
// every shop at one company.

import { secrets } from "base44:runtime";

export const QB_AUTH_URL = "https://appcenter.intuit.com/connect/oauth2";
export const QB_TOKEN_URL =
  "https://oauth.platform.intuit.com/oauth2/v1/tokens/bearer";
export const QB_PROD_API = "https://quickbooks.api.intuit.com";
export const QB_SANDBOX_API = "https://sandbox-quickbooks.api.intuit.com";

// Payroll is a separate Intuit API that must be requested and approved for the
// Intuit app before it can be called, so the accounting scope is the only one
// asked for at connection time.
export const QB_ACCOUNTING_SCOPE = "com.intuit.quickbooks.accounting";

export const PAYROLL_UNAVAILABLE =
  "Payroll sync needs Intuit's Payroll API approval for this app. Accounting sync works without it.";

export function rows(page: any): any[] {
  if (Array.isArray(page)) return page;
  return page?.items || [];
}

export function appOrigin(req: Request): string {
  return req.headers.get("X-Base44-App-Url") || "";
}

// Must match the redirect URI registered on the Intuit app exactly.
export function redirectUri(req: Request): string {
  return `${appOrigin(req).replace(/\/+$/, "")}/functions/quickbooksAuth`;
}

// The workspace's own Intuit app credentials. Null until they are set, so every
// caller can tell the user what is missing instead of failing obscurely.
export function credentials() {
  const clientId = secrets.get("QUICKBOOKS_CLIENT_ID");
  const clientSecret = secrets.get("QUICKBOOKS_CLIENT_SECRET");
  if (!clientId || !clientSecret) return null;
  return { clientId, clientSecret };
}

export function apiBase(environment?: string) {
  return environment === "sandbox" ? QB_SANDBOX_API : QB_PROD_API;
}

export async function loadCredential(base44: any, shopId: string) {
  const found = await base44.asServiceRole.entities.QuickBooksCredential.filter(
    { shop_id: shopId },
    { limit: 1 }
  );
  return rows(found)[0] || null;
}

// A usable access token for the shop. Refreshes it when it is close to expiring
// and throws a plain message the shop can act on when the grant is gone.
export async function accessFor(base44: any, shopId: string) {
  const cred = await loadCredential(base44, shopId);
  if (!cred) throw new Error("QuickBooks is not connected for this shop.");

  const expires = cred.expires_at ? Date.parse(cred.expires_at) : 0;
  if (expires && expires - Date.now() > 120000) {
    return {
      token: cred.access_token,
      realmId: cred.realm_id,
      environment: cred.environment,
    };
  }

  const pair = credentials();
  if (!pair) throw new Error("QuickBooks is not set up on this app yet.");

  const res = await fetch(QB_TOKEN_URL, {
    method: "POST",
    headers: {
      Authorization: `Basic ${btoa(`${pair.clientId}:${pair.clientSecret}`)}`,
      "Content-Type": "application/x-www-form-urlencoded",
      Accept: "application/json",
    },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: cred.refresh_token,
    }),
    signal: AbortSignal.timeout(15000),
  });
  if (!res.ok) {
    throw new Error("QuickBooks sign-in has expired. Reconnect your account.");
  }
  const json = await res.json();
  const next = {
    access_token: json.access_token,
    refresh_token: json.refresh_token || cred.refresh_token,
    expires_at: new Date(
      Date.now() + (json.expires_in || 3600) * 1000
    ).toISOString(),
  };
  await base44.asServiceRole.entities.QuickBooksCredential.update(cred.id, next);
  return {
    token: next.access_token,
    realmId: cred.realm_id,
    environment: cred.environment,
  };
}

export async function qbFetch(
  base44: any,
  shopId: string,
  path: string,
  init: any = {}
) {
  const auth = await accessFor(base44, shopId);
  const res = await fetch(
    `${apiBase(auth.environment)}/v3/company/${auth.realmId}${path}`,
    {
      ...init,
      headers: {
        Authorization: `Bearer ${auth.token}`,
        Accept: "application/json",
        "Content-Type": "application/json",
        ...(init.headers || {}),
      },
      signal: AbortSignal.timeout(20000),
    }
  );
  const text = await res.text();
  let json: any = {};
  try {
    json = text ? JSON.parse(text) : {};
  } catch (e) {
    json = {};
  }
  if (!res.ok) {
    const fault = json?.Fault?.Error?.[0];
    throw new Error(
      fault?.Message || fault?.Detail || `QuickBooks error ${res.status}`
    );
  }
  return json;
}

export async function qbQuery(base44: any, shopId: string, sql: string) {
  const json = await qbFetch(
    base44,
    shopId,
    `/query?query=${encodeURIComponent(sql)}&minorversion=70`
  );
  return json?.QueryResponse || {};
}

// The saved links between a ShopClutter record and its QuickBooks twin. These
// are what stop a second sync run from creating a duplicate.
export async function syncMaps(
  base44: any,
  shopId: string,
  entityName: string
) {
  const found = await base44.asServiceRole.entities.QuickBooksSyncMap.filter(
    { shop_id: shopId, entity_name: entityName },
    { limit: 3000 }
  );
  const list = rows(found);
  const byLocal = new Map<string, any>();
  const byQb = new Map<string, any>();
  list.forEach((row: any) => {
    byLocal.set(row.local_id, row);
    byQb.set(String(row.qb_id), row);
  });
  return { list, byLocal, byQb };
}

export async function rememberMap(
  base44: any,
  shopId: string,
  entityName: string,
  localId: string,
  qbId: string,
  syncToken: string,
  existingId?: string
) {
  const payload = {
    shop_id: shopId,
    entity_name: entityName,
    local_id: localId,
    qb_id: String(qbId),
    qb_sync_token: syncToken || "",
    last_synced_at: new Date().toISOString(),
  };
  const store = base44.asServiceRole.entities.QuickBooksSyncMap;
  if (existingId) return store.update(existingId, payload);
  return store.create(payload);
}

export async function writeLog(base44: any, entry: any) {
  try {
    await base44.asServiceRole.entities.QuickBooksSyncLog.create(entry);
  } catch (e: any) {
    console.error("quickbooks log failed", e?.message);
  }
}