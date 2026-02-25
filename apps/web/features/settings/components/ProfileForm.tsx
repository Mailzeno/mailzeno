"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { updateProfile } from "../services/settings.service";
import { useToast } from "@/components/ui/use-toast";
import { Skeleton } from "@/components/ui/skeleton";

export function ProfileForm() {
  const { toast } = useToast();

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

  if (initialLoading) {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-5 w-40" />
      </CardHeader>

      <CardContent className="p-0">
        <div className="flex items-center border-t justify-between px-6 py-5">
          <div className="w-1/3 space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-3 w-32" />
          </div>
          <div className="w-2/3">
            <Skeleton className="h-10 w-full rounded-md" />
          </div>
        </div>

        <div className="border-t" />

        <div className="flex items-center justify-between px-6 py-5">
          <div className="w-1/3 space-y-2">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-3 w-28" />
          </div>
          <div className="w-2/3">
            <Skeleton className="h-10 w-full rounded-md" />
          </div>
        </div>

        <div className="border-t" />

        <div className="flex justify-end px-6 py-4">
          <Skeleton className="h-9 w-28 rounded-lg" />
        </div>
      </CardContent>
    </Card>
  );
}


  return (
    <Card>
      <CardHeader>
        <CardTitle>Profile Information</CardTitle>
      </CardHeader>

      <CardContent className="p-0">
        {/* Full Name Row */}
        <div className="flex items-center border-t justify-between px-6 py-5">
          <div className="w-1/3">
            <p className="text-sm font-medium">Full Name</p>
            <p className="text-xs text-muted-foreground">
              This will be displayed on your account.
            </p>
          </div>

          <div className="w-2/3">
            <Input
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Your full name"
            />
          </div>
        </div>

        <div className="border-t" />

        {/* Email Row */}
        <div className="flex items-center justify-between px-6 py-5">
          <div className="w-1/3">
            <p className="text-sm font-medium">Email</p>
            <p className="text-xs text-muted-foreground">
              Used for account notifications and login.
            </p>
          </div>

          <div className="w-2/3">
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
          <Button variant={"main"} onClick={handleSave} disabled={saving}>
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
