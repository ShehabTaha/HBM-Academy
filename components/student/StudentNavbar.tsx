"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useStudent } from "@/hooks/useStudent";
import { t } from "@/lib/i18n";
import { Award, BookOpen, LayoutDashboard, LogOut, Mail, User } from "lucide-react";
import { cn } from "@/lib/utils";

const links = [
  { href: "/dashboard", label: "nav.dashboard", icon: LayoutDashboard },
  { href: "/courses", label: "nav.courses", icon: BookOpen },
  { href: "/certificates", label: "nav.certificates", icon: Award },
  { href: "/messages", label: "nav.messages", icon: Mail },
];

export function StudentNavbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { student, setStudent, language } = useStudent();

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    setStudent(null);
    router.push("/auth/login");
    router.refresh();
  }

  async function toggleLanguage() {
    const nextLanguage = language === "ar" ? "en" : "ar";
    const response = await fetch("/api/student/auth/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ language: nextLanguage }),
    });

    if (response.ok) {
      const data = await response.json();
      setStudent(data.student);
      router.refresh();
    }
  }

  return (
    <header className="sticky top-0 z-30 border-b bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 sm:px-6">
        <Link href="/dashboard" className="flex items-center gap-2 font-semibold">
          <Image src="/logo.svg" alt="HBM Academy" width={34} height={34} />
          <span className="hidden sm:inline">HBM Academy</span>
        </Link>

        <nav className="ml-auto hidden items-center gap-1 md:flex">
          {links.map((item) => {
            const Icon = item.icon;
            const active =
              pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Button key={item.href} asChild variant="ghost" size="sm">
                <Link
                  href={item.href}
                  className={cn(active && "bg-secondary text-primary")}
                >
                  <Icon className="h-4 w-4" />
                  {t(item.label, language)}
                </Link>
              </Button>
            );
          })}
        </nav>

        <Button variant="outline" size="sm" onClick={toggleLanguage}>
          {language === "ar" ? "EN" : "AR"}
        </Button>

        <Button asChild variant="ghost" size="icon" className="md:hidden">
          <Link href="/profile" aria-label={t("nav.profile", language)}>
            <User className="h-4 w-4" />
          </Link>
        </Button>

        <Link href="/profile" className="hidden md:block">
          <Avatar className="h-9 w-9">
            <AvatarImage src={student?.avatar ?? undefined} alt={student?.name ?? ""} />
            <AvatarFallback>{student?.name?.[0]?.toUpperCase() ?? "S"}</AvatarFallback>
          </Avatar>
        </Link>

        <Button
          variant="ghost"
          size="icon"
          onClick={handleSignOut}
          aria-label={t("nav.signOut", language)}
        >
          <LogOut className="h-4 w-4" />
        </Button>
      </div>
    </header>
  );
}
