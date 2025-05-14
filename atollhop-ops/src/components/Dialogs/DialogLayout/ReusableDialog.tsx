// components/Dialogs/ReusableDialog.tsx
"use client";

import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { XIcon } from "lucide-react";
import { cn } from "@/lib/utils";

// Props for our reusable dialog
export interface ReusableDialogProps
  extends Omit<React.ComponentProps<typeof DialogPrimitive.Root>, "children"> {
  /** Use this to size your dialog: default (responsive max-w) or large (90vw × 90vh) */
  size?: "default" | "large";
  /** The button or element that triggers the dialog */
  trigger: React.ReactNode;
  /** Title above the content */
  title?: string;
  /** Subtitle / description */
  description?: string;
  /** Main content of the dialog */
  children: React.ReactNode;
  /** Optional footer (e.g. actions row) */
  footer?: React.ReactNode;
  /** Extra classes on the Content container */
  className?: string;
}

export function ReusableDialog({
  open,
  onOpenChange,
  trigger,
  title,
  description,
  children,
  footer,
  size = "default",
  className,
}: ReusableDialogProps) {
  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Trigger asChild>{trigger}</DialogPrimitive.Trigger>
      <DialogPrimitive.Portal>
        {/* overlay */}
        <DialogPrimitive.Overlay
          className={cn(
            "fixed inset-0 z-50 bg-black/50",
            "data-[state=open]:animate-in data-[state=closed]:animate-out"
          )}
        />

        {/* content */}
        <DialogPrimitive.Content
          className={cn(
            "fixed top-[50%] left-[50%] z-50 grid gap-4 bg-background p-6 shadow-lg border rounded-lg duration-200",
            "translate-x-[-50%] translate-y-[-50%]",
            size === "large"
              ? "w-[90vw] h-[90vh] max-w-none"
              : "w-full max-w-[calc(100%-2rem)] sm:max-w-lg",
            className
          )}
        >
          {/* header */}
          {title && (
            <DialogPrimitive.Title className="text-lg font-semibold">
              {title}
            </DialogPrimitive.Title>
          )}
          {description && (
            <DialogPrimitive.Description className="text-sm text-muted-foreground">
              {description}
            </DialogPrimitive.Description>
          )}

          {/* body */}
          <div className="overflow-auto">{children}</div>

          {/* footer */}
          {footer && <div className="mt-4">{footer}</div>}

          {/* close button */}
          <DialogPrimitive.Close className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 focus:outline-none">
            <XIcon />
            <span className="sr-only">Close</span>
          </DialogPrimitive.Close>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
