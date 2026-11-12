"use client";

import type { ReactNode } from "react";
import { createContext, use, useCallback, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Button, Stepper, Text } from "@mantine/core";
import { useMounted } from "@mantine/hooks";
import { modals } from "@mantine/modals";
import { notifications } from "@mantine/notifications";
import { FlowLayout } from "@/components/layout/FlowLayout";
import { PageHeader } from "@/components/layout/PageHeader";
import { PrintSheets } from "@/components/print/PrintSheets";
import type { RoomStatus } from "@/data/status";
import { useDayRefresh } from "@/hooks/useDayRefresh";
import { prettyDate } from "@/lib/date";
import { createSaveQueue } from "@/lib/saveQueue";
import { clearDay, getToday, setMark, togglePick } from "@/server/today";
import type { Today, TodayStaff, WriteResult } from "@/server/todayData";

// The flow's steps, in order
const STEPS = [
  { label: "Rooms", href: "/" },
  { label: "Assign", href: "/assign" },
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

type TodayContextValue = {
  day: Today;
  mode: RoomStatus;
  setMode: (mode: RoomStatus) => void;
  toggleRoom: (number: number) => void;
  toggleStaff: (member: TodayStaff) => void;
  confirmClear: () => void;
};

const TodayContext = createContext<TodayContextValue | null>(null);

// The day state shared by both steps
export function useTodayFlow(): TodayContextValue {
  const value = use(TodayContext);
  if (!value) throw new Error("useTodayFlow must be used inside TodayFlow");
  return value;
}

type TodayFlowProps = {
  // Loaded on the server for the first render
  initial: Today;
  // The current step's body
  children: ReactNode;
};

export function TodayFlow({ initial, children }: TodayFlowProps) {
  const router = useRouter();
  const pathname = usePathname();
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
  // unmarks it; otherwise it's set to the current mode. Unmarking also
  // drops the room's assignment, as the database does.
  const toggleRoom = (number: number) => {
    const status = day.marks[number] === mode ? null : mode;
    setDay((current) => {
      const marks = { ...current.marks };
      const assignments = { ...current.assignments };
      if (status === null) {
        delete marks[number];
        delete assignments[number];
      } else {
        marks[number] = status;
      }
      return { ...current, marks, assignments };
    });
    save(`room:${number}`, () => setMark(day.date, number, status));
  };

  // Same as the reference: tap to pick (added to the end), tap again to
  // unpick. Picks share one queue, since each pick's number depends on
  // the picks saved before it. Unpicking also drops the person's
  // assignments, as the database does.
  const toggleStaff = (member: TodayStaff) => {
    setDay((current) => {
      if (!current.picks.some((pick) => pick.id === member.id)) {
        return { ...current, picks: [...current.picks, member] };
      }
      const assignments = Object.fromEntries(
        Object.entries(current.assignments).filter(([, staffId]) => staffId !== member.id),
      );
      return {
        ...current,
        picks: current.picks.filter((pick) => pick.id !== member.id),
        assignments,
      };
    });
    save("picks", () => togglePick(day.date, member.id));
  };

  const confirmClear = () =>
    modals.openConfirmModal({
      children: <Text>Clear all rooms and staff? This can&apos;t be undone.</Text>,
      labels: { confirm: "Clear", cancel: "Cancel" },
      confirmProps: { color: "red" },
      // Like the reference's confirm(): no close button
      withCloseButton: false,
      onConfirm: () => {
        setDay((current) => ({ ...current, marks: {}, picks: [], assignments: {}, prints: {} }));
        save("clear", () => clearDay(day.date));
      },
    });

  // Refresh on wake, and reset to the new day at midnight
  useDayRefresh(day.date, () => void reload());

  const nobodyPicked = day.picks.length === 0;
  const step = Math.max(
    0,
    STEPS.findIndex(({ href }) => href === pathname),
  );

  const footer =
    step === 0
      ? {
          footerActions: <Button onClick={() => router.push(STEPS[1].href)}>Next</Button>,
        }
      : {
          footerStart: nobodyPicked && (
            <Text size="sm" c="textSecondary">
              Pick at least one person to print.
            </Text>
          ),
          footerActions: (
            <>
              <Button variant="default" onClick={() => router.push(STEPS[0].href)}>
                Back
              </Button>
              <Button disabled={nobodyPicked} onClick={() => window.print()}>
                Print sheets
              </Button>
            </>
          ),
        };

  return (
    <TodayContext value={{ day, mode, setMode, toggleRoom, toggleStaff, confirmClear }}>
      <FlowLayout {...footer}>
        {/* Completed steps are clickable and go back; later ones aren't */}
        <Stepper
          active={step}
          allowNextStepsSelect={false}
          onStepClick={(index) => router.push(STEPS[index].href)}
        >
          {STEPS.map(({ label }) => (
            <Stepper.Step key={label} label={label} />
          ))}
        </Stepper>
        <PageHeader title="Today" subtitle={prettyDate(day.date)} />
        {children}
      </FlowLayout>

      {/* PrintSheets renders into <body>, so only once on the client */}
      {mounted && <PrintSheets members={day.picks} date={day.date} statuses={day.marks} />}
    </TodayContext>
  );
}
