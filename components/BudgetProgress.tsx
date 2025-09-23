"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface BudgetProgressProps {
  budget: number
  totalExpenses: number
}

export default function BudgetProgress({ budget, totalExpenses }: BudgetProgressProps) {
  const percent = budget > 0 ? Math.min((totalExpenses / budget) * 100, 100) : 0

  // 色分け（0~70% 緑、70~100% 黄、100%以上 赤）
  const getColor = (p: number) => {
    if (p < 70) return "bg-green-400"
    if (p <= 100) return "bg-yellow-400"
    return "bg-red-400"
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">予算に対する支出</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-2 text-lg font-medium">
          ¥{totalExpenses.toLocaleString()} / ¥{budget.toLocaleString()}
        </div>
        <div className="mb-1 text-sm text-gray-500">
          使用率: {percent.toFixed(1)}%
        </div>
        {/* 進捗バー */}
        <div className="w-full h-6 bg-gray-200 rounded-full overflow-hidden">
          <div
            className={`h-6 ${getColor(percent)} transition-all duration-500`}
            style={{ width: `${percent}%` }}
          />
        </div>
      </CardContent>
    </Card>
  )
}
