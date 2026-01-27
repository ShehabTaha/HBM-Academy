"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useState } from "react";

// --- Verify Email Modal ---
export function VerifyEmailModal({ isOpen, onClose, count, onConfirm }: any) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Verify Email Address</DialogTitle>
          <DialogDescription>
            Are you sure you want to verify the email for {count} student
            {count > 1 ? "s" : ""}? This will mark them as verified in the
            system.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={onConfirm}>Verify</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// --- Suspend Modal ---
export function SuspendStudentModal({
  isOpen,
  onClose,
  studentName,
  onConfirm,
}: any) {
  const [reason, setReason] = useState("");
  const [notify, setNotify] = useState(true);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Suspend Account: {studentName}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label>Reason for Suspension</Label>
            <div className="flex flex-col gap-2">
              <Label className="flex items-center gap-2 font-normal">
                <Checkbox
                  onCheckedChange={() => setReason("Terms Violation")}
                  checked={reason === "Terms Violation"}
                />
                Terms Violation
              </Label>
              <Label className="flex items-center gap-2 font-normal">
                <Checkbox
                  onCheckedChange={() => setReason("Payment Issue")}
                  checked={reason === "Payment Issue"}
                />
                Payment Issue
              </Label>
              <Label className="flex items-center gap-2 font-normal">
                <Checkbox
                  onCheckedChange={() => setReason("Code of Conduct")}
                  checked={reason === "Code of Conduct"}
                />
                Code of Conduct
              </Label>
              <Input
                placeholder="Other reason..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Checkbox
              id="notify"
              checked={notify}
              onCheckedChange={(c) => setNotify(!!c)}
            />
            <Label htmlFor="notify">Send notification email to student</Label>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={() => onConfirm(reason)}
            disabled={!reason}
          >
            Suspend Account
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// --- Delete Modal ---
export function DeleteStudentModal({
  isOpen,
  onClose,
  studentName,
  onConfirm,
}: any) {
  const [confirmText, setConfirmText] = useState("");

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-red-600">
            Delete Account: {studentName}
          </DialogTitle>
          <DialogDescription>
            This action implies a soft delete. The user will no longer be able
            to log in, but enrollment data is preserved for reporting.
            <br />
            <br />
            Type <strong>DELETE</strong> to confirm.
          </DialogDescription>
        </DialogHeader>
        <div className="py-2">
          <Input
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            placeholder="Type DELETE"
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={onConfirm}
            disabled={confirmText !== "DELETE"}
          >
            Delete Forever
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
