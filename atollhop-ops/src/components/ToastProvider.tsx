"use client";

import * as React from "react";
import { CheckCircle2, X } from "lucide-react";
import { cn } from "@/lib/utils";

export type ToastOptions = {
  title: string;
  description?: string;
  variant?: "default" | "destructive";
};

export interface ToastContextValue {
  toast: (options: ToastOptions) => void;
}

const ToastContext = React.createContext<ToastContextValue | undefined>(
  undefined
);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<
    Array<{
      id: number;
      title: string;
      description?: string;
      variant: "default" | "destructive";
    }>
  >([]);

  const toast = React.useCallback((options: ToastOptions) => {
    const id = Date.now();
    setToasts((prev) => [
      ...prev,
      {
        id,
        title: options.title,
        description: options.description,
        variant: options.variant || "default",
      },
    ]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  }, []);

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      {}
      <div className="fixed top-4 left-1/2 z-50 flex w-full max-w-md -translate-x-1/2 flex-col gap-2 px-4">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={cn(
              "relative rounded-lg border shadow-md p-4 flex flex-col gap-1.5",
              t.variant === "destructive"
                ? "bg-red-50 border-red-300"
                : "bg-white border-gray-200"
            )}
          >
            {}
            <div className="flex items-center gap-2">
              {t.variant === "destructive" ? (
                <X className="h-5 w-5 text-red-500" />
              ) : (
                <CheckCircle2 className="h-5 w-5 text-green-600" />
              )}
              <span className="font-semibold text-gray-900">{t.title}</span>
            </div>
            {}
            {t.description && (
              <p className="text-sm text-gray-600 pl-7">{t.description}</p>
            )}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const context = React.useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}
