"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // Cache is fresh for 5 mins (Instagram-like speed)
      gcTime: 1000 * 60 * 30, // Retain in memory for 30 mins
      refetchOnWindowFocus: false, // Prevents aggressive flashing refetches when switching tabs
      refetchOnMount: true,
    },
  },
});

export default function Providers({ children }) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}
