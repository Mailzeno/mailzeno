"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { updateProfile } from "../services/settings.service";
import { useToast } from "@/components/ui/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft } from "lucide-react";

export function ProfileForm() {
  const { toast } = useToast();
  const router = useRouter();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [saving, setSaving] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch("/api/account");
        if (!res.ok) return;
        const data = await res.json();
        setFullName(data.full_name ?? "");
        setEmail(data.email ?? "");
      } finally {
        setInitialLoading(false);
      }
    };
    fetchUser();
  }, []);

  const handleSave = async () => {
    try {
      setSaving(true);
      await updateProfile({ fullName, email });
      toast({ title: "Profile updated successfully." });
    } catch {
      toast({ title: "Something went wrong.", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const BackButton = (
    <button
      onClick={() => router.back()}
      className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition"
    >
      <ArrowLeft size={16} />
      Back
    </button>
  );

  if (initialLoading) {
    return (
      <div className="space-y-4">
        {BackButton}
        <Card>
          <CardHeader>
            <Skeleton className="h-5 w-40" />
          </CardHeader>
          <CardContent className="p-0">
            {[0, 1].map((i) => (
              <div key={i} className="border-t px-6 py-5 space-y-3 sm:space-y-0 sm:flex sm:items-center sm:justify-between">
                <div className="space-y-2 sm:w-1/3">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-3 w-32" />
                </div>
                <div className="sm:w-2/3">
                  <Skeleton className="h-10 w-full rounded-md" />
                </div>
              </div>
            ))}
            <div className="border-t" />
            <div className="flex justify-end px-6 py-4">
              <Skeleton className="h-9 w-28 rounded-lg" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {BackButton}
      <Card>
        <CardHeader>
          <CardTitle>Profile Information</CardTitle>
        </CardHeader>

        <CardContent className="p-0">
          {/* Full Name Row */}
          <div className="flex flex-col gap-3 border-t px-6 py-5 sm:flex-row sm:items-center sm:justify-between sm:gap-0">
            <div className="sm:w-1/3">
              <p className="text-sm font-medium">Full Name</p>
              <p className="text-xs text-muted-foreground">
                This will be displayed on your account.
              </p>
            </div>
            <div className="sm:w-2/3">
              <Input
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Your full name"
              />
            </div>
          </div>

          <div className="border-t" />

          {/* Email Row */}
          <div className="flex flex-col gap-3 px-6 py-5 sm:flex-row sm:items-center sm:justify-between sm:gap-0">
            <div className="sm:w-1/3">
              <p className="text-sm font-medium">Email</p>
              <p className="text-xs text-muted-foreground">
                Used for account notifications and login.
              </p>
            </div>
            <div className="sm:w-2/3">
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Your email"
              />
            </div>
          </div>

          <div className="border-t" />

          {/* Save Row */}
          <div className="flex justify-end px-6 py-4">
            <Button variant="main" onClick={handleSave} disabled={saving} className="w-full sm:w-auto">
              {saving ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}