import { Suspense } from "react";
import { connection } from "next/server";
import { Page } from "@/components/layout/Page";
import { PageHeader } from "@/components/layout/PageHeader";
import { getToday } from "@/server/today";
import { TodayScreen } from "./TodayScreen";

export default function Today() {
  return (
    <Suspense
      fallback={
        <Page>
          {/* Non-breaking space keeps the line's height until the date is known */}
          <PageHeader title="Today" subtitle={" "} />
        </Page>
      }
    >
      <LoadedToday />
    </Suspense>
  );
}

// Today's state comes from the database on every request
async function LoadedToday() {
  await connection();
  return <TodayScreen initial={await getToday()} />;
}
