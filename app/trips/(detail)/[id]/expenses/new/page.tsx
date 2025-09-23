"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { supabase } from "@/lib/supabaseClient"

interface ExpenseForm {
  title: string
  amount: number
  category: string
  date: string
  memo: string
}

const CATEGORY_OPTIONS = ["交通費", "宿泊費", "食費", "観光費", "その他"]

export default function NewExpensePage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [form, setForm] = useState<ExpenseForm>({
    title: "",
    amount: 0,
    category: CATEGORY_OPTIONS[0],
    date: "",
    memo: "",
  })
  const [message, setMessage] = useState<string | null>(null)

  const handleChange = (field: keyof ExpenseForm, value: string | number) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const { error } = await supabase.from("expenses").insert([
      {
        trip_id: params.id,
        title: form.title,
        amount: form.amount,
        category: form.category,
        date: form.date,
        memo: form.memo,
      },
    ])

    if (error) {
      console.error("登録エラー:", error)
      return
    }

    setMessage("登録が完了しました。")

    // 1.5秒後に旅行詳細画面に遷移
    setTimeout(() => {
      router.push(`/trips/${params.id}`)
    }, 1500)
  }

  return (
    <div className="flex justify-center p-6 pt-16 relative">
      <div className="w-full max-w-2xl">
        <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">新規支出登録</h1>

        <Card>
          <CardHeader>
            <CardTitle>支出情報を入力</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Label htmlFor="title">支出項目</Label>
                <Input
                  id="title"
                  type="text"
                  value={form.title}
                  onChange={(e) => handleChange("title", e.target.value)}
                  placeholder="例: 新幹線代"
                  required
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="amount">金額 (円)</Label>
                <Input
                  id="amount"
                  type="number"
                  value={form.amount}
                  onChange={(e) => handleChange("amount", Number(e.target.value) || 0)}
                  placeholder="例: 13000"
                  min={0}
                  required
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="category">カテゴリ</Label>
                <select
                  id="category"
                  value={form.category}
                  onChange={(e) => handleChange("category", e.target.value)}
                  required
                  className="mt-1 w-full border rounded px-2 py-1"
                >
                  {CATEGORY_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <Label htmlFor="date">日付</Label>
                <Input
                  id="date"
                  type="date"
                  value={form.date}
                  onChange={(e) => handleChange("date", e.target.value)}
                  required
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="memo">メモ</Label>
                <Textarea
                  id="memo"
                  value={form.memo}
                  onChange={(e) => handleChange("memo", e.target.value)}
                  placeholder="必要に応じてメモを入力"
                  rows={3}
                  className="mt-1"
                />
              </div>

              <Button type="submit" className="w-full">
                登録
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* 登録完了メッセージ */}
        {message && (
          <div className="fixed top-20 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-4 py-2 rounded shadow-md transition-opacity duration-500">
            {message}
          </div>
        )}
      </div>
    </div>
  )
}
