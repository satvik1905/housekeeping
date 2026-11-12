"use client";

import { Figtree } from "next/font/google";
import {
  Button,
  Chip,
  colorsTuple,
  createTheme,
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
  },
  primaryColor: "navy",
  primaryShade: 9,

  defaultRadius: rem(12),

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
      styles: { root: { minHeight: TOUCH_TARGET } },
    }),
  },
});
