"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { locations } from "@/lib/location"

interface PrefectureCitySelectProps {
  onChange?: (prefecture: string, cityName: string, cityEn: string) => void
  initialPrefecture?: string
  initialCityName?: string
  initialCityEn?: string
}

export function PrefectureCitySelect({
  onChange,
  initialPrefecture = "",
  initialCityName = "",
  initialCityEn = "",
}: PrefectureCitySelectProps) {
  const [selectedPrefecture, setSelectedPrefecture] = useState(initialPrefecture)
  const [selectedCityEn, setSelectedCityEn] = useState(initialCityEn)
  const [selectedCityJa, setSelectedCityJa] = useState(initialCityName)
  const [weather, setWeather] = useState<string | null>(null)

  // 初期値を props から反映
  useEffect(() => {
    if (initialPrefecture) setSelectedPrefecture(initialPrefecture)
    if (initialCityEn) setSelectedCityEn(initialCityEn)
    if (initialCityName) setSelectedCityJa(initialCityName)
  }, [initialPrefecture, initialCityName, initialCityEn])

  // 都道府県選択変更
  const handlePrefectureChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedPrefecture(e.target.value)
    setSelectedCityEn("")
    setSelectedCityJa("")
    setWeather(null)
    onChange?.(e.target.value, "", "")
  }

  // 都市選択変更
  const handleCityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const cityEn = e.target.value
    const city = locations.find((loc) => loc.prefecture === selectedPrefecture)?.cities.find((c) => c.en === cityEn)

    if (city) {
      setSelectedCityEn(city.en)
      setSelectedCityJa(city.name)
      fetchWeather(city.en)
      onChange?.(selectedPrefecture, city.name, city.en)
    }
  }

  const fetchWeather = async (cityEn: string) => {
    try {
      // Use secure API route instead of direct API call
      const res = await fetch(`/api/weather?city=${encodeURIComponent(cityEn)}`)

      if (!res.ok) {
        const errorData = await res.json()
        setWeather(`天気情報の取得に失敗: ${errorData.error || res.status}`)
        return
      }

      const data = await res.json()
      if (data && data.list && data.list.length > 0) {
        // Use current weather from forecast data
        const current = data.list[0]
        setWeather(`${current.weather[0].description}, 気温: ${Math.round(current.main.temp)}°C`)
      } else {
        setWeather("天気情報が取得できませんでした")
      }
    } catch (error) {
      console.error("Weather fetch error:", error)
      setWeather(`エラーが発生しました: ${error}`)
    }
  }

  const cities = locations.find((loc) => loc.prefecture === selectedPrefecture)?.cities || []

  return (
    <div className="space-y-4">
      {/* 都道府県 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">訪問地：都道府県</label>
        <select value={selectedPrefecture} onChange={handlePrefectureChange} className="border p-2 rounded w-full">
          <option value="">選択してください</option>
          {locations.map((loc) => (
            <option key={loc.prefecture} value={loc.prefecture}>
              {loc.prefecture}
            </option>
          ))}
        </select>
      </div>

      {/* 都市 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">訪問地：都市</label>
        <select
          value={selectedCityEn}
          onChange={handleCityChange}
          disabled={!selectedPrefecture}
          className="border p-2 rounded w-full"
        >
          <option value="">選択してください</option>
          {cities.map((city) => (
            <option key={city.en} value={city.en}>
              {city.name}（{city.label}）
            </option>
          ))}
        </select>
      </div>

      {selectedPrefecture && selectedCityEn && (
        <p className="mt-2 text-gray-700">
          選択: {selectedCityJa} / {selectedCityEn}（{selectedPrefecture}）
        </p>
      )}

      {weather && <p className="mt-2 text-blue-700">天気: {weather}</p>}
    </div>
  )
}
