"use client";

import { useState } from "react";
import { Button, Group, Stack, Text } from "@mantine/core";
import { modals } from "@mantine/modals";
import { Page } from "@/components/layout/Page";
import { PageHeader } from "@/components/layout/PageHeader";
import { Section } from "@/components/layout/Section";
import { StickyBar } from "@/components/layout/StickyBar";
import { ModeSwitch } from "@/components/ModeSwitch";
import { RoomGrid } from "@/components/RoomGrid";
import { RoomTile } from "@/components/RoomTile";
import { StaffChip } from "@/components/StaffChip";
import type { Floor } from "@/data/rooms";
import { ROOMS } from "@/data/rooms";
import { ROLE_GROUPS, STAFF } from "@/data/staff";
import type { RoomStatus } from "@/data/status";
import { useToday } from "@/hooks/useToday";
import { prettyDate } from "@/lib/date";

// Everything that belongs to one day. A new Pacific date starts empty.
type DayState = {
  date: string | null;
  statuses: Partial<Record<number, RoomStatus>>;
  // Names of picked staff, in the order picked
  staff: string[];
};

const emptyDay = (date: string | null): DayState => ({
  date,
  statuses: {},
  staff: [],
});

const FLOORS: { floor: Floor; title: string }[] = [
  { floor: 1, title: "100s" },
  { floor: 2, title: "200s" },
];

export default function Today() {
  const today = useToday();
  const [mode, setMode] = useState<RoomStatus>("checkout");
  // In memory only for now
  const [day, setDay] = useState(() => emptyDay(today));

  // The date changed (midnight, or the tablet woke up on a new day): reset.
  // The first date after hydration just fills in; nothing was marked yet.
  if (today !== day.date) {
    setDay(day.date === null ? { ...day, date: today } : emptyDay(today));
  }

  // Same as the reference: tapping a room already in the current mode
  // unmarks it; otherwise it's set to the current mode.
  const toggleRoom = (number: number) => {
    setDay((current) => {
      const statuses = { ...current.statuses };
      if (statuses[number] === mode) delete statuses[number];
      else statuses[number] = mode;
      return { ...current, statuses };
    });
  };

  // Same as the reference: tap to pick (added to the end), tap again to unpick
  const toggleStaff = (name: string) => {
    setDay((current) => ({
      ...current,
      staff: current.staff.includes(name)
        ? current.staff.filter((picked) => picked !== name)
        : [...current.staff, name],
    }));
  };

  const confirmClear = () =>
    modals.openConfirmModal({
      children: <Text>Clear all rooms and housekeepers? This can&apos;t be undone.</Text>,
      labels: { confirm: "Clear", cancel: "Cancel" },
      confirmProps: { color: "red" },
      // Like the reference's confirm(): no close button (it'd be under 44px)
      withCloseButton: false,
      onConfirm: () => setDay((current) => emptyDay(current.date)),
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
            <ModeSwitch value={mode} onChange={setMode} />
          </Group>
          <Text size="sm" c="dimmed">
            Tap a room again to unmark it.
          </Text>
        </Stack>
      </StickyBar>

      <Section title="Staff">
        <Text size="sm" c="dimmed">
          Pick who&apos;s working today. Sheets print in the order you pick them.
        </Text>
        {ROLE_GROUPS.map(({ role, label }) => (
          <Stack key={role} gap="xs">
            <Text size="sm" fw={600} c="dimmed">
              {label}
            </Text>
            <Group gap="xs">
              {STAFF.filter((member) => member.role === role).map(({ name }) => {
                const index = day.staff.indexOf(name);
                return (
                  <StaffChip
                    key={name}
                    name={name}
                    pickNumber={index === -1 ? undefined : index + 1}
                    onToggle={() => toggleStaff(name)}
                  />
                );
              })}
            </Group>
          </Stack>
        ))}
      </Section>

      {FLOORS.map(({ floor, title }) => (
        <Section key={floor} title={title}>
          <RoomGrid>
            {ROOMS.filter((room) => room.floor === floor).map((room) => (
              <RoomTile
                key={room.number}
                room={room}
                status={day.statuses[room.number]}
                onClick={() => toggleRoom(room.number)}
              />
            ))}
          </RoomGrid>
        </Section>
      ))}
    </Page>
  );
}
