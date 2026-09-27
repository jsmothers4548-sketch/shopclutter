import { createClientFromRequest } from 'npm:@base44/sdk@0.8.49';
import {
  stripePost,
  stripeGet,
  mapStatus,
  periodEndIso,
  updateShop,
} from "../../shared/stripe.ts";

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

    const body = await req.json().catch(() => ({}));
    const action = body?.action;
    if (!body?.shop_id) {
      return Response.json({ error: "Missing shop." }, { status: 400 });
    }
    const shop = await base44.entities.Shop.get(body.shop_id).catch(() => null);
    if (!shop) {
      return Response.json({ error: "We could not find your shop." }, { status: 404 });
    }
    if (shop.owner_id !== user.id) {
      return Response.json(
        { error: "Only the shop owner can change the plan." },
        { status: 403 }
      );
    }
    const sr = base44.asServiceRole;

    if (action === "confirm") {
      const sessionId = body?.session_id;
      if (!sessionId) {
        return Response.json({ error: "Missing checkout session." }, { status: 400 });
      }
      const session = await stripeGet(`/checkout/sessions/${encodeURIComponent(sessionId)}`);
      if (session.metadata?.shop_id && session.metadata.shop_id !== shop.id) {
        return Response.json({ error: "That checkout belongs to another shop." }, { status: 403 });
      }
      if (session.payment_status !== "paid" && session.status !== "complete") {
        return Response.json({ error: "Payment has not completed yet." }, { status: 409 });
      }

      let subscription: any = null;
      if (session.subscription) {
        subscription = await stripeGet(`/subscriptions/${session.subscription}`);
      }

      await updateShop(sr, shop.id, {
        plan_id: session.metadata?.plan_id,
        plan_status: subscription ? mapStatus(subscription.status) : "active",
        billing_period: session.metadata?.billing_period,
        stripe_customer_id: session.customer,
        stripe_subscription_id: session.subscription,
        current_period_end: periodEndIso(subscription),
        cancel_at_period_end: subscription ? !!subscription.cancel_at_period_end : false,
      });

      const fresh = await base44.entities.Shop.get(shop.id);
      return Response.json({ shop: fresh, message: "Your plan is now active." });
    }

    if (action === "cancel") {
      if (shop.stripe_subscription_id) {
        const sub = await stripePost(`/subscriptions/${shop.stripe_subscription_id}`, {
          cancel_at_period_end: "true",
        });
        await updateShop(sr, shop.id, {
          cancel_at_period_end: true,
          current_period_end: periodEndIso(sub),
        });
        const fresh = await base44.entities.Shop.get(shop.id);
        return Response.json({
          shop: fresh,
          message: "Your plan stays active until the end of the billing period, then moves to Solo.",
        });
      }
      await updateShop(sr, shop.id, {
        plan_id: "free",
        plan_status: "active",
        billing_period: "monthly",
        cancel_at_period_end: false,
      });
      const fresh = await base44.entities.Shop.get(shop.id);
      return Response.json({ shop: fresh, message: "You are now on the Solo plan." });
    }

    if (action === "resume") {
      if (!shop.stripe_subscription_id) {
        return Response.json({ error: "You do not have a subscription to resume." }, { status: 400 });
      }
      const sub = await stripePost(`/subscriptions/${shop.stripe_subscription_id}`, {
        cancel_at_period_end: "false",
      });
      await updateShop(sr, shop.id, {
        cancel_at_period_end: false,
        current_period_end: periodEndIso(sub),
      });
      const fresh = await base44.entities.Shop.get(shop.id);
      return Response.json({ shop: fresh, message: "Your plan will continue." });
    }

    return Response.json({ error: "Unknown action." }, { status: 400 });
  } catch (error: any) {
    console.error("managePlan failed", error?.message);
    return Response.json({ error: error?.message || "Could not update your plan." }, { status: 500 });
  }
}