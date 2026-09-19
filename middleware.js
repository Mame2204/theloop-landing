import { rewrite } from "@vercel/edge";

/**
 * pass.theloop-app.com/ doit servir la landing Pass.
 * (Le index.html racine est prioritaire sans middleware.)
 * Destination = /pass (cleanUrls), pas /pass/index.html.
 */
export default function middleware(request) {
  const host = (request.headers.get("host") || "").split(":")[0].toLowerCase();
  if (host !== "pass.theloop-app.com") return;

  const url = new URL(request.url);
  if (url.pathname === "/" || url.pathname === "") {
    return rewrite(new URL("/pass", request.url));
  }
}

export const config = {
  matcher: "/"
};
