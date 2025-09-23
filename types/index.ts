export interface User {
  id: string
  email: string
  name: string
  createdAt: string
}

export interface Trip {
  id: string
  userId: string
  name: string
  destination: string
  startDate: string
  endDate: string
  budget: number
  description?: string
  status: "planning" | "ongoing" | "completed"
  createdAt: string
  updatedAt: string
}

export interface Expense {
  id: string
  tripId: string
  userId: string
  category: "transportation" | "accommodation" | "food" | "entertainment" | "shopping" | "other"
  amount: number
  description: string
  date: string
  createdAt: string
}

export interface Budget {
  id: string
  tripId: string
  category: string
  allocatedAmount: number
  spentAmount: number
  createdAt: string
  updatedAt: string
}

export interface WeatherData {
  location: string
  date: string
  temperature: {
    min: number
    max: number
  }
  condition: string
  humidity: number
  windSpeed: number
}
