import type Stripe from 'stripe';
import { stripe } from './client';

if (!process.env.STRIPE_WEBHOOK_SECRET) {
  console.warn('STRIPE_WEBHOOK_SECRET is not set - webhooks will not be verified');
}

// ============================================================================
// WEBHOOK VERIFICATION
// ============================================================================

export function constructWebhookEvent(
  payload: string | Buffer,
  signature: string
): Stripe.Event {
  if (!process.env.STRIPE_WEBHOOK_SECRET) {
    throw new Error('STRIPE_WEBHOOK_SECRET is not set');
  }

  return stripe.webhooks.constructEvent(
    payload,
    signature,
    process.env.STRIPE_WEBHOOK_SECRET
  );
}

// ============================================================================
// WEBHOOK HANDLER TYPES
// ============================================================================

export type WebhookHandler<T = unknown> = (data: T) => Promise<void>;

export interface WebhookHandlers {
  'checkout.session.completed'?: WebhookHandler<Stripe.Checkout.Session>;
  'customer.subscription.created'?: WebhookHandler<Stripe.Subscription>;
  'customer.subscription.updated'?: WebhookHandler<Stripe.Subscription>;
  'customer.subscription.deleted'?: WebhookHandler<Stripe.Subscription>;
  'invoice.payment_succeeded'?: WebhookHandler<Stripe.Invoice>;
  'invoice.payment_failed'?: WebhookHandler<Stripe.Invoice>;
}

// ============================================================================
// WEBHOOK PROCESSOR
// ============================================================================

export async function processWebhook(
  event: Stripe.Event,
  handlers: WebhookHandlers
): Promise<void> {
  const handler = handlers[event.type as keyof WebhookHandlers];

  if (handler) {
    await handler(event.data.object);
  } else {
    console.log(`Unhandled webhook event: ${event.type}`);
  }
}

// ============================================================================
// EXAMPLE USAGE
// ============================================================================
/*
// In your API route (e.g., /api/webhooks/stripe):

import { constructWebhookEvent, processWebhook } from '@your-app/stripe/webhooks';

export async function POST(request: Request) {
  const payload = await request.text();
  const signature = request.headers.get('stripe-signature')!;

  try {
    const event = constructWebhookEvent(payload, signature);

    await processWebhook(event, {
      'checkout.session.completed': async (session) => {
        // Handle successful checkout
        console.log('Checkout completed:', session.id);
      },
      'customer.subscription.updated': async (subscription) => {
        // Handle subscription update
        console.log('Subscription updated:', subscription.id);
      },
    });

    return new Response('OK', { status: 200 });
  } catch (error) {
    console.error('Webhook error:', error);
    return new Response('Webhook Error', { status: 400 });
  }
}
*/
