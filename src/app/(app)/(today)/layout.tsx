import type { ReactNode } from "react";
import { Suspense } from "react";
import { connection } from "next/server";
import { Page } from "@/components/layout/Page";
import { PageHeader } from "@/components/layout/PageHeader";
import { getToday } from "@/server/today";
import { TodayFlow } from "./TodayFlow";

// Today's two steps, Rooms (/) and Assign (/assign). The layout stays
// mounted between them, so both share one day state.
export default function TodayLayout({ children }: { children: ReactNode }) {
  return (
    <Suspense
      fallback={
        <Page>
          {/* Non-breaking space keeps the line's height until the date is known */}
          <PageHeader title="Today" subtitle={" "} />
        </Page>
      }
    >
      <LoadedToday>{children}</LoadedToday>
    </Suspense>
  );
}

// Today's state comes from the database on every request
async function LoadedToday({ children }: { children: ReactNode }) {
  await connection();
  return <TodayFlow initial={await getToday()}>{children}</TodayFlow>;
}
