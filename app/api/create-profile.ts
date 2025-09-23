import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

// Supabase Service Role Key をサーバーで使用
const supabaseAdmin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function POST(req: NextRequest) {
  try {
    const { id, username, email } = await req.json()

    const { error } = await supabaseAdmin.from("profiles").insert([{ id, username, email }])

    if (error) throw error

    return NextResponse.json({ message: "Profile created" })
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred"
    return NextResponse.json({ message: errorMessage }, { status: 500 })
  }
}
