import { createClientFromRequest } from 'npm:@base44/sdk@0.8.49';
import Stripe from 'npm:stripe';
import { secrets } from 'base44:runtime';
import { mapStatus, periodEndIso, updateShop } from "../../shared/stripe.ts";

export default async function (req: Request): Promise<Response> {
  try {
    const raw = await req.text();
    const signature = req.headers.get("stripe-signature") || "";
    const stripe = new Stripe(secrets.get("STRIPE_SECRET_KEY"));

    let event: any;
    try {
      event = await stripe.webhooks.constructEventAsync(
        raw,
        signature,
        secrets.get("STRIPE_WEBHOOK_SECRET")
      );
    } catch (err: any) {
      console.error("Stripe webhook signature check failed", err?.message);
      return Response.json({ error: "Invalid signature" }, { status: 400 });
    }

    const base44 = createClientFromRequest(req);
    const sr = base44.asServiceRole;
    const obj = event?.data?.object || {};
    const shopId = obj?.metadata?.shop_id;
    if (!shopId) {
      return Response.json({ received: true, ignored: "no shop on event" });
    }

    if (event.type === "checkout.session.completed") {
      let subscription: any = null;
      if (obj.subscription) {
        subscription = await stripe.subscriptions.retrieve(obj.subscription);
      }
      await updateShop(sr, shopId, {
        plan_id: obj.metadata?.plan_id,
        plan_status: subscription ? mapStatus(subscription.status) : "active",
        billing_period: obj.metadata?.billing_period,
        stripe_customer_id: obj.customer,
        stripe_subscription_id: obj.subscription,
        current_period_end: periodEndIso(subscription),
        cancel_at_period_end: subscription ? !!subscription.cancel_at_period_end : false,
      });
    } else if (event.type === "customer.subscription.updated") {
      await updateShop(sr, shopId, {
        plan_status: mapStatus(obj.status),
        current_period_end: periodEndIso(obj),
        cancel_at_period_end: !!obj.cancel_at_period_end,
      });
    } else if (event.type === "customer.subscription.deleted") {
      await updateShop(sr, shopId, {
        plan_id: "free",
        plan_status: "active",
        billing_period: "monthly",
        cancel_at_period_end: false,
      });
    }

    return Response.json({ received: true });
  } catch (error: any) {
    console.error("stripeWebhook failed", error?.message);
    return Response.json({ error: error?.message || "Webhook failed" }, { status: 500 });
  }
}