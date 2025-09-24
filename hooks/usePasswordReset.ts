"use client"

import { useState } from "react"
import { supabase } from "@/lib/supabaseClient"

/**
 * パスワードリセット用カスタムフック
 */
export function usePasswordReset() {
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const sendResetEmail = async (email: string) => {
    if (!email) {
      setError("メールアドレスが必要です")
      return
    }

    const confirmReset = confirm(
      `登録しているメールアドレス (${email}) にパスワードリセット用のメールを送信します。よろしいですか？`,
    )
    if (!confirmReset) return

    setLoading(true)
    setError(null)
    setMessage(null)

    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${
        process.env.NODE_ENV === "production" ? "https://travel-budget-weather-app.vercel.app" : window.location.origin
      }/reset-password`,
    })

    if (resetError) {
      setError(resetError.message)
    } else {
      setMessage("パスワードリセットメールを送信しました")
    }

    setLoading(false)
  }

  return { sendResetEmail, message, error, loading }
}
