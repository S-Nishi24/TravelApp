import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabaseAdmin"

export async function POST(req: Request) {
  try {
    const { email, password, username } = await req.json()

    console.log("[v0] Signup API called", { email, username })

    if (!email || !password || !username) {
      return NextResponse.json({ error: "必須項目が不足しています" }, { status: 400 })
    }

    if (password.length < 6) {
      return NextResponse.json({ error: "パスワードは6文字以上必要です" }, { status: 400 })
    }

    if (username.length < 2 || username.length > 50) {
      return NextResponse.json({ error: "ユーザー名は2文字以上50文字以下で入力してください" }, { status: 400 })
    }

    const { data: userData, error: authError } = await supabaseAdmin.auth.signUp({
      email,
      password,
      options: {
        data: {
          username: username,
        },
        emailRedirectTo: `${process.env.NODE_ENV === "production"
            ? "https://travel-budget-weather-app.vercel.app"
            : process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL || "http://localhost:3000"
          }/dashboard`,
      },
    })

    if (authError) {
      console.error("[v0] Auth creation error:", authError)
      return NextResponse.json(
        {
          error: `登録エラー: ${authError.message}`,
        },
        { status: 500 },
      )
    }

    if (!userData.user) {
      console.error("[v0] No user data returned")
      return NextResponse.json(
        {
          error: "ユーザー作成に失敗しました",
        },
        { status: 500 },
      )
    }

    console.log("[v0] User created successfully:", userData.user.id)

    const { error: profileError } = await supabaseAdmin.from("profiles").insert({
      id: userData.user.id,
      username: username,
      email: email,
    })

    if (profileError) {
      console.error("[v0] Profile creation error:", profileError)
      // Don't fail the signup if profile creation fails, as the trigger should handle it
      console.log("[v0] Profile creation failed, but user was created. Trigger should handle profile creation.")
    } else {
      console.log("[v0] Profile created successfully")
    }

    return NextResponse.json({
      message:
        "ユーザー登録が完了しました！確認メールをお送りしましたので、メール内のリンクをクリックして認証を完了してください。",
    })
  } catch (err) {
    console.error("[v0] Unexpected signup error:", err)
    return NextResponse.json({ error: "サーバーエラーが発生しました" }, { status: 500 })
  }
}
