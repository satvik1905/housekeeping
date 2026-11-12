import type { ReactNode } from "react";
import { Box } from "@mantine/core";
import classes from "./StickyBar.module.css";

type StickyBarProps = {
  children: ReactNode;
};

// Stays stuck while its parent (Page, or a SplitLayout column) is in view
export function StickyBar({ children }: StickyBarProps) {
  return <Box className={classes.root}>{children}</Box>;
}
