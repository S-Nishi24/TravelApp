"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Edit, Plus, Edit2, Trash2 } from "lucide-react"
import Link from "next/link"
import { supabase } from "@/lib/supabaseClient"
import DashboardGraphs from "@/components/DashboardGraphs"
import Image from "next/image"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface Trip {
  id: string
  title: string
  start_date: string
  end_date: string
  budget: number
  memo: string
  city: string
  cityName: string
  cityEn: string
}

interface Expense {
  id: string
  trip_id: string
  title: string
  amount: number
  category: string
  date: string
}

interface WeatherItem {
  dt_txt: string
  temp: number
  icon: string
  description: string
}

interface WeatherDay {
  date: string
  items: WeatherItem[]
}

export default function TripDetailPage({ params }: { params: { id: string } }) {
  const [trip, setTrip] = useState<Trip | null>(null)
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [weatherDays, setWeatherDays] = useState<WeatherDay[]>([])
  const [weatherError, setWeatherError] = useState<string | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [expenseToDelete, setExpenseToDelete] = useState<string | null>(null)

  // -----------------------
  // trip & expenses取得
  // -----------------------
  useEffect(() => {
    const fetchTrip = async () => {
      const { data, error } = await supabase.from("trips").select("*").eq("id", params.id).single()
      if (error) {
        console.error("Failed to fetch trip:", error)
        return
      }
      setTrip(data)
    }

    const fetchExpenses = async () => {
      const { data, error } = await supabase
        .from("expenses")
        .select("*")
        .eq("trip_id", params.id)
        .order("date", { ascending: true })

      if (error) {
        console.error("Failed to fetch expenses:", error)
        return
      }

      setExpenses(data || [])
    }

    fetchTrip()
    fetchExpenses()
  }, [params.id])

  // -----------------------
  // 天気取得
  // -----------------------
  useEffect(() => {
    if (!trip?.cityEn) return

    const fetchWeather = async () => {
      try {
        // Use secure API route instead of direct API call
        const weatherRes = await fetch(`/api/weather?city=${encodeURIComponent(trip.cityEn)}`)

        if (!weatherRes.ok) {
          const errorData = await weatherRes.json()
          setWeatherError(errorData.error || `天気API呼び出し失敗: ${weatherRes.status}`)
          return
        }

        const weatherData = await weatherRes.json()
        if (!weatherData || !weatherData.list) {
          setWeatherError("天気情報が不正です")
          return
        }

        // 日ごとにグループ化
        const daysMap: Record<string, WeatherItem[]> = {}
        weatherData.list.forEach(
          (item: { dt_txt: string; main: { temp: number }; weather: Array<{ icon: string; description: string }> }) => {
            const date = item.dt_txt.split(" ")[0]
            if (!daysMap[date]) daysMap[date] = []
            daysMap[date].push({
              dt_txt: item.dt_txt,
              temp: Math.round(item.main.temp),
              icon: item.weather[0].icon,
              description: item.weather[0].description,
            })
          },
        )

        const sortedDays: WeatherDay[] = Object.keys(daysMap)
          .sort()
          .map((date) => ({ date, items: daysMap[date] }))

        setWeatherDays(sortedDays)
      } catch (err) {
        console.error("天気情報取得エラー：", err)
        setWeatherError("天気情報取得に失敗しました")
      }
    }

    fetchWeather()
  }, [trip])

  // -----------------------
  // 支出削除操作
  // -----------------------
  const handleDeleteClick = (expenseId: string) => {
    setExpenseToDelete(expenseId)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (!expenseToDelete) return
    const { error } = await supabase.from("expenses").delete().eq("id", expenseToDelete)
    if (error) {
      console.error("削除エラー:", error)
      return
    }
    setExpenses(expenses.filter((expense) => expense.id !== expenseToDelete))
    setDeleteDialogOpen(false)
    setExpenseToDelete(null)
  }

  const cancelDelete = () => {
    setDeleteDialogOpen(false)
    setExpenseToDelete(null)
  }

  const getWeatherIcon = (icon: string) => {
    return (
      <Image
        src={`https://openweathermap.org/img/wn/${icon}@2x.png`}
        alt="Weather icon"
        width={48}
        height={48}
        className="w-12 h-12"
      />
    )
  }

  if (!trip) return <div className="flex justify-center items-center min-h-screen">読み込み中...</div>

  const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0)

  return (
    <div className="flex justify-center p-6 pt-16">
      <div className="w-full max-w-6xl space-y-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">旅行詳細</h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 左側: 旅行概要・天気 */}
          <div className="space-y-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-xl">旅行概要</CardTitle>
                <Link href={`/trips/${params.id}/edit`}>
                  <Button variant="outline" size="sm">
                    <Edit className="h-4 w-4 mr-2" />
                    編集
                  </Button>
                </Link>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold text-lg">{trip.title}</h3>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">開始日:</span>
                    <p className="font-medium">{trip.start_date}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">終了日:</span>
                    <p className="font-medium">{trip.end_date}</p>
                  </div>
                </div>
                <div>
                  <span className="text-gray-600">予算:</span>
                  <p className="font-medium text-lg">¥{trip.budget.toLocaleString()}</p>
                </div>
                <div>
                  <span className="text-gray-600">訪問都市:</span>
                  <p className="font-medium text-lg">{trip.cityName}</p>
                </div>
                <div>
                  <span className="text-gray-600">メモ:</span>
                  <p className="text-sm mt-1">{trip.memo}</p>
                </div>
              </CardContent>
            </Card>

            {/* 天気情報カード */}
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">天気情報：{trip.cityName}（旅行期間中）</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {trip.start_date && trip.end_date ? (
                  (() => {
                    const today = new Date()
                    today.setHours(0, 0, 0, 0)
                    const [, ,] = trip.start_date.split("-").map(Number)
                    const [ey, em, ed] = trip.end_date.split("-").map(Number)
                    const endDate = new Date(ey, em - 1, ed)

                    if (endDate < today) return <p className="text-gray-500">旅行は過去の日程です</p>
                    if (weatherError) return <p className="text-red-500">{weatherError}</p>
                    if (weatherDays.length === 0 && !weatherError) return <p>天気情報を取得中...</p>

                    return weatherDays.map((day) => (
                      <div key={day.date} className="space-y-2">
                        <p className="font-semibold">{day.date}</p>
                        <div className="overflow-x-auto">
                          <div className="flex space-x-4 min-w-max">
                            {day.items.map((item) => (
                              <div key={item.dt_txt} className="flex flex-col items-center min-w-[60px]">
                                <span className="text-xs text-gray-500 mb-1">
                                  {item.dt_txt.split(" ")[1].slice(0, 5)}
                                </span>
                                {getWeatherIcon(item.icon)}
                                <span className="text-xs text-center capitalize">{item.description}</span>
                                <span className="text-sm">{item.temp}°C</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))
                  })()
                ) : (
                  <p>旅行開始日または終了日情報がありません</p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* 右側: 支出履歴 */}
          <div>
            <Card className="h-full">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-xl">支出履歴</CardTitle>
                  <p className="text-sm text-gray-600 mt-1">
                    合計: ¥{totalExpenses.toLocaleString()} / 予算: ¥{trip.budget.toLocaleString()}
                  </p>
                </div>
                <Link href={`/trips/${params.id}/expenses/new`}>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    新規支出登録
                  </Button>
                </Link>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-96">
                  <div className="space-y-3">
                    {expenses.length === 0 ? (
                      <p className="text-gray-500 text-center py-8">支出履歴がありません</p>
                    ) : (
                      expenses.map((expense) => (
                        <div key={expense.id} className="border rounded-lg p-4 hover:bg-gray-50">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <h4 className="font-medium">{expense.title}</h4>
                              <p className="text-sm text-gray-600">{expense.category}</p>
                              <p className="text-xs text-gray-500">{expense.date}</p>
                            </div>
                            <div className="flex items-center space-x-2">
                              <span className="font-semibold text-lg">¥{expense.amount.toLocaleString()}</span>
                              <div className="flex space-x-1">
                                <Link href={`/trips/${params.id}/expenses/${expense.id}/edit`}>
                                  <Button variant="ghost" size="sm">
                                    <Edit2 className="h-4 w-4" />
                                  </Button>
                                </Link>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDeleteClick(expense.id)}
                                  className="text-red-600 hover:text-red-700"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="mt-8">
          <DashboardGraphs expenses={expenses} budget={trip.budget} />
        </div>

        {/* 削除確認ダイアログ */}
        <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>支出を削除</DialogTitle>
              <DialogDescription>この支出を削除してもよろしいですか？この操作は取り消せません。</DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={cancelDelete}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={confirmDelete}>
                OK
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
