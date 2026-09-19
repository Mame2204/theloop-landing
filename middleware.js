import { rewrite } from "@vercel/edge";

/**
 * pass.theloop-app.com sert la landing Pass (/pass),
 * pas l'index.html du guide (priorité filesystem Vercel).
 */
export default function middleware(request) {
  const host = (request.headers.get("host") || "").split(":")[0].toLowerCase();
  if (host !== "pass.theloop-app.com") return;

  const url = new URL(request.url);
  if (url.pathname === "/" || url.pathname === "") {
    return rewrite(new URL("/pass/index.html", request.url));
  }
}

export const config = {
  matcher: "/"
};
