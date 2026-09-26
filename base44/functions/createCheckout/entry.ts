import { createClientFromRequest } from 'npm:@base44/sdk@0.8.49';
import { getPlan, amountFor } from "../../shared/plans.ts";
import { stripePost, appId, updateShop } from "../../shared/stripe.ts";

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
      return Response.json({ error: "Please sign in before checking out." }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const shopId = body?.shop_id;
    const plan = getPlan(body?.plan_id);
    const billingPeriod = body?.billing_period === "annual" ? "annual" : "monthly";

    if (!shopId) {
      return Response.json({ error: "Missing shop." }, { status: 400 });
    }
    if (plan.monthly <= 0) {
      return Response.json({ error: "That plan is free — no payment needed." }, { status: 400 });
    }

    const shop = await base44.entities.Shop.get(shopId).catch(() => null);
    if (!shop || shop.created_by_id !== user.id) {
      return Response.json({ error: "We could not find your shop." }, { status: 404 });
    }

    let customerId = shop.stripe_customer_id;
    if (!customerId) {
      const customer = await stripePost("/customers", {
        email: user.email,
        name: shop.name || user.full_name || user.email,
        "metadata[base44_app_id]": appId(),
        "metadata[shop_id]": shopId,
      });
      customerId = customer.id;
      await updateShop(base44.asServiceRole, shopId, { stripe_customer_id: customerId });
    }

    const origin = req.headers.get("origin") || "https://shop-clutter.base44.app";
    const amount = amountFor(plan, billingPeriod);
    const label = `${plan.name} (${billingPeriod})`;

    const session = await stripePost("/checkout/sessions", {
      mode: "subscription",
      customer: customerId,
      client_reference_id: shopId,
      "line_items[0][quantity]": "1",
      "line_items[0][price_data][currency]": "usd",
      "line_items[0][price_data][unit_amount]": String(Math.round(amount * 100)),
      "line_items[0][price_data][recurring][interval]":
        billingPeriod === "annual" ? "year" : "month",
      "line_items[0][price_data][product_data][name]": `Shop Clutter ${label}`,
      "metadata[base44_app_id]": appId(),
      "metadata[shop_id]": shopId,
      "metadata[plan_id]": plan.id,
      "metadata[billing_period]": billingPeriod,
      "subscription_data[metadata][base44_app_id]": appId(),
      "subscription_data[metadata][shop_id]": shopId,
      "subscription_data[metadata][plan_id]": plan.id,
      "subscription_data[metadata][billing_period]": billingPeriod,
      success_url: `${origin}/billing?checkout=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/billing?checkout=cancelled`,
    });

    await updateShop(base44.asServiceRole, shopId, {
      plan_id: plan.id,
      plan_status: "pending",
      billing_period: billingPeriod,
    });

    return Response.json({ url: session.url, session_id: session.id });
  } catch (error: any) {
    console.error("createCheckout failed", error?.message);
    return Response.json(
      { error: error?.message || "Could not start checkout." },
      { status: 500 }
    );
  }
}