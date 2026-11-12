import type { ReactNode } from "react";
import { Box, Group } from "@mantine/core";
import { Page } from "./Page";
import classes from "./FlowLayout.module.css";

type FlowLayoutProps = {
  children: ReactNode;
  // Footer, left side (e.g. a hint)
  footerStart?: ReactNode;
  // Footer, bottom right: Back (secondary) immediately left of the primary
  // action, nothing between them (CLAUDE.md: Layout)
  footerActions: ReactNode;
};

// A step of a multi-step flow: the page, then a footer pinned to the
// bottom of the content area
export function FlowLayout({ children, footerStart, footerActions }: FlowLayoutProps) {
  return (
    <Box className={classes.root}>
      <Box className={classes.body}>
        <Page>{children}</Page>
      </Box>
      <Group className={classes.footer} justify="space-between" wrap="nowrap" px="lg" py="xs">
        <Box>{footerStart}</Box>
        <Group gap="xs" wrap="nowrap">
          {footerActions}
        </Group>
      </Group>
    </Box>
  );
}
