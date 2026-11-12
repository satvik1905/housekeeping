import type { ReactNode } from "react";
import { Group, Title } from "@mantine/core";

type PageHeaderProps = {
  title: ReactNode;
  actions?: ReactNode;
};

export function PageHeader({ title, actions }: PageHeaderProps) {
  return (
    <Group justify="space-between" gap="md">
      <Title order={2}>{title}</Title>
      {actions && <Group gap="md">{actions}</Group>}
    </Group>
  );
}
