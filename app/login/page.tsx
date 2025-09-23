"use client"

import { useState } from "react"
import { supabase } from "@/lib/supabaseClient"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import { usePasswordReset } from "@/hooks/usePasswordReset"

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const { sendResetEmail, message: resetMessage, error: resetError, loading: resetLoading } = usePasswordReset()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password })

      if (error) {
        switch (error.message) {
          case "Invalid login credentials":
            setError("メールアドレスまたはパスワードが正しくありません。")
            break
          case "Email not confirmed":
            setError("メールアドレスの確認が完了していません。メールをご確認ください。")
            break
          default:
            setError("ログインに失敗しました。")
        }
      } else {
        router.push("/dashboard")
      }
    } catch {
      setError("ログイン中にエラーが発生しました")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 text-center">ログイン</h1>
        </div>

        <div className="bg-white p-8 rounded-lg shadow-md border border-gray-200">
          <form className="space-y-6" onSubmit={handleLogin}>
            <div>
              <Label htmlFor="email" className="block text-sm font-medium text-gray-700">
                メールアドレス
              </Label>
              <Input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 w-full"
                placeholder="example@email.com"
              />
            </div>

            <div>
              <Label htmlFor="password" className="block text-sm font-medium text-gray-700">
                パスワード
              </Label>
              <Input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 w-full"
                placeholder="パスワード"
              />
            </div>

            {(error || resetError) && (
              <div className="p-3 rounded-md bg-red-50 text-red-700 text-sm">{error || resetError}</div>
            )}
            {resetMessage && (
              <div className="p-3 rounded-md bg-green-50 text-green-700 text-sm">{resetMessage}</div>
            )}

            <div className="space-y-3">
              <Button type="submit" disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700">
                {loading ? "ログイン中..." : "ログイン"}
              </Button>

              <Button
                type="button"
                variant="outline"
                disabled={resetLoading}
                onClick={() => sendResetEmail(email)}
                className="w-full"
              >
                パスワードを忘れた方はこちら
              </Button>
            </div>

            <div className="flex justify-center">
              <Link href="/signup" className="text-blue-600 hover:text-blue-700">
                新規登録の方はこちら
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
