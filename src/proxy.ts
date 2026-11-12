import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { isValidSession, SESSION_COOKIE } from "@/lib/session";

// Without a valid session, every route except /login goes to /login.
export async function proxy(request: NextRequest) {
  // Server actions check the session themselves (they can be posted to
  // any route, /login included, so the proxy can't guard them) and send
  // the screen to /login. Redirecting them here would only break that.
  if (request.method === "POST" && request.headers.has("next-action")) {
    return NextResponse.next();
  }
  if (await isValidSession(request.cookies.get(SESSION_COOKIE)?.value)) {
    return NextResponse.next();
  }
  return NextResponse.redirect(new URL("/login", request.url));
}

export const config = {
  // Everything but /login, Next's own files and files in public/
  matcher: ["/((?!login$|_next/static|_next/image|favicon\\.ico$|monarch-logo\\.png$).*)"],
};
