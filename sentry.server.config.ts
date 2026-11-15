import * as Sentry from "@sentry/nextjs";

// No DSN means the SDK stays off, so local runs without Sentry still work.
Sentry.init({ dsn: process.env.SENTRY_DSN, tracesSampleRate: 0 });
