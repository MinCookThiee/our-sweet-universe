import { authConfigured, getAuth } from "@/lib/auth";
import { toNextJsHandler } from "better-auth/next-js";
export const dynamic = "force-dynamic";
async function handle(request: Request) {
  if (!authConfigured())
    return Response.json(
      { error: "Private sign-in is not set up yet." },
      { status: 503 },
    );
  const handlers = toNextJsHandler(getAuth());
  return request.method === "GET"
    ? handlers.GET(request)
    : handlers.POST(request);
}
export { handle as GET, handle as POST };
