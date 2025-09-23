"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabaseClient"
import { useRouter } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import { PrefectureCitySelect } from "@/components/PrefectureCitySelect"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function NewTripPage() {
  const router = useRouter()

  const [title, setTitle] = useState("")
  const [prefecture, setPrefecture] = useState("")  // 追加
  const [cityName, setCityName] = useState("")
  const [cityEn, setCityEn] = useState("")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [budget, setBudget] = useState("")
  const [memo, setMemo] = useState("")
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    let timer: NodeJS.Timeout
    if (success) {
      timer = setTimeout(() => router.push("/dashboard"), 3000)
    }
    return () => clearTimeout(timer)
  }, [success, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess("")
    setLoading(true)

    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError || !user) {
        setError("ログインユーザーが取得できませんでした")
        setLoading(false)
        return
      }

      if (!title || !prefecture || !cityName || !cityEn || !startDate || !endDate) {
        setError("必須項目が入力されていません")
        setLoading(false)
        return
      }

      const { error: insertError } = await supabase.from("trips").insert([
        {
          user_id: user.id,
          title,
          prefecture,       // 追加
          cityName,
          cityEn,
          start_date: startDate,
          end_date: endDate,
          budget: budget ? parseInt(budget, 10) : 0,
          memo,
        },
      ])

      if (insertError) {
        setError(`登録に失敗しました: ${insertError.message}`)
        setLoading(false)
        return
      }

      setSuccess("登録が完了しました！自動でダッシュボードに戻ります…")
      setTitle("")
      setPrefecture("")
      setCityName("")
      setCityEn("")
      setStartDate("")
      setEndDate("")
      setBudget("")
      setMemo("")
    } catch (err) {
      console.error("NewTrip error:", err)
      setError("登録中にエラーが発生しました")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex justify-center pt-16">
      <div className="w-full max-w-2xl">
        <Link href="/dashboard" className="inline-block mb-6 text-sm text-blue-600 hover:text-blue-800">
          <ArrowLeft className="h-4 w-4 mr-2 inline" />
          ダッシュボードへ戻る
        </Link>

        <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">旅行登録</h1>

        <div className="bg-white p-8 rounded-lg shadow-md border border-gray-200">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* タイトル */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">タイトル</label>
              <input
                type="text"
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            {/* 都道府県・都市選択 */}
            <div>
              <PrefectureCitySelect
                onChange={(pref, name, en) => {
                  setPrefecture(pref)
                  setCityName(name)
                  setCityEn(en)
                }}
              />
            </div>

            {/* 開始日・終了日 */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-2">開始日</label>
                <input
                  type="date"
                  id="startDate"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-2">終了日</label>
                <input
                  type="date"
                  id="endDate"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            </div>

            {/* 予算 */}
            <div>
              <label htmlFor="budget" className="block text-sm font-medium text-gray-700 mb-2">予算</label>
              <input
                type="number"
                id="budget"
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* メモ */}
            <div>
              <label htmlFor="memo" className="block text-sm font-medium text-gray-700 mb-2">メモ</label>
              <textarea
                id="memo"
                rows={4}
                value={memo}
                onChange={(e) => setMemo(e.target.value)}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-vertical"
              />
            </div>

            <Button type="submit" disabled={loading} className="w-full">
              {loading ? "登録中..." : "登録"}
            </Button>

            {error && <div className="p-3 rounded-md bg-red-50 text-red-700">{error}</div>}
            {success && <div className="p-3 rounded-md bg-green-50 text-green-700">{success}</div>}
          </form>
        </div>
      </div>
    </div>
  )
}
