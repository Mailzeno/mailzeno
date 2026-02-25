"use client";

import { useApiKey } from "@/features/api-key/hooks/useApiKey";
import { ApiKeyCard } from "@/features/api-key/components/ApiKeyCard";
import { EmptyState } from "@/features/api-key/components/EmptyState";
import { IntegrationSection } from "@/features/api-key/components/IntegrationSection";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";

export default function ApiPage() {
  const { apiKey, loading, refresh } = useApiKey();
  const router = useRouter();

  return (
    <div className="px-6 py-10 max-w-4xl mx-auto">
      {/* Header */}
      <button
        onClick={() => router.back()}
        className="flex items-center pt-0 pb-4 gap-2 cursor-pointer text-sm text-muted-foreground hover:text-foreground transition"
      >
        <ArrowLeft size={16} />
        Back
      </button>
      <div className="mb-10 space-y-3">
        <h1 className="text-3xl font-semibold tracking-tight">API Access</h1>
        <p className="text-muted-foreground max-w-xl">
          Manage your API keys and integrate MailZeno into your application
          using simple HTTP requests or our official SDK.
        </p>
      </div>

      {/* Key Section */}
      <div className="space-y-8">
        {loading ? (
          <div className="space-y-8">
            {/* API Key Card Skeleton */}
            <Card className="rounded-2xl">
              <CardContent className="p-6 space-y-6">
                <div className="flex justify-between items-start">
                  <Skeleton className="h-5 w-40" />
                  <Skeleton className="h-9 w-28 rounded-lg" />
                </div>

                <Skeleton className="h-10 w-72 rounded-md" />
                <Skeleton className="h-4 w-32" />
              </CardContent>
            </Card>

            {/* Quick Start Skeleton */}
            <Card className="rounded-2xl">
              <CardContent className="p-6 space-y-6">
                <div className="flex justify-between items-center">
                  <Skeleton className="h-5 w-32" />
                  <Skeleton className="h-9 w-20 rounded-lg" />
                </div>

                <div className="flex gap-3">
                  <Skeleton className="h-8 w-20 rounded-lg" />
                  <Skeleton className="h-8 w-24 rounded-lg" />
                </div>

                <Skeleton className="h-32 w-full rounded-lg" />
              </CardContent>
            </Card>
          </div>
        ) : apiKey ? (
          <>
            <ApiKeyCard data={apiKey} onRefresh={refresh} />
            <IntegrationSection />
          </>
        ) : (
          <EmptyState onRefresh={refresh} />
        )}
      </div>
    </div>
  );
}
