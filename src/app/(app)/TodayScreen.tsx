"use client";

import { useCallback, useRef, useState } from "react";
import { Button, Group, Stack, Text } from "@mantine/core";
import { useMounted } from "@mantine/hooks";
import { modals } from "@mantine/modals";
import { notifications } from "@mantine/notifications";
import { Page } from "@/components/layout/Page";
import { PageHeader } from "@/components/layout/PageHeader";
import { Section } from "@/components/layout/Section";
import { SplitLayout } from "@/components/layout/SplitLayout";
import { StickyBar } from "@/components/layout/StickyBar";
import { ModeSwitch } from "@/components/ModeSwitch";
import { PrintSheets } from "@/components/print/PrintSheets";
import { RoomGrid } from "@/components/RoomGrid";
import { RoomTile } from "@/components/RoomTile";
import { StaffChip } from "@/components/StaffChip";
import type { Floor } from "@/data/rooms";
import { ROOMS } from "@/data/rooms";
import { ROLE_GROUPS } from "@/data/staff";
import type { RoomStatus } from "@/data/status";
import { useDayRefresh } from "@/hooks/useDayRefresh";
import { prettyDate } from "@/lib/date";
import { createSaveQueue } from "@/lib/saveQueue";
import type { Today, TodayStaff, WriteResult } from "@/server/todayData";
import { clearDay, getToday, setMark, togglePick } from "@/server/today";

const FLOORS: { floor: Floor; title: string }[] = [
  { floor: 1, title: "100s" },
  { floor: 2, title: "200s" },
];

const showSaveFailed = () =>
  notifications.show({
    id: "save-failed",
    message: "Couldn't save. Check the Wi-Fi and try again.",
    autoClose: false,
  });

const showDayChanged = () =>
  notifications.show({
    id: "day-changed",
    message: "The day changed, so the screen was reset to today.",
  });

type TodayScreenProps = {
  // Loaded on the server for the first render
  initial: Today;
};

export function TodayScreen({ initial }: TodayScreenProps) {
  const mounted = useMounted();
  // The mode isn't saved; it always starts on Checkout
  const [mode, setMode] = useState<RoomStatus>("checkout");
  // The screen updates on every tap; saves follow in the background
  const [day, setDay] = useState(initial);

  const [queue] = useState(createSaveQueue);
  // Bumped on every tap, so a reload that started before a tap doesn't
  // overwrite it with older data
  const taps = useRef(0);

  // Reload today from the database, once every queued save has run
  const reload = useCallback(async () => {
    await queue.idle();
    const startedAt = taps.current;
    try {
      const fresh = await getToday();
      if (taps.current === startedAt) setDay(fresh);
    } catch {
      // Offline: keep the screen as it is
    }
  }, [queue]);

  // Queue one save. On failure the screen keeps the tap. If the day
  // changed, reload today (not awaited: reload waits for this save).
  const save = (key: string, write: () => Promise<WriteResult>) => {
    taps.current++;
    const task = async () => {
      try {
        const result = await write();
        if (!result.ok) {
          void reload();
          showDayChanged();
        }
      } catch {
        showSaveFailed();
      }
    };
    void (key === "clear" ? queue.runAlone(task) : queue.run(key, task));
  };

  // Same as the reference: tapping a room already in the current mode
  // unmarks it; otherwise it's set to the current mode.
  const toggleRoom = (number: number) => {
    const status = day.marks[number] === mode ? null : mode;
    setDay((current) => {
      const marks = { ...current.marks };
      if (status === null) delete marks[number];
      else marks[number] = status;
      return { ...current, marks };
    });
    save(`room:${number}`, () => setMark(day.date, number, status));
  };

  // Same as the reference: tap to pick (added to the end), tap again to
  // unpick. Picks share one queue, since each pick's number depends on
  // the picks saved before it.
  const toggleStaff = (member: TodayStaff) => {
    setDay((current) => ({
      ...current,
      picks: current.picks.some((pick) => pick.id === member.id)
        ? current.picks.filter((pick) => pick.id !== member.id)
        : [...current.picks, member],
    }));
    save("picks", () => togglePick(day.date, member.id));
  };

  const confirmClear = () =>
    modals.openConfirmModal({
      children: <Text>Clear all rooms and staff? This can&apos;t be undone.</Text>,
      labels: { confirm: "Clear", cancel: "Cancel" },
      confirmProps: { color: "red" },
      // Like the reference's confirm(): no close button (it'd be under 44px)
      withCloseButton: false,
      onConfirm: () => {
        setDay((current) => ({ ...current, marks: {}, picks: [] }));
        save("clear", () => clearDay(day.date));
      },
    });

  // Refresh on wake, and reset to the new day at midnight
  useDayRefresh(day.date, () => void reload());

  const nobodyPicked = day.picks.length === 0;

  return (
    <Page>
      <PageHeader title="Today" subtitle={prettyDate(day.date)} />

      <SplitLayout
        main={
          <>
            <StickyBar>
              <Stack gap="xs">
                <Group gap="xs">
                  <Text size="sm" c="textSecondary">
                    Tap rooms to mark as
                  </Text>
                  <ModeSwitch value={mode} onChange={setMode} />
                </Group>
                <Text size="sm" c="textSecondary">
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

            <Stack gap="xs">
              {nobodyPicked && (
                <Text size="sm" c="textSecondary">
                  Pick at least one person to print.
                </Text>
              )}
              <Group gap="xs">
                <Button variant="default" onClick={confirmClear}>
                  Clear
                </Button>
                <Button disabled={nobodyPicked} onClick={() => window.print()}>
                  Print sheets
                </Button>
              </Group>
            </Stack>
          </>
        }
      />

      {/* PrintSheets renders into <body>, so only once on the client */}
      {mounted && <PrintSheets members={day.picks} date={day.date} statuses={day.marks} />}
    </Page>
  );
}
