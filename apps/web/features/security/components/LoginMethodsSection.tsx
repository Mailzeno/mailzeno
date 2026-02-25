"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function LoginMethodsSection() {
  const [providers, setProviders] = useState<string[]>([])

  useEffect(() => {
    const fetchProviders = async () => {
      const res = await fetch("/api/account")
      const data = await res.json()

      const identities = data.identities || []
      const providerList = identities.map((i: any) => i.provider)

      setProviders(providerList)
    }

    fetchProviders()
  }, [])

  return (
    <Card>
      <CardHeader>
        <CardTitle>Login Methods</CardTitle>
      </CardHeader>

      <CardContent>
        {providers.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Email and password login.
          </p>
        ) : (
          <ul className="space-y-2 text-sm">
            {providers.map((p) => (
              <li key={p} className="capitalize">
                {p}
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}
