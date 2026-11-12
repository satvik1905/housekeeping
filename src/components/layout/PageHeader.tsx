import type { ReactNode } from "react";
import { Group, Stack, Text, Title } from "@mantine/core";

type PageHeaderProps = {
  title: ReactNode;
  subtitle?: ReactNode;
  actions?: ReactNode;
};

export function PageHeader({ title, subtitle, actions }: PageHeaderProps) {
  return (
    <Group justify="space-between" gap="md">
      <Stack gap="xs">
        <Title order={2}>{title}</Title>
        {subtitle !== undefined && <Text fw={600}>{subtitle}</Text>}
      </Stack>
      {actions && <Group gap="md">{actions}</Group>}
    </Group>
  );
}
