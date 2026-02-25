import { ProfileForm } from "@/features/settings/components/ProfileForm"
import { AppearanceSection } from "@/features/settings/components/AppearanceSection"
import { DangerZone } from "@/features/settings/components/DangerZone"


export default function SettingsPage() {
  return (
    <div className="flex justify-center w-full">
      <div className="w-full max-w-2xl space-y-8 py-10">
        <div>
          <h1 className="text-2xl font-semibold">Preferences</h1>
          <p className="text-muted-foreground text-sm">
            Manage your account profile and dashboard experience.
          </p>
        </div>

        <ProfileForm />
        <AppearanceSection />
        <DangerZone />
      </div>
    </div>
  )
}
