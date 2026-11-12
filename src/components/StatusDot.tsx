import { Box } from "@mantine/core";
import type { RoomStatus } from "@/data/status";
import classes from "./StatusDot.module.css";

type StatusDotProps = {
  status: RoomStatus;
};

export function StatusDot({ status }: StatusDotProps) {
  return <Box className={classes.root} mod={{ status }} aria-hidden />;
}
