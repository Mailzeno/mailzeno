"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { updatePassword } from "@/features/settings/services/settings.service" // 👈 Service import

export function PasswordSection() {
  const { toast } = useToast()

  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [loading, setLoading] = useState(false)

  const isPasswordValid = newPassword.length >= 6
  const showValidation = newPassword.length > 0

  const handleChangePassword = async () => {
    if (!currentPassword) {
      toast({
        title: "Current password is required.",
        variant: "destructive",
      })
      return
    }

    try {
      setLoading(true)

      // ✅ Calling service instead of fetch
      await updatePassword({
        currentPassword,
        newPassword,
      })

      toast({ title: "Password updated successfully." })
      setCurrentPassword("")
      setNewPassword("")
    } catch (error: any) {
      toast({
        title: error.message || "Something went wrong.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Change Password</CardTitle>
      </CardHeader>

      <hr className="border-border" />

      <CardContent className="space-y-6">

        <div className="flex items-center gap-4">
          <label className="w-60 font-medium">
            Current Password
          </label>
          <Input
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
          />
        </div>

        <hr className="border-border" />

        <div className="flex items-start gap-4">
          <label className="w-60 font-medium pt-2">
            New Password
          </label>

          <div className="w-full space-y-2">
            <Input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />

            {showValidation && (
              <p
                className={`text-sm ${
                  isPasswordValid ? "text-green-500" : "text-red-500"
                }`}
              >
                {isPasswordValid
                  ? "Password looks good"
                  : "Password must be at least 6 characters"}
              </p>
            )}
          </div>
        </div>

        <hr className="border-border" />

        <Button
          variant="main"
          onClick={handleChangePassword}
          disabled={loading || !isPasswordValid}
          className="w-full"
        >
          {loading ? "Updating..." : "Update Password"}
        </Button>

      </CardContent>
    </Card>
  )
}
