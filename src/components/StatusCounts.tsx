import { Fragment } from "react";
import { Group, Text } from "@mantine/core";
import type { RoomStatus, RoomStatuses } from "@/data/status";

// Each status counts separately: a Stayover + Room service room counts
// only under Room service
const COUNTS: { status: RoomStatus; label: string }[] = [
  { status: "checkout", label: "Checkout" },
  { status: "stayover", label: "Stayover" },
  { status: "stayoverRoomService", label: "Room service" },
];

type StatusCountsProps = {
  marks: RoomStatuses;
};

// Live counts of marked rooms, each in its status color
export function StatusCounts({ marks }: StatusCountsProps) {
  const statuses = Object.values(marks);
  return (
    <Group gap="xs" wrap="nowrap">
      {COUNTS.map(({ status, label }, index) => (
        <Fragment key={status}>
          {index > 0 && (
            <Text size="sm" c="textSecondary" aria-hidden>
              ·
            </Text>
          )}
          <Text size="sm" fw={600} c={status}>
            {label} {statuses.filter((value) => value === status).length}
          </Text>
        </Fragment>
      ))}
    </Group>
  );
}
