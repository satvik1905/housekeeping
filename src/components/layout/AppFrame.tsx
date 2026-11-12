"use client";

import type { ReactNode } from "react";
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ActionIcon,
  AppShell,
  NavLink,
  Stack,
  Tooltip,
  useMantineTheme,
} from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import {
  IconCalendar,
  IconChartBar,
  IconLayoutSidebarLeftCollapse,
  IconLayoutSidebarLeftExpand,
  IconUsers,
} from "@tabler/icons-react";
import { TOUCH_TARGET } from "@/theme";
import classes from "./AppFrame.module.css";

// hidden: the route exists but stays out of the nav until it's built
// paths: every route the item is active on (Today's steps are / and /assign)
const NAV_ITEMS = [
  { label: "Today", href: "/", paths: ["/", "/assign"], icon: IconCalendar },
  { label: "Staff", href: "/staff", paths: ["/staff"], icon: IconUsers, hidden: true },
  { label: "Analytics", href: "/analytics", paths: ["/analytics"], icon: IconChartBar, hidden: true },
].filter((item) => !item.hidden);

const FULL_WIDTH = 240;
// Icon-only: one touch target plus xs navbar padding on each side,
// plus the 1px border Mantine draws on the navbar's inline end
const ICON_WIDTH = `calc(${TOUCH_TARGET} + 2 * var(--mantine-spacing-xs) + 1px)`;

type AppFrameProps = {
  children: ReactNode;
};

export function AppFrame({ children }: AppFrameProps) {
  const pathname = usePathname();
  const theme = useMantineTheme();
  const [userCollapsed, setUserCollapsed] = useState(false);

  // Layout switches on the tablet breakpoint in CSS (no flash on load).
  // This is only used to turn tooltips off when labels are visible.
  const isWide = useMediaQuery(`(min-width: ${theme.breakpoints.tablet})`);
  const labelsVisible = isWide && !userCollapsed;

  return (
    <AppShell
      navbar={{
        width: {
          base: ICON_WIDTH,
          tablet: userCollapsed ? ICON_WIDTH : FULL_WIDTH,
        },
        // Never switch to Mantine's full-width mobile navbar
        breakpoint: 0,
      }}
    >
      <AppShell.Navbar
        p="xs"
        className={classes.navbar}
        mod={{ collapsed: userCollapsed }}
      >
        {/* Logo slot, filled in later */}
        <AppShell.Section />

        <AppShell.Section grow>
          <Stack gap="xs">
            {NAV_ITEMS.map(({ label, href, paths, icon: Icon }) => (
              <Tooltip
                key={href}
                label={label}
                position="right"
                disabled={labelsVisible}
              >
                <NavLink
                  component={Link}
                  href={href}
                  label={label}
                  aria-label={label}
                  leftSection={<Icon />}
                  active={paths.includes(pathname)}
                  classNames={{
                    root: classes.navLink,
                    section: classes.navLinkSection,
                    body: classes.navLinkBody,
                  }}
                />
              </Tooltip>
            ))}
          </Stack>
        </AppShell.Section>

        <AppShell.Section className={classes.toggle}>
          <ActionIcon
            variant="subtle"
            size={TOUCH_TARGET}
            onClick={() => setUserCollapsed((c) => !c)}
            aria-label={userCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {userCollapsed ? (
              <IconLayoutSidebarLeftExpand />
            ) : (
              <IconLayoutSidebarLeftCollapse />
            )}
          </ActionIcon>
        </AppShell.Section>
      </AppShell.Navbar>

      <AppShell.Main>{children}</AppShell.Main>
    </AppShell>
  );
}
