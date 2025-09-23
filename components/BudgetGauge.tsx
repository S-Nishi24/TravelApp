"use client"

import { RadialBarChart, RadialBar, ResponsiveContainer } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface BudgetGaugeProps {
  budget: number
  totalExpenses: number
  className?: string // Tailwind 用
}

export default function BudgetGauge({ budget, totalExpenses, className }: BudgetGaugeProps) {
  // 支出割合（％）
  const percent = Math.min((totalExpenses / budget) * 100, 100)

  // 色分け（0~70% 緑、70~100% 黄色、100%以上 赤）
  const getColor = (p: number) => {
    if (p < 70) return "#4ade80" // 緑
    if (p <= 100) return "#facc15" // 黄色
    return "#f87171" // 赤
  }

  const data = [
    {
      name: "使用率",
      value: percent,
      fill: getColor(percent),
    },
  ]

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-xl">予算に対する支出</CardTitle>
      </CardHeader>
      <CardContent className="flex justify-center items-center">
        <div className="w-40 h-40">
          <ResponsiveContainer width="100%" height="100%">
            <RadialBarChart
              cx="50%"
              cy="50%"
              innerRadius="70%"
              outerRadius="100%"
              barSize={20}
              data={data}
              startAngle={180}
              endAngle={0}
            >
              {/* @ts-ignore: Recharts の型定義が JSX に対応していないため */}
              <RadialBar background dataKey="value" cornerRadius={10} />
            </RadialBarChart>
          </ResponsiveContainer>
        </div>
        <div className="ml-4">
          <p className="text-lg font-medium">
            ¥{totalExpenses.toLocaleString()} / ¥{budget.toLocaleString()}
          </p>
          <p className="text-sm text-gray-500">使用率: {percent.toFixed(1)}%</p>
        </div>
      </CardContent>
    </Card>
  )
}
