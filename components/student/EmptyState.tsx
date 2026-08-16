import { Button } from "@/components/ui/button";
import { Inbox } from "lucide-react";
import Link from "next/link";

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: { href: string; label: string };
}) {
  return (
    <div className="flex min-h-[280px] flex-col items-center justify-center rounded-lg border border-dashed bg-white px-6 py-12 text-center">
      <div className="mb-4 rounded-full bg-secondary p-3">
        <Inbox className="h-6 w-6 text-muted-foreground" />
      </div>
      <h2 className="text-xl font-semibold">{title}</h2>
      <p className="mt-2 max-w-md text-sm text-muted-foreground">
        {description}
      </p>
      {action ? (
        <Button asChild className="mt-6">
          <Link href={action.href}>{action.label}</Link>
        </Button>
      ) : null}
    </div>
  );
}
