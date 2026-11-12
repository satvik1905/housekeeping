import type { ReactNode } from "react";
import { Stack } from "@mantine/core";

type PageProps = {
  children: ReactNode;
};

// Wraps every screen: page padding lg, xl between sections
export function Page({ children }: PageProps) {
  return (
    <Stack p="lg" gap="xl">
      {children}
    </Stack>
  );
}
