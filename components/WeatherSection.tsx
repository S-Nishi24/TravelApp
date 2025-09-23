interface Forecast {
  dt_txt: string
  temp: number
  condition: string
  icon: string
}

interface WeatherSectionProps {
  forecast: Forecast[]
}

export default function WeatherSection({ forecast }: WeatherSectionProps) {
  return (
    <div>
      <h3 className="text-lg font-semibold mb-2">天気予報</h3>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {forecast.map((f, idx) => (
          <div
            key={idx}
            className="p-3 border rounded-lg text-center shadow-sm bg-white"
          >
            <p className="text-sm text-gray-600">{f.dt_txt}</p>
            <img
              src={`https://openweathermap.org/img/wn/${f.icon}@2x.png`}
              alt={f.condition}
              className="mx-auto"
            />
            <p className="font-medium">{Math.round(f.temp)}℃</p>
            <p className="text-sm text-gray-500">{f.condition}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
