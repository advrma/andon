import * as Sentry from "@sentry/nextjs";

// The browser only sees NEXT_PUBLIC_ vars, so the client DSN has its own name.
Sentry.init({ dsn: process.env.NEXT_PUBLIC_SENTRY_DSN, tracesSampleRate: 0 });

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
