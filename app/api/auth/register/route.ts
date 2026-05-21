import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { prisma } from "@/lib/prisma"
import { resend } from "@/lib/resend"
import crypto from "crypto"

export async function POST(req: Request) {
  try {
    const { name, email, password } = await req.json()

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters" },
        { status: 400 }
      )
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      return NextResponse.json(
        { error: "User with this email already exists" },
        { status: 400 }
      )
    }

    const passwordHash = await bcrypt.hash(password, 10)

    const user = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash,
      },
    })

    const token = crypto.randomBytes(32).toString("hex")
    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000)

    await prisma.verificationToken.create({
      data: {
        identifier: email,
        token,
        expires,
      },
    })

    const verificationUrl = `${process.env.NEXTAUTH_URL}/api/auth/verify-email?token=${token}`

    console.log("Attempting to send verification email to:", email)
    console.log("Verification URL:", verificationUrl)

    try {
      const emailResult = await resend.emails.send({
        from: "Stride <onboarding@resend.dev>",
        to: email,
        subject: "Verify your email address",
        html: `
          <!DOCTYPE html>
          <html>
            <head>
              <style>
                body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: linear-gradient(135deg, #6366f1 0%, #a855f7 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                .header h1 { color: white; margin: 0; font-size: 28px; }
                .content { background: #f8fafc; padding: 40px 30px; border-radius: 0 0 10px 10px; }
                .button { display: inline-block; background: linear-gradient(135deg, #6366f1 0%, #a855f7 100%); color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 20px 0; }
                .footer { text-align: center; margin-top: 30px; color: #64748b; font-size: 14px; }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <h1>Welcome to Stride!</h1>
                </div>
                <div class="content">
                  <h2>Hi ${name},</h2>
                  <p>Thanks for signing up! Please verify your email address to get started.</p>
                  <p style="text-align: center;">
                    <a href="${verificationUrl}" class="button">Verify Email Address</a>
                  </p>
                  <p style="color: #64748b; font-size: 14px;">Or copy and paste this link into your browser:</p>
                  <p style="color: #64748b; font-size: 12px; word-break: break-all;">${verificationUrl}</p>
                  <p style="color: #64748b; font-size: 14px; margin-top: 30px;">This link will expire in 24 hours.</p>
                </div>
                <div class="footer">
                  <p>If you didn't create an account, you can safely ignore this email.</p>
                </div>
              </div>
            </body>
          </html>
        `,
      })
      
      console.log("Email sent successfully:", emailResult)
    } catch (emailError) {
      console.error("Failed to send verification email:", emailError)
      await prisma.user.delete({ where: { id: user.id } })
      await prisma.verificationToken.delete({ where: { token } })
      return NextResponse.json(
        { error: "Failed to send verification email" },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { 
        message: "Registration successful! Please check your email to verify your account.",
        userId: user.id 
      },
      { status: 201 }
    )
  } catch (error) {
    console.error("Registration error:", error)
    return NextResponse.json(
      { error: "Failed to create user" },
      { status: 500 }
    )
  }
}
