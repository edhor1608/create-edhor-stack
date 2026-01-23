import { z } from 'zod';

// ============================================================================
// CHECKOUT SCHEMAS
// ============================================================================

export const CreateCheckoutSchema = z.object({
  priceId: z.string().startsWith('price_'),
  successUrl: z.string().url(),
  cancelUrl: z.string().url(),
});

export const CheckoutSessionSchema = z.object({
  id: z.string().startsWith('cs_'),
  url: z.string().url().nullable(),
  status: z.enum(['open', 'complete', 'expired']),
  customer: z.string().nullable(),
  subscription: z.string().nullable(),
});

// ============================================================================
// SUBSCRIPTION SCHEMAS
// ============================================================================

export const SubscriptionStatusSchema = z.enum([
  'active',
  'canceled',
  'incomplete',
  'incomplete_expired',
  'past_due',
  'paused',
  'trialing',
  'unpaid',
]);

export const SubscriptionSchema = z.object({
  id: z.string().startsWith('sub_'),
  status: SubscriptionStatusSchema,
  currentPeriodStart: z.number(),
  currentPeriodEnd: z.number(),
  cancelAtPeriodEnd: z.boolean(),
  priceId: z.string(),
});

// ============================================================================
// WEBHOOK SCHEMAS
// ============================================================================

export const WebhookEventSchema = z.object({
  id: z.string().startsWith('evt_'),
  type: z.string(),
  data: z.object({
    object: z.record(z.unknown()),
  }),
});

// ============================================================================
// TYPES
// ============================================================================

export type CreateCheckout = z.infer<typeof CreateCheckoutSchema>;
export type CheckoutSession = z.infer<typeof CheckoutSessionSchema>;
export type SubscriptionStatus = z.infer<typeof SubscriptionStatusSchema>;
export type Subscription = z.infer<typeof SubscriptionSchema>;
export type WebhookEvent = z.infer<typeof WebhookEventSchema>;
