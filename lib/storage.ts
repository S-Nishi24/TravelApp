import type { Trip, Expense, User } from "@/types"

const STORAGE_KEYS = {
  TRIPS: "travel_app_trips",
  EXPENSES: "travel_app_expenses",
  BUDGETS: "travel_app_budgets",
  USER: "travel_app_user",
} as const

export const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2)
}

export const storage = {
  get: (key: string): unknown[] => {
    if (typeof window === "undefined") return []
    try {
      const data = localStorage.getItem(key)
      return data ? JSON.parse(data) : []
    } catch {
      return []
    }
  },

  set: (key: string, data: unknown[]): void => {
    if (typeof window === "undefined") return
    try {
      localStorage.setItem(key, JSON.stringify(data))
    } catch (error) {
      console.error("Storage error:", error)
    }
  },

  getUser: (): User | null => {
    if (typeof window === "undefined") return null
    try {
      const data = localStorage.getItem(STORAGE_KEYS.USER)
      return data ? JSON.parse(data) : null
    } catch {
      return null
    }
  },

  setUser: (user: User): void => {
    if (typeof window === "undefined") return
    try {
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user))
    } catch (error) {
      console.error("User storage error:", error)
    }
  },
}

export const tripStorage = {
  getAll: (): Trip[] => storage.get(STORAGE_KEYS.TRIPS) as Trip[],

  create: (trip: Omit<Trip, "id" | "createdAt" | "updatedAt">): Trip => {
    const trips = tripStorage.getAll()
    const newTrip: Trip = {
      ...trip,
      id: generateId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    trips.push(newTrip)
    storage.set(STORAGE_KEYS.TRIPS, trips)
    return newTrip
  },

  getById: (id: string): Trip | null => {
    const trips = tripStorage.getAll()
    return trips.find((trip) => trip.id === id) || null
  },
}

export const expenseStorage = {
  getAll: (): Expense[] => storage.get(STORAGE_KEYS.EXPENSES) as Expense[],

  getByTripId: (tripId: string): Expense[] => {
    return expenseStorage.getAll().filter((expense) => expense.tripId === tripId)
  },

  create: (expense: Omit<Expense, "id" | "createdAt">): Expense => {
    const expenses = expenseStorage.getAll()
    const newExpense: Expense = {
      ...expense,
      id: generateId(),
      createdAt: new Date().toISOString(),
    }
    expenses.push(newExpense)
    storage.set(STORAGE_KEYS.EXPENSES, expenses)
    return newExpense
  },
}
