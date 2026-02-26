import { Server, Shield, FileText, Activity } from "lucide-react"

const features = [
  {
    icon: Server,
    title: "Multi-SMTP support",
    desc: "Connect Gmail, Zoho, Outlook, or any custom SMTP server."
  },
  {
    icon: Shield,
    title: "Secure by design",
    desc: "Encrypted credentials and strict usage limits."
  },
  {
    icon: FileText,
    title: "Templates & APIs",
    desc: "Reusable templates and SDK-ready APIs."
  },
  {
    icon: Activity,
    title: "Delivery logs",
    desc: "Track sent emails, failures, and errors in real time."
  }
]

export function Features() {
  return (
    <section className="mx-auto mt-3 max-w-6xl px-6">
      <div className="grid gap-6 sm:grid-cols-2">
        {features.map((f) => (
          <div key={f.title} className="rounded-lg border p-6">

            {/* Icon with grid pattern */}
            <div style={{ position: "relative", width: 48, height: 48 }}>
              {/* Grid dots pattern */}
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  borderRadius: 1,
                  backgroundImage:
                    "linear-gradient(to right, #3f3f463e 1px, transparent 1px), linear-gradient(to bottom, #3f3f463e 1px, transparent 1px)",
                  backgroundSize: "6px 6px",
                  opacity: 0.2,
                }}
              />
              {/* Radial   */}
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  borderRadius: 1,
                  background:
                    "radial-gradient(circle at center, transparent 100%, var(--card, #11111100) 80%)",
                }}
              />
              {/* Icon on top */}
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <f.icon style={{ width: 20, height: 20 }} className="text-primary" />
              </div>
            </div>

            <h3 className="mt-4 font-medium">{f.title}</h3>
            <p className="mt-2 text-sm text-muted-foreground">{f.desc}</p>
          </div>
        ))}
      </div>
    </section>
  )
}