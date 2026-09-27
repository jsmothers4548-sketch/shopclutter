import { createClientFromRequest } from 'npm:@base44/sdk@0.8.49';

// Resolves which shop the signed-in user belongs to and returns it.
//
// A user belongs to exactly one shop at a time:
//   1. the shop they are already linked to,
//   2. a shop they own,
//   3. a shop that invited them by email,
//   4. otherwise a brand new shop is created and they become its owner.
//
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
    const record: any = await sr.entities.User.get(user.id).catch(() => null);
    const linkedShopId = record?.shop_id || null;

    const linkUser = async (shopId: string) => {
      if (shopId !== linkedShopId) {
        await sr.entities.User.update(user.id, { shop_id: shopId });
      }
    };

    // 1. Already linked — a shop owner or a staff member.
    if (linkedShopId) {
      const linked = await sr.entities.Shop.filter(
        { id: linkedShopId },
        "-created_date",
        1
      );
      if (Array.isArray(linked) && linked.length) {
        return Response.json({ shop: linked[0], existing: true });
      }
    }

    // 2. A shop they already own.
    const owned = await sr.entities.Shop.filter(
      { owner_id: user.id },
      "-created_date",
      1
    );
    if (Array.isArray(owned) && owned.length) {
      await linkUser(owned[0].id);
      return Response.json({ shop: owned[0], existing: true });
    }

    // 3. A pending invitation from a shop owner.
    const invites = await sr.entities.StaffInvite.filter(
      { email: String(user.email || "").toLowerCase(), status: "pending" },
      "-created_date",
      1
    );
    if (Array.isArray(invites) && invites.length) {
      const invite = invites[0];
      await linkUser(invite.shop_id);
      await sr.entities.StaffInvite.update(invite.id, {
        status: "joined",
        claimed_by_id: user.id,
      });
      const shop = await sr.entities.Shop.get(invite.shop_id).catch(() => null);
      if (shop) {
        return Response.json({ shop, joined: true });
      }
    }

    // 4. Brand new shop.
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

    await linkUser(shop.id);

    // The shop owner runs their own shop, so they hold the admin role.
    if (record && record.role !== "admin") {
      await sr.entities.User.update(user.id, { role: "admin" });
    }

    return Response.json({ shop });
  } catch (error: any) {
    console.error("provisionShop failed", error?.message);
    return Response.json(
      { error: error?.message || "Could not set up your shop." },
      { status: 500 }
    );
  }
}