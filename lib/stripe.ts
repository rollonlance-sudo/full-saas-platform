import Stripe from "stripe";

export const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, { typescript: true })
  : (null as unknown as Stripe);

export const PLANS = {
  free: {
    name: "Free",
    price: 0,
    memberLimit: 5,
    projectLimit: 3,
    storageLimitMb: 100,
    features: [
      "Up to 5 members",
      "3 projects",
      "100 MB storage",
      "30-day task history",
      "Basic collaboration",
    ],
  },
  pro: {
    name: "Pro",
    price: 12,
    priceId: process.env.STRIPE_PRO_PRICE_ID,
    memberLimit: 50,
    projectLimit: -1, // unlimited
    storageLimitMb: 10240,
    features: [
      "Up to 50 members",
      "Unlimited projects",
      "10 GB storage",
      "Unlimited task history",
      "Real-time collaboration",
      "Timeline/Gantt view",
      "Custom fields",
    ],
  },
  enterprise: {
    name: "Enterprise",
    price: 25,
    priceId: process.env.STRIPE_ENTERPRISE_PRICE_ID,
    memberLimit: -1, // unlimited
    projectLimit: -1,
    storageLimitMb: 102400,
    features: [
      "Unlimited members",
      "Unlimited projects",
      "100 GB storage",
      "Unlimited task history",
      "Real-time + version history",
      "Timeline/Gantt view",
      "Custom fields",
      "Admin audit log",
      "Priority support",
      "SSO/SAML",
    ],
  },
} as const;

export type PlanKey = keyof typeof PLANS;
