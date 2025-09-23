"use client"

import ExpensesPieChart from "@/components/ExpensesPieChart"
import BudgetProgress from "@/components/BudgetProgress"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface Expense {
  id: string
  trip_id: string
  title: string
  amount: number
  category: string
  date: string
}

interface DashboardGraphsProps {
  expenses: Expense[]
  budget: number
}

export default function DashboardGraphs({ expenses, budget }: DashboardGraphsProps) {
  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">支出の可視化</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* 左：カテゴリ別円グラフ */}
          <ExpensesPieChart expenses={expenses} />

          {/* 右：予算に対する進捗バー */}
          <BudgetProgress budget={budget} totalExpenses={totalExpenses} />
        </div>
      </CardContent>
    </Card>
  )
}
