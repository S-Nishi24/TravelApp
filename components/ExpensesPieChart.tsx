"use client"

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface Expense {
  id: string
  trip_id: string
  title: string
  amount: number
  category: string
  date: string
}

interface ExpensesPieChartProps {
  expenses: Expense[]
}

// カテゴリ固定順（日本語）
const CATEGORIES = ["交通費", "宿泊費", "食費", "観光費", "その他"]

// カテゴリ別の色定義（固定順に対応）
const COLORS = ["#82ca9d", "#8884d8", "#ffc658", "#ff7c7c", "#8dd1e1"]

export default function ExpensesPieChart({ expenses }: ExpensesPieChartProps) {
  if (!expenses || expenses.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">支出カテゴリ別内訳</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64 text-gray-500">支出データがありません</div>
        </CardContent>
      </Card>
    )
  }

  // カテゴリごとに集計（日本語カテゴリ対応）
  const categoryTotals: Record<string, number> = {}
  CATEGORIES.forEach((cat) => (categoryTotals[cat] = 0))

  expenses.forEach((expense) => {
    if (CATEGORIES.includes(expense.category)) {
      categoryTotals[expense.category] += expense.amount
    } else {
      categoryTotals["その他"] += expense.amount
    }
  })

  const chartData = CATEGORIES.map((category, index) => ({
    name: category,
    value: categoryTotals[category], // 0 もそのまま
    color: COLORS[index],
  }))

  // カスタムツールチップ
  const CustomTooltip = ({
    active,
    payload,
  }: { active?: boolean; payload?: Array<{ name: string; value: number }> }) => {
    if (active && payload && payload.length) {
      const data = payload[0]
      return (
        <div className="bg-white p-3 border rounded-lg shadow-lg">
          <p className="font-medium">{data.name}</p>
          <p className="text-blue-600">¥{data.value.toLocaleString()}</p>
        </div>
      )
    }
    return null
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">支出カテゴリ別内訳</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-80 mb-6">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={100}
                dataKey="value"
                isAnimationActive={false} // 0 の場合でも安定して描画
              >
                {chartData.map((entry) => (
                  <Cell key={entry.name} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* 日本語凡例 */}
        <div className="grid grid-cols-2 gap-2">
          {chartData.map((entry) => (
            <div key={entry.name} className="flex items-center space-x-2">
              <div className="w-4 h-4 rounded-full" style={{ backgroundColor: entry.color }} />
              <span className="text-sm font-medium">{entry.name}</span>
              <span className="text-sm text-gray-600">¥{entry.value.toLocaleString()}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
