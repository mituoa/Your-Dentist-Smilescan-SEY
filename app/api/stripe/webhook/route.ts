import { NextRequest, NextResponse } from "next/server";

import { createAdminClient } from "@/lib/supabase/admin";
import { getStripeServer } from "@/lib/stripe/server";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function POST(req: NextRequest) {
  let stripe: ReturnType<typeof getStripeServer>;
  try {
    stripe = getStripeServer();
  } catch {
    return NextResponse.json({ error: "Stripe is not configured" }, { status: 503 });
  }
  const signature = req.headers.get("stripe-signature");
  const secret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!signature || !secret) {
    return NextResponse.json({ error: "Missing webhook configuration" }, { status: 400 });
  }

  const rawBody = await req.text();

  let event: any;
  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, secret);
  } catch {
    console.warn("[stripe/webhook] signature verification failed");
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  let admin: ReturnType<typeof createAdminClient>;
  try {
    admin = createAdminClient();
  } catch {
    return NextResponse.json({ error: "Supabase admin not configured" }, { status: 503 });
  }

  try {
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as any;
      const workspaceId = session?.metadata?.workspace_id as string | undefined;
      const customerId = session?.customer as string | undefined;
      const subscriptionId = session?.subscription as string | undefined;
      const sessionId = session?.id as string | undefined;

      if (!workspaceId) {
        console.warn("[stripe/webhook] checkout.session.completed missing workspace_id in metadata");
        return NextResponse.json({ received: true });
      }
      if (!UUID_RE.test(workspaceId)) {
        console.warn("[stripe/webhook] checkout.session.completed invalid workspace_id format");
        return NextResponse.json({ received: true });
      }

      let currentPeriodEnd: string | null = null;
      if (subscriptionId) {
        const sub: any = await stripe.subscriptions.retrieve(subscriptionId);
        currentPeriodEnd = sub?.current_period_end
          ? new Date(sub.current_period_end * 1000).toISOString()
          : null;
      }

      const { error: upsertError } = await admin.from("workspace_billing").upsert(
        {
          workspace_id: workspaceId,
          status: "active",
          stripe_customer_id: customerId ?? null,
          stripe_subscription_id: subscriptionId ?? null,
          stripe_checkout_session_id: sessionId ?? null,
          current_period_end: currentPeriodEnd,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "workspace_id" }
      );
      if (upsertError) {
        console.error("[stripe/webhook] billing upsert failed", (upsertError as { code?: string }).code ?? "unknown");
      }
    }

    if (event.type === "customer.subscription.updated" || event.type === "customer.subscription.deleted") {
      const sub = event.data.object as any;
      const workspaceId = sub?.metadata?.workspace_id as string | undefined;

      if (!workspaceId) {
        console.warn(`[stripe/webhook] ${event.type} missing workspace_id in metadata`);
        return NextResponse.json({ received: true });
      }
      if (!UUID_RE.test(workspaceId)) {
        console.warn(`[stripe/webhook] ${event.type} invalid workspace_id format`);
        return NextResponse.json({ received: true });
      }

      const status =
        sub.status === "active"
          ? "active"
          : sub.status === "past_due"
            ? "past_due"
            : sub.status === "canceled"
              ? "canceled"
              : "pending";

      const currentPeriodEnd = sub.current_period_end
        ? new Date(sub.current_period_end * 1000).toISOString()
        : null;

      const { error: upsertError } = await admin.from("workspace_billing").upsert(
        {
          workspace_id: workspaceId,
          status,
          stripe_customer_id: sub.customer ?? null,
          stripe_subscription_id: sub.id ?? null,
          current_period_end: currentPeriodEnd,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "workspace_id" }
      );
      if (upsertError) {
        console.error("[stripe/webhook] billing upsert failed", (upsertError as { code?: string }).code ?? "unknown");
      }
    }
  } catch (e) {
    const msg = e instanceof Error ? e.message : "unknown";
    console.error("[stripe/webhook] handler error", msg);
    return NextResponse.json({ error: "Webhook handler error" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}

