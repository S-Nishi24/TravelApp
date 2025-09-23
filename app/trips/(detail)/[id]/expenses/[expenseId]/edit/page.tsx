"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft } from "lucide-react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabaseClient"

export default function ExpenseEditPage({
  params,
}: {
  params: { id: string; expenseId: string }
}) {
  const router = useRouter()
  const [formData, setFormData] = useState({
    title: "",
    amount: "",
    category: "",
    date: "",
    memo: "",
  })
  const [message, setMessage] = useState<string | null>(null)

  useEffect(() => {
    const fetchExpense = async () => {
      const { data, error } = await supabase.from("expenses").select("*").eq("id", params.expenseId).single()

      if (error) {
        console.error("支出データ取得エラー:", error)
        return
      }

      if (data) {
        setFormData({
          title: data.title,
          amount: data.amount.toString(),
          category: data.category,
          date: data.date,
          memo: data.memo || "",
        })
      }
    }

    fetchExpense()
  }, [params.expenseId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const { error } = await supabase
      .from("expenses")
      .update({
        title: formData.title,
        amount: Number(formData.amount),
        category: formData.category,
        date: formData.date,
        memo: formData.memo,
      })
      .eq("id", params.expenseId)

    if (error) {
      console.error("更新エラー:", error)
      return
    }

    setMessage("更新が完了しました。")

    // 1.5秒後に旅行詳細画面へ戻る
    setTimeout(() => {
      router.push(`/trips/${params.id}`)
    }, 1500)
  }

  const handleCancel = () => {
    router.push(`/trips/${params.id}`)
  }

  return (
    <div className="flex justify-center p-6 pt-16 relative">
      <div className="w-full max-w-2xl">
        <div className="mb-6">
          <Button variant="ghost" onClick={handleCancel} className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            前の画面に戻る
          </Button>
          <h1 className="text-3xl font-bold text-gray-900 text-center">支出編集</h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>支出情報を編集</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Label htmlFor="title">タイトル</Label>
                <Input
                  id="title"
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>

              <div>
                <Label htmlFor="amount">金額</Label>
                <Input
                  id="amount"
                  type="number"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  required
                />
              </div>

              <div>
                <Label htmlFor="category">カテゴリ</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => setFormData({ ...formData, category: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="カテゴリを選択" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="交通費">交通費</SelectItem>
                    <SelectItem value="宿泊費">宿泊費</SelectItem>
                    <SelectItem value="食費">食費</SelectItem>
                    <SelectItem value="観光費">観光費</SelectItem>
                    <SelectItem value="その他">その他</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="date">日付</Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  required
                />
              </div>

              <div>
                <Label htmlFor="memo">メモ</Label>
                <Textarea
                  id="memo"
                  value={formData.memo}
                  onChange={(e) => setFormData({ ...formData, memo: e.target.value })}
                  rows={3}
                />
              </div>

              <div className="flex space-x-4">
                <Button type="submit" className="flex-1">
                  更新
                </Button>
                <Button type="button" variant="outline" onClick={handleCancel} className="flex-1 bg-transparent">
                  キャンセル
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* 更新完了メッセージ */}
        {message && (
          <div className="fixed top-20 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-4 py-2 rounded shadow-md transition-opacity duration-500">
            {message}
          </div>
        )}
      </div>
    </div>
  )
}
