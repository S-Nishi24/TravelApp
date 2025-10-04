"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { supabase } from "@/lib/supabaseClient"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

interface User {
  id: string
  email?: string
}

interface Profile {
  username: string
}

export function Header() {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const getUserAndProfile = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      setUser(user)

      if (user) {
        const { data: profileData, error } = await supabase
          .from("profiles")
          .select("username")
          .eq("id", user.id) // profiles.id が auth.users.id と紐づいている
          .single()

        if (error) {
          console.error("プロフィール取得エラー:", error)
        } else {
          setProfile(profileData)
        }
      }

      setLoading(false)
    }

    getUserAndProfile()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        supabase
          .from("profiles")
          .select("username")
          .eq("id", session.user.id)
          .single()
          .then(({ data, error }) => {
            if (!error) setProfile(data)
          })
      } else {
        setProfile(null)
      }
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut()
      router.push("/login")
    } catch (error) {
      console.error("ログアウトエラー:", error)
    }
  }

  if (loading) {
    return null // ローディング中はヘッダーを表示しない
  }

  return (
    <header className="fixed w-full bg-sky-500 border-b border-sky-600 shadow-sm z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link href="/dashboard" title="ダッシュボードへ移動" className="p-2 rounded-lg text-xl font-bold text-white hover:bg-sky-400/80 hover:shadow-md hover:shadow-sky-700/30">
              Travel Planner
            </Link>
          </div>

          <nav className="flex items-center space-x-4 ml-auto">
            <span className="text-white font-medium">{profile?.username || user?.email || "ゲスト"}さん</span>

            <Link href="/profile">
              <Button className="bg-sky-500 text-white border border-white hover:bg-sky-600 hover:text-white">
                マイページ
              </Button>
            </Link>

            <Button
              onClick={handleLogout}
              className="bg-sky-500 text-white border border-white hover:bg-sky-600 hover:text-white"
            >
              ログアウト
            </Button>
          </nav>
        </div>
      </div>
    </header>
  )
}
