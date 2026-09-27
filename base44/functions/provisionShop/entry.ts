import { createClientFromRequest } from 'npm:@base44/sdk@0.8.49';

// Creates the signed-in user's shop the first time they load the app.
// Plan and billing fields are never taken from the caller — a new shop always
// starts on the free plan, and only checkout or the app owner's beta switch
// can move it. The shop record itself is closed to app users for writes.
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

    const sr = base44.asServiceRole;

    const existing = await sr.entities.Shop.filter(
      { owner_id: user.id },
      "-created_date",
      1
    );
    if (Array.isArray(existing) && existing.length) {
      return Response.json({ shop: existing[0], existing: true });
    }

    const body = await req.json().catch(() => ({}));
    const firstName = String(body?.first_name || "").trim();
    const name = firstName ? `${firstName}'s Shop` : "My Shop";

    const shop = await sr.entities.Shop.create({
      name,
      owner_id: user.id,
      owner_email: user.email,
      plan_id: "free",
      plan_status: "active",
      billing_period: "monthly",
      cancel_at_period_end: false,
      locations: 1,
      beta_access: false,
    });

    return Response.json({ shop });
  } catch (error: any) {
    console.error("provisionShop failed", error?.message);
    return Response.json(
      { error: error?.message || "Could not set up your shop." },
      { status: 500 }
    );
  }
}