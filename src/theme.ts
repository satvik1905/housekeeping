"use client";

import { Figtree } from "next/font/google";
import {
  Button,
  Chip,
  colorsTuple,
  createTheme,
  CSSVariablesResolver,
  DEFAULT_THEME,
  Input,
  NavLink,
  rem,
  SegmentedControl,
} from "@mantine/core";
import { generateColors } from "@mantine/colors-generator";

const figtree = Figtree({ subsets: ["latin"] });

// Minimum height for anything tappable (CLAUDE.md: Touch)
export const TOUCH_TARGET = rem(44);

export const theme = createTheme({
  fontFamily: figtree.style.fontFamily,
  headings: { fontFamily: figtree.style.fontFamily },

  // Navy from the logo; generateColors places #2B3445 at shade 9
  colors: {
    navy: generateColors("#2B3445"),
    // Status colors from reference/index.html, exact hex at every shade
    checkout: colorsTuple("#9A4B2F"),
    stayover: colorsTuple("#2F5E86"),
    stayoverRoomService: colorsTuple("#6A4A8C"),
    // Status tile backgrounds from reference/index.html (--co-bg, --so-bg, --rs-bg)
    checkoutBg: colorsTuple("#F6E7E0"),
    stayoverBg: colorsTuple("#E2ECF5"),
    stayoverRoomServiceBg: colorsTuple("#ECE4F4"),
    // Secondary text (CLAUDE.md: UI). Lightest Mantine gray at 4.5:1 on white
    // and on every status tint: gray.7, 6.61:1 at worst (stayoverRoomServiceBg)
    textSecondary: colorsTuple(DEFAULT_THEME.colors.gray[7]),
  },
  primaryColor: "navy",
  primaryShade: 9,

  defaultRadius: rem(12),

  // Added alongside Mantine's defaults (xs–xl stay unchanged).
  // Keep in sync with mantine-breakpoint-tablet in postcss.config.cjs.
  breakpoints: {
    tablet: "64em", // 1024px
  },

  spacing: {
    xs: rem(8),
    md: rem(16),
    lg: rem(24),
    xl: rem(32),
  },

  components: {
    Button: Button.extend({
      styles: { root: { minHeight: TOUCH_TARGET } },
    }),
    Chip: Chip.extend({
      styles: { label: { minHeight: TOUCH_TARGET } },
    }),
    SegmentedControl: SegmentedControl.extend({
      styles: {
        label: {
          minHeight: TOUCH_TARGET,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        },
      },
    }),
    Input: Input.extend({
      styles: { input: { minHeight: TOUCH_TARGET } },
    }),
    NavLink: NavLink.extend({
      styles: {
        root: {
          minHeight: TOUCH_TARGET,
          // NavLink has no radius prop; use the theme's defaultRadius
          borderRadius: "var(--mantine-radius-default)",
        },
      },
    }),
  },
});

// Mantine's built-in secondary text (dimmed) uses textSecondary too
export const cssVariablesResolver: CSSVariablesResolver = () => ({
  variables: {},
  light: { "--mantine-color-dimmed": "var(--mantine-color-textSecondary-filled)" },
  dark: {},
});
