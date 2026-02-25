"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogFooter,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { deleteAccount } from "../services/settings.service";
import { useRouter } from "next/navigation";

export function DangerZone() {
  const [open, setOpen] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const router = useRouter();

  const handleDelete = async () => {
    if (confirmText !== "Delete my account") return;

    await deleteAccount();
    router.push("/");
  };

  return (
    <>
      <div className="border border-destructive rounded-lg p-6 space-y-4">
        <h3 className="font-semibold ">
          Request for account deletion
        </h3>
        <p className="text-sm text-muted-foreground">
          Deleting your account is permanent and cannot be undone. Your data
          will be deleted within 30 days, but we may retain some metadata and
          logs for longer where required or permitted by law.
        </p>
        <Button variant="destructive" onClick={() => setOpen(true)}>
          Delete Account
        </Button>
      </div>

      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Type "Delete my account" to confirm account deletion
            </AlertDialogTitle>
          </AlertDialogHeader>

          <Input
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            placeholder="DELETE"
          />

          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={confirmText !== "Delete my account"}
            >
              Permanently Delete
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
