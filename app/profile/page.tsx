"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabaseClient"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { usePasswordReset } from "@/hooks/usePasswordReset"

export default function ProfilePage() {
  const router = useRouter()
  const [username, setUsername] = useState("")
  const [email, setEmail] = useState("")
  const [isEditing, setIsEditing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [isDeleting, setIsDeleting] = useState(false)

  const { sendResetEmail, message: resetMessage, error: resetError, loading: resetLoading } = usePasswordReset()

  useEffect(() => {
    const fetchUserProfile = async () => {
      console.log("[v0] プロフィール取得開始")
      setLoading(true)

      try {
        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession()
        if (sessionError || !session) {
          console.log("[v0] セッション取得エラー:", sessionError)
          setError("ログインが必要です")
          router.push("/login")
          return
        }

        console.log("[v0] セッション取得成功")

        // サーバーサイドAPIを呼び出してプロフィールを取得
        const response = await fetch("/api/profile", {
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || "プロフィール取得に失敗しました")
        }

        const { profile } = await response.json()
        console.log("[v0] プロフィール取得成功:", profile)

        setUsername(profile.username || "")
        setEmail(profile.email || session.user.email || "")
      } catch (error) {
        console.error("[v0] プロフィール取得エラー:", error)
        setError(error instanceof Error ? error.message : "プロフィール情報を取得できませんでした")
      } finally {
        setLoading(false)
      }
    }
    fetchUserProfile()
  }, [router])

  const handleSave = async () => {
    setError(null)
    setMessage(null)

    try {
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession()
      if (sessionError || !session) {
        setError("ログインが必要です")
        return
      }

      const response = await fetch("/api/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ username, email }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "プロフィール更新に失敗しました")
      }

      setIsEditing(false)
      setMessage("プロフィールを更新しました")
      setTimeout(() => setMessage(null), 2000)
    } catch (err) {
      console.error("[v0] プロフィール更新エラー:", err)
      setError(err instanceof Error ? err.message : "プロフィール更新に失敗しました")
    }
  }

  // 退会処理（DB削除 + Auth削除）
  const handleDeleteAccount = async () => {
    const confirmDelete = confirm(
      "本当にアカウントを削除しますか？この操作は取り消せません。"
    )
    if (!confirmDelete) return

    setIsDeleting(true)
    setError(null)
    setMessage(null)

    try {
      // 1. セッション取得
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession()

      if (sessionError || !session) {
        setError("ログインが必要です")
        setIsDeleting(false)
        return
      }

      const userId = session.user.id

      // 2. route.ts へ POST リクエスト
      const response = await fetch("/api/delete-account", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || "退会処理中にエラーが発生しました")
      } else {
        setMessage("退会処理が完了しました。ログイン画面に移動します。")
        setTimeout(() => router.push("/login"), 2000)
      }
    } catch (err) {
      console.error("[ProfilePage] 退会処理エラー:", err)
      setError(err instanceof Error ? err.message : "退会処理中にエラーが発生しました")
    } finally {
      setIsDeleting(false)
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-16 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto">
          <div className="text-center">読み込み中...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-16 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <Link href="/dashboard" className="text-blue-600 hover:text-blue-700 text-sm sm:text-base">
            ← ダッシュボードに戻る
          </Link>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-xl sm:text-2xl">ユーザー情報</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {error && <p className="text-red-500 text-sm">{error}</p>}
            {message && <div className="bg-green-500 text-white px-4 py-2 rounded-md text-sm">{message}</div>}
            {resetError && <p className="text-red-500 text-sm">{resetError}</p>}
            {resetMessage && <div className="bg-green-500 text-white px-4 py-2 rounded-md text-sm">{resetMessage}</div>}

            <div className="space-y-4">
              <div>
                <Label htmlFor="username" className="block text-sm font-medium text-gray-700">
                  ユーザー名
                </Label>
                <Input
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  disabled={!isEditing}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  メールアドレス
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={!isEditing}
                  className="mt-1"
                />
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                {isEditing ? (
                  <>
                    <Button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700">
                      保存
                    </Button>
                    <Button variant="outline" onClick={() => setIsEditing(false)}>
                      キャンセル
                    </Button>
                  </>
                ) : (
                  <Button onClick={() => setIsEditing(true)} variant="outline">
                    編集
                  </Button>
                )}
              </div>
            </div>

            <Separator />

            <div className="space-y-4">
              <h3 className="text-lg font-medium">セキュリティ</h3>
              <Button
                onClick={() => sendResetEmail(email)}
                variant="outline"
                disabled={resetLoading}
                className="w-full sm:w-auto"
              >
                パスワードをリセット
              </Button>
            </div>

            <Separator />

            <div className="mt-6">
              <h3 className="text-lg font-medium text-red-600">危険な操作</h3>
              <Button
                onClick={handleDeleteAccount}
                disabled={isDeleting}
                variant="destructive"
                className="w-full sm:w-auto py-2 px-4"
              >
                {isDeleting ? "退会処理中..." : "退会"}
              </Button>
            </div>

            {error && <p className="text-red-500 mt-2">{error}</p>}
            {message && <p className="text-green-500 mt-2">{message}</p>}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
