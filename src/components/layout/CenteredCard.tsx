import type { ReactNode } from "react";
import { Center, Paper } from "@mantine/core";
import classes from "./CenteredCard.module.css";

type CenteredCardProps = {
  children: ReactNode;
};

// A full-height screen with one card centered both ways, for screens
// outside the app frame (the PIN screen). lg page padding, lg card padding.
export function CenteredCard({ children }: CenteredCardProps) {
  return (
    <Center className={classes.root} p="lg">
      <Paper className={classes.card} p="lg" shadow="sm">
        {children}
      </Paper>
    </Center>
  );
}
