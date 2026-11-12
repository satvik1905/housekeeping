import type { ReactNode } from "react";
import { Box, Stack } from "@mantine/core";
import classes from "./SplitLayout.module.css";

type SplitLayoutProps = {
  // Scrolling content: the left column from the tablet breakpoint up
  main: ReactNode;
  // Stays in view on the right from the tablet breakpoint up; comes first
  // in the single column below it
  panel: ReactNode;
};

// Two columns from the tablet breakpoint up, one column below it.
// xl between the columns and between sections inside each.
export function SplitLayout({ main, panel }: SplitLayoutProps) {
  return (
    <Box className={classes.root}>
      <Stack gap="xl" className={classes.main}>
        {main}
      </Stack>
      <Stack gap="xl" className={classes.panel}>
        {panel}
      </Stack>
    </Box>
  );
}
