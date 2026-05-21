import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const token = searchParams.get("token")

    if (!token) {
      return NextResponse.redirect(new URL("/login?error=invalid-token", req.url))
    }

    const verificationToken = await prisma.verificationToken.findUnique({
      where: { token },
    })

    if (!verificationToken) {
      return NextResponse.redirect(new URL("/login?error=invalid-token", req.url))
    }

    if (verificationToken.expires < new Date()) {
      await prisma.verificationToken.delete({
        where: { token },
      })
      return NextResponse.redirect(new URL("/login?error=token-expired", req.url))
    }

    await prisma.user.update({
      where: { email: verificationToken.identifier },
      data: { emailVerified: new Date() },
    })

    await prisma.verificationToken.delete({
      where: { token },
    })

    return NextResponse.redirect(new URL("/login?verified=true", req.url))
  } catch (error) {
    console.error("Verification error:", error)
    return NextResponse.redirect(new URL("/login?error=verification-failed", req.url))
  }
}
