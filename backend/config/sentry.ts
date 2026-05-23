/**
 * Sentry initialization (env-gated, no-op when SENTRY_DSN is unset).
 *
 * Usage:
 *   import { initSentry, sentryRequestHandler, sentryErrorHandler } from "./config/sentry";
 *   initSentry();
 *   app.use(sentryRequestHandler);
 *   ... routes ...
 *   app.use(sentryErrorHandler);
 */
import * as Sentry from "@sentry/node";
import type { ErrorRequestHandler, RequestHandler } from "express";

let initialized = false;

export function initSentry(): void {
  const dsn = process.env.SENTRY_DSN;
  if (!dsn) return;
  Sentry.init({
    dsn,
    environment: process.env.NODE_ENV || "development",
    release: process.env.RENDER_GIT_COMMIT || process.env.GIT_COMMIT,
    tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,
  });
  initialized = true;
}

export const sentryRequestHandler: RequestHandler = (_req, _res, next) => {
  // @sentry/node v8 uses automatic instrumentation; nothing to do here.
  next();
};

export const sentryErrorHandler: ErrorRequestHandler = (err, _req, _res, next) => {
  if (initialized) {
    Sentry.captureException(err);
  }
  next(err);
};

export function captureMessage(msg: string, level: Sentry.SeverityLevel = "info"): void {
  if (initialized) Sentry.captureMessage(msg, level);
}
