"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function SignUpPage() {
  const [username, setUsername] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess("")
    setLoading(true)

    console.log("[v0] Starting signup process", { email, username })

    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, username }),
      })

      const data = await res.json()
      console.log("[v0] Signup API response", { status: res.status, data })

      if (!res.ok) {
        setError(data.error || "新規登録に失敗しました")
        return
      }

      setSuccess("登録完了！確認メールをお送りしました。メール内のリンクをクリックして認証を完了してください。")

      setUsername("")
      setEmail("")
      setPassword("")
    } catch (err) {
      console.error("[v0] Signup error:", err)
      setError("登録中にエラーが発生しました")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <h1 className="text-3xl font-bold text-gray-900 text-center">新規登録</h1>
        <div className="bg-white p-8 rounded-lg shadow-md border border-gray-200">
          <form className="space-y-6" onSubmit={handleSignUp}>
            <div>
              <Label htmlFor="username">ユーザー名</Label>
              <Input
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                minLength={2}
                maxLength={50}
              />
            </div>
            <div>
              <Label htmlFor="email">メールアドレス</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div>
              <Label htmlFor="password">パスワード</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>

            {error && <div className="p-3 rounded-md bg-red-50 text-red-700">{error}</div>}
            {success && <div className="p-3 rounded-md bg-green-50 text-green-700">{success}</div>}

            <div className="space-y-3">
              <Button type="submit" disabled={loading} className="w-full">
                {loading ? "登録中..." : "登録"}
              </Button>
              <Button type="button" variant="outline" onClick={() => router.push("/login")} className="w-full">
                ログイン画面に戻る
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
