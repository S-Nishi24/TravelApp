import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabaseClient"

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get("code")

  if (code) {
    console.log("[v0] Auth callback received code")

    const { data, error } = await supabase.auth.exchangeCodeForSession(code)

    if (error) {
      console.error("[v0] Auth callback error:", error)
      return NextResponse.redirect(new URL("/login?error=認証に失敗しました", request.url))
    }

    if (data.session) {
      console.log("[v0] Auth callback successful, redirecting to dashboard")
      return NextResponse.redirect(new URL("/dashboard", request.url))
    }
  }

  console.log("[v0] Auth callback - no code or session, redirecting to login")
  return NextResponse.redirect(new URL("/login", request.url))
}
