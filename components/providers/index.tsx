"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SessionProvider } from "next-auth/react";
import { ThemeProvider } from "next-themes";
import { Toaster } from "sonner";
import * as React from "react";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000,
      retry: 1,
    },
  },
});

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange={false}
      storageKey="flowboard-theme"
    >
      <SessionProvider>
        <QueryClientProvider client={queryClient}>
          {children}
          <Toaster
            position="bottom-right"
            richColors
            theme="system"
            toastOptions={{
              className:
                "!rounded-xl !border !border-[var(--border)] !bg-[var(--surface)] !text-[var(--fg)]",
            }}
          />
        </QueryClientProvider>
      </SessionProvider>
    </ThemeProvider>
  );
}
