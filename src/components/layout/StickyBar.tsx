import type { ReactNode } from "react";
import { Box } from "@mantine/core";
import classes from "./StickyBar.module.css";

type StickyBarProps = {
  children: ReactNode;
};

// Must be a direct child of Page so it stays stuck for the whole screen
export function StickyBar({ children }: StickyBarProps) {
  return <Box className={classes.root}>{children}</Box>;
}
