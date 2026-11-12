"use client";

import { useState } from "react";
import { Group, SegmentedControl, Stack, Text } from "@mantine/core";
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

  return (
    <Page>
      <PageHeader title="Today" />

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
