import type { HTMLAttributes, Ref } from "react";
import { Paper, Text } from "@mantine/core";
import classes from "./HousekeeperCard.module.css";

type HousekeeperCardProps = {
  name: string;
  checkouts: number;
  // Stayover and Stayover + Room service rooms
  stayovers: number;
  // Drag source props (Assign step)
  ref?: Ref<HTMLDivElement>;
  dragging?: boolean;
} & HTMLAttributes<HTMLDivElement>;

// One picked housekeeper and the rooms they have
export function HousekeeperCard({
  name,
  checkouts,
  stayovers,
  ref,
  dragging,
  ...rest
}: HousekeeperCardProps) {
  const rooms = checkouts + stayovers;
  return (
    <Paper
      ref={ref}
      className={classes.root}
      mod={{ dragging }}
      withBorder
      p="xs"
      {...rest}
    >
      <Text fw={600}>{name}</Text>
      <Text size="sm">
        {rooms} {rooms === 1 ? "room" : "rooms"}
      </Text>
      <Text size="sm" c="textSecondary">
        {checkouts} C/O · {stayovers} S/O
      </Text>
    </Paper>
  );
}
