import { Text, UnstyledButton } from "@mantine/core";
import type { Room } from "@/data/rooms";
import type { RoomStatus } from "@/data/status";
import { NOT_MARKED_LABEL, STATUS_LABEL } from "@/data/status";
import classes from "./RoomTile.module.css";

type RoomTileProps = {
  room: Room;
  status?: RoomStatus;
  onClick: () => void;
};

export function RoomTile({ room, status, onClick }: RoomTileProps) {
  const statusLabel = status ? STATUS_LABEL[status] : NOT_MARKED_LABEL;

  return (
    <UnstyledButton
      className={classes.root}
      mod={{ status }}
      onClick={onClick}
      aria-label={`Room ${room.number}, ${room.bedType}, ${statusLabel}`}
    >
      <Text size="xl" className={classes.number}>
        {room.number}
      </Text>
      <Text size="xs" c="dimmed">
        {room.bedType}
      </Text>
      {status && (
        <Text size="sm" className={classes.status}>
          {statusLabel}
        </Text>
      )}
    </UnstyledButton>
  );
}
