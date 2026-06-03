export { default } from "next-auth/middleware"

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/workspaces/:path*",
    "/workspace/:path*",
    "/settings/:path*",
    "/app/:path*",
  ],
}
