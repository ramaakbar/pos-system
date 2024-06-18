"use client";

import { ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "next-themes";

import { Toaster } from "./ui/toaster";

const queryClient = new QueryClient();

export function Providers({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class">
        {children}
        <Toaster richColors />
      </ThemeProvider>
    </QueryClientProvider>
  );
}
