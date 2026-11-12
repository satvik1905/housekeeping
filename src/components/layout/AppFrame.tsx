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
} from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import {
  IconCalendar,
  IconChartBar,
  IconHistory,
  IconLayoutSidebarLeftCollapse,
  IconLayoutSidebarLeftExpand,
  IconUsers,
} from "@tabler/icons-react";
import { TOUCH_TARGET } from "@/theme";
import classes from "./AppFrame.module.css";

const NAV_ITEMS = [
  { label: "Today", href: "/", icon: IconCalendar },
  { label: "Past days", href: "/past", icon: IconHistory },
  { label: "Staff", href: "/staff", icon: IconUsers },
  { label: "Analytics", href: "/analytics", icon: IconChartBar },
];

// Full sidebar from 1024px (tablet landscape and up)
const WIDE_QUERY = "(min-width: 64em)";
const FULL_WIDTH = 240;
// Icon-only: one touch target plus xs navbar padding on each side,
// plus the 1px border Mantine draws on the navbar's inline end
const ICON_WIDTH = `calc(${TOUCH_TARGET} + 2 * var(--mantine-spacing-xs) + 1px)`;

type AppFrameProps = {
  children: ReactNode;
};

export function AppFrame({ children }: AppFrameProps) {
  const pathname = usePathname();
  const isWide = useMediaQuery(WIDE_QUERY);
  const [userCollapsed, setUserCollapsed] = useState(false);
  const iconOnly = !isWide || userCollapsed;

  return (
    <AppShell
      navbar={{
        width: iconOnly ? ICON_WIDTH : FULL_WIDTH,
        // Never switch to Mantine's full-width mobile navbar
        breakpoint: 0,
      }}
    >
      <AppShell.Navbar p="xs">
        {/* Logo slot, filled in later */}
        <AppShell.Section />

        <AppShell.Section grow>
          <Stack gap="md">
            {NAV_ITEMS.map(({ label, href, icon: Icon }) => {
              const active = pathname === href;

              if (!iconOnly) {
                return (
                  <NavLink
                    key={href}
                    component={Link}
                    href={href}
                    label={label}
                    leftSection={<Icon />}
                    active={active}
                  />
                );
              }

              return (
                <Tooltip key={href} label={label} position="right">
                  <NavLink
                    component={Link}
                    href={href}
                    aria-label={label}
                    leftSection={<Icon />}
                    active={active}
                    classNames={{
                      root: classes.iconOnly,
                      section: classes.iconOnlySection,
                      body: classes.iconOnlyBody,
                    }}
                  />
                </Tooltip>
              );
            })}
          </Stack>
        </AppShell.Section>

        {isWide && (
          <AppShell.Section>
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
        )}
      </AppShell.Navbar>

      <AppShell.Main>{children}</AppShell.Main>
    </AppShell>
  );
}
