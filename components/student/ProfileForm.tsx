"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { AvatarManager } from "@/components/student/AvatarManager";
import { useStudent } from "@/hooks/useStudent";

export function ProfileForm() {
  const { student, setStudent } = useStudent();
  const [name, setName] = useState(student?.name ?? "");
  const [bio, setBio] = useState(student?.bio ?? "");
  const [specialization, setSpecialization] = useState(student?.specialization ?? "");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    setMessage(null);

    const response = await fetch("/api/student/auth/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        bio,
        specialization: specialization || null,
      }),
    });

    const data = await response.json();
    setSaving(false);

    if (!response.ok) {
      setMessage(data.error ?? "Profile could not be saved.");
      return;
    }

    setStudent(data.student);
    setMessage("Profile saved.");
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <AvatarManager />
      <div className="grid gap-2">
        <Label htmlFor="name">Full name</Label>
        <Input id="name" value={name} onChange={(event) => setName(event.target.value)} />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="specialization">Specialization</Label>
        <select
          id="specialization"
          value={specialization}
          onChange={(event) => setSpecialization(event.target.value)}
          className="h-10 rounded-md border bg-background px-3 text-sm"
        >
          <option value="">Choose a track</option>
          <option value="f_and_b">Food and Beverage</option>
          <option value="housekeeping">Housekeeping</option>
          <option value="front_office">Front Office</option>
          <option value="management">Management</option>
          <option value="culinary">Culinary</option>
        </select>
      </div>
      <div className="grid gap-2">
        <Label htmlFor="bio">Bio</Label>
        <Textarea id="bio" value={bio} onChange={(event) => setBio(event.target.value)} />
      </div>
      <div className="flex items-center gap-3">
        <Button type="submit" disabled={saving}>
          {saving ? "Saving..." : "Save profile"}
        </Button>
        {message ? <p className="text-sm text-muted-foreground">{message}</p> : null}
      </div>
    </form>
  );
}
