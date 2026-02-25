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
    <section className="mx-auto mt-32 max-w-6xl px-6">
      <div className="grid gap-6 sm:grid-cols-2">
        {features.map((f) => (
          <div key={f.title} className="rounded-lg border p-6">
            <f.icon className="h-6 w-6 text-primary" />
            <h3 className="mt-4 font-medium">{f.title}</h3>
            <p className="mt-2 text-sm text-muted-foreground">{f.desc}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
