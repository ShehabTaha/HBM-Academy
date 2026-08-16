"use client";

import * as React from "react";
import { resolveAvatarUrl } from "@/lib/avatar";
import { cn } from "@/lib/utils";

const Avatar = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full",
      className,
    )}
    {...props}
  />
));
Avatar.displayName = "Avatar";

const AvatarImage = React.forwardRef<
  HTMLImageElement,
  React.ImgHTMLAttributes<HTMLImageElement>
>(({ className, src, onError, ...props }, ref) => {
  const initialSrc = typeof src === "string" ? src : undefined;
  const [resolvedSrc, setResolvedSrc] = React.useState(resolveAvatarUrl(initialSrc));

  React.useEffect(() => {
    setResolvedSrc(resolveAvatarUrl(typeof src === "string" ? src : undefined));
  }, [src]);

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      ref={ref}
      className={cn("aspect-square h-full w-full object-cover", className)}
      src={resolvedSrc}
      alt={props.alt ?? ""}
      onError={(event) => {
        if (resolvedSrc !== resolveAvatarUrl(null)) {
          setResolvedSrc(resolveAvatarUrl(null));
        }
        onError?.(event);
      }}
      {...props}
    />
  );
});
AvatarImage.displayName = "AvatarImage";

const AvatarFallback = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "flex h-full w-full items-center justify-center rounded-full bg-muted",
      className,
    )}
    {...props}
  />
));
AvatarFallback.displayName = "AvatarFallback";

export { Avatar, AvatarImage, AvatarFallback };
