"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Trash2, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { supabase } from "@/lib/supabaseClient"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { PrefectureCitySelect } from "@/components/PrefectureCitySelect"

interface Trip {
  id: string
  title: string
  start_date: string
  end_date: string
  budget: number
  memo: string
  prefecture: string
  cityName: string
  cityEn: string
}

export default function EditTripPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [trip, setTrip] = useState<Trip>({
    id: params.id,
    title: "",
    start_date: "",
    end_date: "",
    budget: 0,
    memo: "",
    prefecture: "",
    cityName: "",
    cityEn: "",
  })
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  // -----------------------
  // 旅行情報取得
  // -----------------------
  useEffect(() => {
    const fetchTrip = async () => {
      const { data, error } = await supabase
        .from("trips")
        .select("*")
        .eq("id", params.id)
        .single()

      if (error) {
        console.error("旅行取得エラー:", error)
        return
      }

      setTrip(data)
    }

    fetchTrip()
  }, [params.id])

  const handleInputChange = (field: keyof Trip, value: string | number) => {
    setTrip((prev) => ({ ...prev, [field]: value }))
  }

  // -----------------------
  // 更新処理
  // -----------------------
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null) // 送信前にリセット

    const start = new Date(trip.start_date)
    const end = new Date(trip.end_date)

    if (end < start) {
      setError("終了日は開始日以降の日付を選択してください。")
      return
    }

    const { error } = await supabase
      .from("trips")
      .update({
        title: trip.title,
        start_date: trip.start_date,
        end_date: trip.end_date,
        budget: trip.budget,
        memo: trip.memo,
        prefecture: trip.prefecture,
        cityName: trip.cityName,
        cityEn: trip.cityEn,
      })
      .eq("id", trip.id)

    if (error) {
      console.error("更新エラー:", error)
      setError("旅行情報の更新に失敗しました。")
      return
    }

    router.push(`/trips/${trip.id}`)
  }

  // -----------------------
  // 削除処理
  // -----------------------
  const handleDelete = async () => {
    const { error } = await supabase.from("trips").delete().eq("id", trip.id)

    if (error) {
      console.error("削除エラー:", error)
      return
    }

    setDeleteDialogOpen(false)
    setMessage("削除が完了しました")

    setTimeout(() => {
      router.push("/dashboard")
    }, 1500)
  }

  return (
    <div className="flex justify-center p-6 pt-16 relative">
      <div className="w-full max-w-2xl">
        <div className="mb-6">
          <Link href={`/trips/${params.id}`} className="inline-flex items-center text-blue-600 hover:text-blue-700">
            <ArrowLeft className="h-4 w-4 mr-2" />
            旅行詳細に戻る
          </Link>
        </div>

        <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">旅行編集</h1>

        <Card>
          <CardHeader>
            <CardTitle>旅行情報を編集</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* タイトル */}
              <div>
                <Label htmlFor="title">旅行タイトル</Label>
                <Input
                  id="title"
                  type="text"
                  value={trip.title}
                  onChange={(e) => handleInputChange("title", e.target.value)}
                  placeholder="旅行のタイトルを入力してください"
                  required
                  className="mt-1"
                />
              </div>

              {/* 都道府県・都市選択 */}
              <div>
                <Label>訪問地</Label>
                <PrefectureCitySelect
                  initialPrefecture={trip.prefecture}
                  initialCityName={trip.cityName}
                  initialCityEn={trip.cityEn}
                  onChange={(pref, name, en) =>
                    setTrip((prev) => ({ ...prev, prefecture: pref, cityName: name, cityEn: en }))
                  }
                />
              </div>

              {/* 日付 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="start_date">開始日</Label>
                  <Input
                    id="start_date"
                    type="date"
                    value={trip.start_date}
                    onChange={(e) => handleInputChange("start_date", e.target.value)}
                    required
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="end_date">終了日</Label>
                  <Input
                    id="end_date"
                    type="date"
                    value={trip.end_date}
                    min={trip.start_date || undefined} // 開始日より前を選べないように
                    onChange={(e) => handleInputChange("end_date", e.target.value)}
                    required
                    className="mt-1"
                  />
                </div>
              </div>

              {/* 予算 */}
              <div>
                <Label htmlFor="budget">予算 (円)</Label>
                <Input
                  id="budget"
                  type="number"
                  value={trip.budget}
                  onChange={(e) => handleInputChange("budget", Number(e.target.value) || 0)}
                  placeholder="予算を入力してください"
                  min={0}
                  required
                  className="mt-1"
                />
              </div>

              {/* メモ */}
              <div>
                <Label htmlFor="memo">メモ</Label>
                <Textarea
                  id="memo"
                  value={trip.memo}
                  onChange={(e) => handleInputChange("memo", e.target.value)}
                  placeholder="旅行に関するメモを入力してください"
                  rows={4}
                  className="mt-1"
                />
              </div>

              {/* エラー表示 */}
              {error && (
                <div className="p-3 rounded-md bg-red-50 text-red-700">
                  {error}
                </div>
              )}

              {/* ボタン */}
              <div className="flex flex-col space-y-3">
                <Button type="submit" className="w-full">
                  旅行を更新
                </Button>

                <Button type="button" variant="destructive" onClick={() => setDeleteDialogOpen(true)} className="w-full">
                  <Trash2 className="h-4 w-4 mr-2" />
                  旅行を削除
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* 削除確認ダイアログ */}
        <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>旅行を削除</DialogTitle>
              <DialogDescription>
                この旅行を削除してもよろしいですか？この操作は取り消せません。
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
                キャンセル
              </Button>
              <Button variant="destructive" onClick={handleDelete}>
                OK
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* 削除完了メッセージ */}
        {message && (
          <div className="fixed top-20 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-4 py-2 rounded shadow-md transition-opacity duration-500">
            {message}
          </div>
        )}
      </div>
    </div>
  )
}
