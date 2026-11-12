import type { ReactNode } from "react";
import { Stack, Title } from "@mantine/core";

type SectionProps = {
  title?: ReactNode;
  children: ReactNode;
};

export function Section({ title, children }: SectionProps) {
  return (
    <Stack gap="md">
      {title && <Title order={4}>{title}</Title>}
      {children}
    </Stack>
  );
}
