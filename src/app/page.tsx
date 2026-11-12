"use client";

import { useState } from "react";
import { Button, Group, SegmentedControl, Stack, Text } from "@mantine/core";
import { modals } from "@mantine/modals";
import { Page } from "@/components/layout/Page";
import { PageHeader } from "@/components/layout/PageHeader";
import { Section } from "@/components/layout/Section";
import { StickyBar } from "@/components/layout/StickyBar";
import { RoomGrid } from "@/components/RoomGrid";
import { RoomTile } from "@/components/RoomTile";
import { StatusDot } from "@/components/StatusDot";
import type { Floor } from "@/data/rooms";
import { ROOMS } from "@/data/rooms";
import type { RoomStatus } from "@/data/status";
import { STATUSES } from "@/data/status";
import { useToday } from "@/hooks/useToday";
import { prettyDate } from "@/lib/date";

const MODE_OPTIONS = STATUSES.map(({ value, label }) => ({
  value,
  label: (
    <Group gap="xs" justify="center" wrap="nowrap">
      <StatusDot status={value} />
      {label}
    </Group>
  ),
}));

const FLOORS: { floor: Floor; title: string }[] = [
  { floor: 1, title: "100s" },
  { floor: 2, title: "200s" },
];

export default function Today() {
  const today = useToday();
  const [mode, setMode] = useState<RoomStatus>("checkout");
  // In memory only for now
  const [statuses, setStatuses] = useState<Partial<Record<number, RoomStatus>>>({});

  // Same as the reference: tapping a room already in the current mode
  // unmarks it; otherwise it's set to the current mode.
  const toggleRoom = (number: number) => {
    setStatuses((current) => {
      const next = { ...current };
      if (next[number] === mode) delete next[number];
      else next[number] = mode;
      return next;
    });
  };

  // Button labels match the reference's native confirm(): OK / Cancel
  const confirmClear = () =>
    modals.openConfirmModal({
      children: <Text>Clear all rooms and housekeepers? This can&apos;t be undone.</Text>,
      labels: { confirm: "OK", cancel: "Cancel" },
      // Like the reference's confirm(): no close button (it'd be under 44px)
      withCloseButton: false,
      onConfirm: () => setStatuses({}),
    });

  return (
    <Page>
      <PageHeader
        title="Today"
        // Non-breaking space keeps the line's height until the date is known
        subtitle={today ? prettyDate(today) : "\u00a0"}
        actions={
          <Button variant="default" onClick={confirmClear}>
            Clear
          </Button>
        }
      />

      <StickyBar>
        <Stack gap="xs">
          <Group gap="xs">
            <Text size="sm" c="dimmed">
              Tap rooms to mark as
            </Text>
            <SegmentedControl
              data={MODE_OPTIONS}
              value={mode}
              onChange={(value) => setMode(value as RoomStatus)}
              color={mode}
            />
          </Group>
          <Text size="sm" c="dimmed">
            Tap a room again to unmark it.
          </Text>
        </Stack>
      </StickyBar>

      {FLOORS.map(({ floor, title }) => (
        <Section key={floor} title={title}>
          <RoomGrid>
            {ROOMS.filter((room) => room.floor === floor).map((room) => (
              <RoomTile
                key={room.number}
                room={room}
                status={statuses[room.number]}
                onClick={() => toggleRoom(room.number)}
              />
            ))}
          </RoomGrid>
        </Section>
      ))}
    </Page>
  );
}
