"use client";

import { Button, Group, Stack, Text } from "@mantine/core";
import { Section } from "@/components/layout/Section";
import { SplitLayout } from "@/components/layout/SplitLayout";
import { StickyBar } from "@/components/layout/StickyBar";
import { ModeSwitch } from "@/components/ModeSwitch";
import { RoomGrid } from "@/components/RoomGrid";
import { RoomTile } from "@/components/RoomTile";
import { StaffChip } from "@/components/StaffChip";
import { StatusCounts } from "@/components/StatusCounts";
import type { Floor } from "@/data/rooms";
import { ROOMS } from "@/data/rooms";
import { ROLE_GROUPS } from "@/data/staff";
import { useTodayFlow } from "./TodayFlow";

const FLOORS: { floor: Floor; title: string }[] = [
  { floor: 1, title: "100s" },
  { floor: 2, title: "200s" },
];

// Step 1: mark rooms and pick who's working
export default function RoomsStep() {
  const { day, mode, setMode, toggleRoom, toggleStaff, confirmClear } = useTodayFlow();

  return (
    <SplitLayout
      main={
        <>
          <StickyBar>
            <Group gap="xs">
              <Text size="sm" c="textSecondary">
                Tap rooms to mark as
              </Text>
              <ModeSwitch value={mode} onChange={setMode} />
              <StatusCounts marks={day.marks} />
            </Group>
          </StickyBar>

          {FLOORS.map(({ floor, title }) => (
            <Section key={floor} title={title}>
              <RoomGrid>
                {ROOMS.filter((room) => room.floor === floor).map((room) => (
                  <RoomTile
                    key={room.number}
                    room={room}
                    status={day.marks[room.number]}
                    onClick={() => toggleRoom(room.number)}
                  />
                ))}
              </RoomGrid>
            </Section>
          ))}
        </>
      }
      panel={
        <>
          <Section title="Staff">
            <Text size="sm" c="textSecondary">
              Pick who&apos;s working today. Sheets print in the order you pick them.
            </Text>
            {ROLE_GROUPS.map(({ role, label }) => (
              <Stack key={role} gap="xs">
                <Text size="sm" fw={600} c="textSecondary">
                  {label}
                </Text>
                <Group gap="xs">
                  {day.staff
                    .filter((member) => member.role === role)
                    .map((member) => {
                      const index = day.picks.findIndex((pick) => pick.id === member.id);
                      return (
                        <StaffChip
                          key={member.id}
                          name={member.name}
                          pickNumber={index === -1 ? undefined : index + 1}
                          onToggle={() => toggleStaff(member)}
                        />
                      );
                    })}
                </Group>
              </Stack>
            ))}
          </Section>

          <Group gap="xs">
            <Button variant="default" onClick={confirmClear}>
              Clear
            </Button>
          </Group>
        </>
      }
    />
  );
}
