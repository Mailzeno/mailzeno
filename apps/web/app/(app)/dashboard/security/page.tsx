import { PasswordSection } from "@/features/security/components/PasswordSection"
import { LoginMethodsSection } from "@/features/security/components/LoginMethodsSection"
import { DangerZone } from "@/features/settings/components/DangerZone"

export default function SecurityPage() {
  return (
    <div className="flex justify-center w-full">
      <div className="w-full max-w-2xl space-y-8 py-10">
        <div>
          <h1 className="text-2xl font-semibold">Security</h1>
          <p className="text-muted-foreground text-sm">
            Manage your password and account security settings.
          </p>
        </div>

        <PasswordSection />
        <LoginMethodsSection />
        <DangerZone />
      </div>
    </div>
  )
}
