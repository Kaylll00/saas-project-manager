import { withAuth } from "next-auth/middleware"

export default withAuth
export { withAuth as proxy }

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/workspaces/:path*",
    "/workspace/:path*",
    "/settings/:path*",
    "/app/:path*",
  ],
}
