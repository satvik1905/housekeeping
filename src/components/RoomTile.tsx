import type { ReactNode, Ref } from "react";
import { Box, Stack, Text, UnstyledButton } from "@mantine/core";
import type { Room } from "@/data/rooms";
import type { RoomStatus } from "@/data/status";
import { NOT_MARKED_LABEL, STATUS_LABEL } from "@/data/status";
import classes from "./RoomTile.module.css";

type RoomTileProps = {
  room: Room;
  status?: RoomStatus;
  // Makes the tile a button (Rooms step)
  onClick?: () => void;
  // Highlights the tile while something is dragged over it (Assign step)
  dropTarget?: boolean;
  // Shown under the status (Assign step: the assignee or a drop hint)
  children?: ReactNode;
  ref?: Ref<HTMLElement>;
};

export function RoomTile({ room, status, onClick, dropTarget, children, ref }: RoomTileProps) {
  const statusLabel = status ? STATUS_LABEL[status] : NOT_MARKED_LABEL;
  const label = `Room ${room.number}, ${room.bedType}, ${statusLabel}`;

  const content = (
    <>
      <Text size="xl" className={classes.number}>
        {room.number}
      </Text>
      <Text size="xs" c="textSecondary">
        {room.bedType}
      </Text>
      <Stack className={classes.bottom} gap="xs">
        {status && (
          <Text size="sm" className={classes.status}>
            {statusLabel}
          </Text>
        )}
        {children}
      </Stack>
    </>
  );

  const mod = { status, "drop-target": dropTarget };
  return onClick ? (
    <UnstyledButton
      ref={ref as Ref<HTMLButtonElement>}
      className={classes.root}
      mod={mod}
      onClick={onClick}
      aria-label={label}
    >
      {content}
    </UnstyledButton>
  ) : (
    <Box
      ref={ref as Ref<HTMLDivElement>}
      className={classes.root}
      mod={mod}
      role="group"
      aria-label={label}
    >
      {content}
    </Box>
  );
}
