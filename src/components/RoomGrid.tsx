import type { ReactNode } from "react";
import { Box } from "@mantine/core";
import classes from "./RoomGrid.module.css";

type RoomGridProps = {
  children: ReactNode;
};

export function RoomGrid({ children }: RoomGridProps) {
  return <Box className={classes.root}>{children}</Box>;
}
