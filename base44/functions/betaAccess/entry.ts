import { createClientFromRequest } from 'npm:@base44/sdk@0.8.49';
import { secrets } from 'base44:runtime';

// App-owner-only screen behind the Admin menu.
// "list"  -> every shop with its owner and current plan.
// "set"   -> turns full (Multi-Location) access on or off for one shop.
// Plan fields live on the Shop record, which app users cannot write, so this
// function (service role) and Stripe checkout are the only paths that move a plan.
const BETA_PLAN = "enterprise";

export default async function (req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    let user: any = null;
    try {
      user = await base44.auth.me();
    } catch (e) {
      user = null;
    }
    if (!user) {
      return Response.json({ error: "Please sign in." }, { status: 401 });
    }

    const ownerEmail = String(secrets.get("APP_OWNER_EMAIL") || "")
      .trim()
      .toLowerCase();
    const callerEmail = String(user.email || "").trim().toLowerCase();
    const isOwner = !!ownerEmail && callerEmail === ownerEmail;

    const body = await req.json().catch(() => ({}));
    const action = body?.action || "list";

    // The client asks who it is before rendering the owner-only menu item.
    // This is the only action a non-owner may call.
    if (action === "check") {
      return Response.json({ isOwner });
    }

    if (!isOwner) {
      return Response.json(
        { error: "This screen is only available to the app owner." },
        { status: 403 }
      );
    }

    const sr = base44.asServiceRole;

    if (action === "list") {
      const shops = await sr.entities.Shop.list("-created_date", 200);
      const users = await sr.entities.User.list("-created_date", 500);
      const nameByEmail = new Map(
        (users || []).map((u: any) => [
          String(u.email || "").toLowerCase(),
          u.full_name || "",
        ])
      );

      return Response.json({
        shops: (shops || []).map((s: any) => ({
          id: s.id,
          name: s.name,
          owner_email: s.owner_email,
          owner_name: nameByEmail.get(String(s.owner_email || "").toLowerCase()) || "",
          plan_id: s.plan_id || "free",
          plan_status: s.plan_status || "active",
          beta_access: !!s.beta_access,
        })),
      });
    }

    if (action === "set") {
      const shopId = body?.shop_id;
      const enabled = !!body?.enabled;
      if (!shopId) {
        return Response.json({ error: "Missing shop." }, { status: 400 });
      }

      const shop = await sr.entities.Shop.get(shopId).catch(() => null);
      if (!shop) {
        return Response.json({ error: "We could not find that shop." }, { status: 404 });
      }

      if (enabled === !!shop.beta_access) {
        return Response.json({
          shop: {
            id: shop.id,
            plan_id: shop.plan_id || "free",
            plan_status: shop.plan_status || "active",
            beta_access: !!shop.beta_access,
          },
        });
      }

      const patch = enabled
        ? {
            beta_access: true,
            beta_previous_plan_id: shop.plan_id || "free",
            plan_id: BETA_PLAN,
            plan_status: "active",
            cancel_at_period_end: false,
          }
        : {
            beta_access: false,
            plan_id: shop.beta_previous_plan_id || "free",
            plan_status: "active",
          };

      await sr.entities.Shop.update(shopId, patch);
      const fresh = await sr.entities.Shop.get(shopId);

      return Response.json({
        shop: {
          id: fresh.id,
          plan_id: fresh.plan_id || "free",
          plan_status: fresh.plan_status || "active",
          beta_access: !!fresh.beta_access,
        },
      });
    }

    return Response.json({ error: "Unknown action." }, { status: 400 });
  } catch (error: any) {
    console.error("betaAccess failed", error?.message);
    return Response.json(
      { error: error?.message || "Could not update beta access." },
      { status: 500 }
    );
  }
}