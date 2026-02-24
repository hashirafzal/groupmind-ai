import { z } from 'zod'

export const createCheckoutSchema = z.object({
  tier: z.enum(['starter', 'pro', 'enterprise']),
})

export const createPortalSchema = z.object({})

export type CreateCheckoutInput = z.infer<typeof createCheckoutSchema>
export type CreatePortalInput = z.infer<typeof createPortalSchema>
