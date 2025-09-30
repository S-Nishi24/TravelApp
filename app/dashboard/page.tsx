"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { supabase } from "@/lib/supabaseClient"
import { Cloud, Calendar, DollarSign } from "lucide-react"
import Image from "next/image"

interface Trip {
  id: string
  title: string
  start_date: string
  end_date: string
  budget: number
  cityName: string
  cityEn: string
}

interface Forecast {
  dt_txt: string
  temp: number
  condition: string
  icon: string
}

export default function DashboardPage() {
  const router = useRouter()
  const [trips, setTrips] = useState<Trip[]>([])
  const [forecast, setForecast] = useState<Forecast[]>([])
  const [weatherError, setWeatherError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  // ログインチェック + trips取得
  useEffect(() => {
    const init = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        router.replace("/login") // 未ログインなら /login へ
        return
      }

      const { data, error } = await supabase
        .from("trips")
        .select("*")
        .eq("user_id", user.id)
        .order("start_date", { ascending: false })

      if (error) {
        console.error("Failed to fetch trips:", error)
      } else if (data) {
        setTrips(data)
      }

      setLoading(false)
    }

    init()
  }, [router])

  const today = new Date()
  const nearestTrip =
    trips
      .filter((trip) => new Date(trip.start_date) >= today)
      .sort((a, b) => new Date(a.start_date).getTime() - new Date(b.start_date).getTime())[0] || null

  // 天気取得
  useEffect(() => {
    const fetchWeather = async () => {
      if (!nearestTrip) return
      try {
        const res = await fetch(`/api/weather?city=${encodeURIComponent(nearestTrip.cityEn)}`)

        if (!res.ok) {
          const errorData = await res.json()
          setWeatherError(errorData.error || `天気API呼び出し失敗: ${res.status}`)
          return
        }

        const data = await res.json()
        if (!data.list) {
          setWeatherError("天気データが不正です")
          return
        }

        const tripStartDateStr = nearestTrip.start_date.split("T")[0]
        const filtered: Forecast[] = data.list
          .filter((item: { dt_txt: string }) => item.dt_txt.startsWith(tripStartDateStr))
          .map(
            (item: {
              dt_txt: string
              main: { temp: number }
              weather: Array<{ description: string; icon: string }>
            }) => ({
              dt_txt: item.dt_txt,
              temp: Math.round(item.main.temp),
              condition: item.weather[0].description,
              icon: item.weather[0].icon,
            }),
          )

        setForecast(filtered)
      } catch (err) {
        console.error("天気情報の取得に失敗しました:", err)
        setWeatherError("天気情報の取得に失敗しました")
      }
    }

    fetchWeather()
  }, [nearestTrip])

  const formatTripDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString("ja-JP", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    })

  if (loading) {
    return <p className="p-4">読み込み中...</p>
  }

  return (
    <div className="p-4 pt-16 h-screen flex flex-col lg:flex-row gap-6">
      {/* 左側 旅行一覧 */}
      <div className="w-full lg:w-64 h-[40vh] lg:h-[80vh] flex-shrink-0">
        <Card className="h-full flex flex-col">
          <CardHeader className="flex items-center justify-between">
            <CardTitle className="text-lg">旅行一覧</CardTitle>
            <Button onClick={() => router.push("/trips/new")} className="bg-blue-600 hover:bg-blue-700" size="sm">
              新規登録
            </Button>
          </CardHeader>
          <CardContent className="p-0 flex-1 overflow-hidden">
            <ScrollArea className="h-full">
              <div className="p-4 space-y-3">
                {trips.length > 0 ? (
                  trips.map((trip) => (
                    <div
                      key={trip.id}
                      className="p-3 border rounded-lg cursor-pointer hover:bg-gray-50"
                      onClick={() => router.push(`/trips/${trip.id}`)}
                    >
                      <h3 className="font-medium text-sm">{trip.title}</h3>
                      <p className="text-xs text-gray-600 mt-1">
                        {formatTripDate(trip.start_date)} 〜 {formatTripDate(trip.end_date)}
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-sm">旅行が登録されていません</p>
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      {/* 右側 次の旅行 */}
      <div className="flex-1">
        <Card className="h-full">
          <CardHeader>
            <CardTitle className="text-2xl flex items-center gap-2">
              <Calendar className="w-6 h-6 text-blue-600" />
              次の旅行情報
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {nearestTrip ? (
              <>
                {/* 基本情報 */}
                <div>
                  <h2 className="text-3xl font-bold text-blue-600 mb-2">{nearestTrip.title}</h2>
                  <p className="text-lg text-gray-700">
                    {formatTripDate(nearestTrip.start_date)} 〜 {formatTripDate(nearestTrip.end_date)}
                  </p>
                  <p className="text-md text-gray-600 mt-2 flex items-center gap-1">
                    <DollarSign className="w-4 h-4 text-green-600" />
                    予算: ¥{nearestTrip.budget.toLocaleString()}
                  </p>
                  <p className="text-md text-gray-600 flex items-center gap-1">
                    <Cloud className="w-4 h-4 text-blue-500" />
                    都市: {nearestTrip.cityName}
                  </p>
                </div>

                {/* ボタン */}
                <div className="flex flex-wrap gap-2">
                  <Button
                    onClick={() => router.push(`/trips/${nearestTrip.id}`)}
                    className="bg-gray-500 hover:bg-gray-600"
                  >
                    詳細確認
                  </Button>
                  <Button
                    onClick={() => router.push(`/trips/${nearestTrip.id}/expenses/new`)}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    支出登録
                  </Button>
                </div>

                {/* 天気情報 */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-xl flex items-center gap-2">
                      <Cloud className="w-5 h-5 text-blue-500" />
                      旅行当日の天気（3時間ごと）
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-2">
                    {forecast.length > 0 ? (
                      <div className="overflow-x-auto">
                        <div className="flex gap-2">
                          {forecast.map((item) => (
                            <div
                              key={item.dt_txt}
                              className="flex-1 flex flex-col items-center p-2 border rounded-lg bg-gray-50 min-w-[80px]"
                            >
                              <span className="text-xs text-gray-500 mb-1">
                                {item.dt_txt.split(" ")[1].slice(0, 5)}
                              </span>
                              {/* <img
                                src={`https://openweathermap.org/img/wn/${item.icon}@2x.png`}
                                alt=""
                                className="w-12 h-12"
                              /> */}
                              <Image
  src={`https://openweathermap.org/img/wn/${item.icon}@2x.png`}
  alt="Weather icon"
  width={48}   // px単位
  height={48}  // px単位
  className="w-12 h-12"
/>
                              <span className="text-xs text-center capitalize">{item.condition}</span>
                              <span className="text-sm">{item.temp}°C</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : weatherError ? (
                      <p className="text-red-500">{weatherError}</p>
                    ) : (
                      <p className="text-gray-500">天気情報を取得中...</p>
                    )}
                  </CardContent>
                </Card>
              </>
            ) : (
              <p className="text-gray-500">次の旅行情報はありません</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
