"use client";

import React, { useState } from "react";
import { UserProfile } from "@/types/account";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/use-toast";
import {
  Loader2,
  Globe,
  MapPin,
  Phone,
  Briefcase,
  Link as LinkIcon,
  Linkedin,
  Twitter,
  Github,
} from "lucide-react";

interface PersonalDetailsSectionProps {
  profile: UserProfile;
  refresh: () => void;
}

export default function PersonalDetailsSection({
  profile,
  refresh,
}: PersonalDetailsSectionProps) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [formData, setFormData] = useState({
    phone: profile?.phone || "",
    location: profile?.location || "",
    country: profile?.country || "",
    timezone: profile?.timezone || "UTC",
    language: profile?.language || "en",
    company: profile?.company || "",
    job_title: profile?.job_title || "",
    website: profile?.website || "",
    social_links: {
      linkedin: profile?.social_links?.linkedin || "",
      twitter: profile?.social_links?.twitter || "",
      github: profile?.social_links?.github || "",
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsUpdating(true);

      const response = await fetch("/api/user/profile/details", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to update personal details");
      }

      toast({
        title: "Success",
        description: "Personal details updated successfully.",
      });
      refresh();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update personal details.",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleSocialChange = (
    key: keyof typeof formData.social_links,
    value: string,
  ) => {
    setFormData({
      ...formData,
      social_links: {
        ...formData.social_links,
        [key]: value,
      },
    });
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h3 className="text-xl font-bold text-gray-900">Personal Details</h3>
        <p className="text-sm text-gray-500">
          Additional information about you
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Personal Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="dob">Date of Birth</Label>
            <Input
              id="dob"
              type="date"
              value={formData.date_of_birth}
              onChange={(e) =>
                setFormData({ ...formData, date_of_birth: e.target.value })
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number</Label>
            <div className="relative">
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
                placeholder="+1 (555) 000-0000"
                className="pl-10"
              />
              <Phone className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="country">Country</Label>
            <div className="relative">
              <Input
                id="country"
                value={formData.country}
                onChange={(e) =>
                  setFormData({ ...formData, country: e.target.value })
                }
                placeholder="Select Country..."
                className="pl-10"
              />
              <Globe className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">Location / City</Label>
            <div className="relative">
              <Input
                id="location"
                value={formData.location}
                onChange={(e) =>
                  setFormData({ ...formData, location: e.target.value })
                }
                placeholder="Cairo, Egypt"
                className="pl-10"
              />
              <MapPin className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            </div>
          </div>
        </div>

        <hr className="border-gray-100" />

        {/* Occupation Info */}
        <div>
          <h4 className="text-sm font-semibold text-gray-900 mb-4 flex items-center">
            <Briefcase className="mr-2 h-4 w-4 text-blue-600" />
            Occupation Information
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="company">Company Name</Label>
              <Input
                id="company"
                value={formData.company}
                onChange={(e) =>
                  setFormData({ ...formData, company: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="job">Job Title</Label>
              <Input
                id="job"
                value={formData.job_title}
                onChange={(e) =>
                  setFormData({ ...formData, job_title: e.target.value })
                }
              />
            </div>

            <div className="md:col-span-2 space-y-2">
              <Label htmlFor="website">Professional Website</Label>
              <div className="relative">
                <Input
                  id="website"
                  value={formData.website}
                  onChange={(e) =>
                    setFormData({ ...formData, website: e.target.value })
                  }
                  placeholder="https://example.com"
                  className="pl-10"
                />
                <LinkIcon className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              </div>
            </div>
          </div>
        </div>

        <hr className="border-gray-100" />

        {/* Social Links */}
        <div>
          <h4 className="text-sm font-semibold text-gray-900 mb-4 flex items-center">
            <Linkedin className="mr-2 h-4 w-4 text-blue-600" />
            Social Links
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="linkedin">LinkedIn</Label>
              <div className="relative">
                <Input
                  id="linkedin"
                  value={formData.social_links.linkedin}
                  onChange={(e) =>
                    handleSocialChange("linkedin", e.target.value)
                  }
                  className="pl-10"
                />
                <Linkedin className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="twitter">Twitter / X</Label>
              <div className="relative">
                <Input
                  id="twitter"
                  value={formData.social_links.twitter}
                  onChange={(e) =>
                    handleSocialChange("twitter", e.target.value)
                  }
                  className="pl-10"
                />
                <Twitter className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="github">GitHub</Label>
              <div className="relative">
                <Input
                  id="github"
                  value={formData.social_links.github}
                  onChange={(e) => handleSocialChange("github", e.target.value)}
                  className="pl-10"
                />
                <Github className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              </div>
            </div>
          </div>
        </div>

        <div className="pt-6 border-t border-gray-100 flex justify-end space-x-4">
          <Button type="button" variant="ghost" onClick={() => refresh()}>
            Cancel
          </Button>
          <Button type="submit" disabled={isUpdating}>
            {isUpdating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Changes
          </Button>
        </div>
      </form>
    </div>
  );
}
