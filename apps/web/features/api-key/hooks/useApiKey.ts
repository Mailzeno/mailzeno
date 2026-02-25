"use client"

import { useEffect, useState } from "react"

export function useApiKey() {
  const [apiKey, setApiKey] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  const fetchKey = async () => {
    try {
      setLoading(true)

      const res = await fetch("/api/api-keys", {
        cache: "no-store",
        credentials: "include",
      })

      if (!res.ok) throw new Error()

      const json = await res.json()
      setApiKey(json.data ?? null)
    } catch {
      setApiKey(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchKey()
  }, [])

  return {
    apiKey,
    loading,
    refresh: fetchKey,
  }
}
