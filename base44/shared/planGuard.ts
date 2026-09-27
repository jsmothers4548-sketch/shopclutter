// One place where a backend action checks the caller's plan before doing any
// work. The shop and plan are resolved from the signed-in user, never from the
// request body, so a hand-made request cannot claim a plan it does not have.

import { hasFeature, refusalMessage } from "./plans.ts";

export type GuardResult =
  | { ok: true; shop: any }
  | { ok: false; response: Response };

export async function requireFeature(
  base44: any,
  user: any,
  feature: string
): Promise<GuardResult> {
  if (!user) {
    return {
      ok: false,
      response: Response.json(
        { error: "Please sign in to use this tool." },
        { status: 401 }
      ),
    };
  }

  const sr = base44.asServiceRole;
  const linkedShopId = user?.shop_id || user?.data?.shop_id || null;
  let shop: any = null;
  if (linkedShopId) {
    shop = await sr.entities.Shop.get(linkedShopId).catch(() => null);
  }
  if (!shop) {
    const owned = await sr.entities.Shop.filter(
      { owner_id: user.id },
      "-created_date",
      1
    );
    shop = Array.isArray(owned) ? owned[0] : null;
  }
  if (!shop) {
    return {
      ok: false,
      response: Response.json(
        { error: "We could not find your shop yet. Reload the app and try again." },
        { status: 403 }
      ),
    };
  }

  if (!hasFeature(shop.plan_id, feature)) {
    return {
      ok: false,
      response: Response.json({ error: refusalMessage(feature) }, { status: 403 }),
    };
  }

  return { ok: true, shop };
}