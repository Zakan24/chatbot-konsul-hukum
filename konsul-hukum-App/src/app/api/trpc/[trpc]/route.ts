import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { type NextRequest } from "next/server";

import { env } from "nvn/env";
import { appRouter } from "nvn/server/api/root";
import { createTRPCContext } from "nvn/server/api/trpc";

/**
 * This wraps the `createTRPCContext` helper and provides the required context for the tRPC API when
 * handling a HTTP request (e.g. when you make requests from Client Components).
 */
const createContext = async (req: NextRequest) => {
  // Try to get IP from standard headers or the raw connection
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0] ||
             req.headers.get("x-real-ip") ||
             req.ip ||
             "127.0.0.1";

  return createTRPCContext({
    headers: req.headers,
    ip,
  });
};

const handler = (req: NextRequest) =>
  fetchRequestHandler({
    endpoint: "/api/trpc",
    req,
    router: appRouter,
    createContext: () => createContext(req),
    onError:
      env.NODE_ENV === "development"
        ? ({ path, error }) => {
            console.error(
              `❌ tRPC failed on ${path ?? "<no-path>"}: ${error.message}`,
            );
          }
        : undefined,
  });

export { handler as GET, handler as POST };
