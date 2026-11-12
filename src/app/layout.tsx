import type { Metadata } from "next";
import "@mantine/core/styles.css";

import {
  ColorSchemeScript,
  MantineProvider,
  mantineHtmlProps,
} from "@mantine/core";
import { AppFrame } from "@/components/layout/AppFrame";
import { theme } from "@/theme";

export const metadata: Metadata = {
  title: "Monarch Housekeeping",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" {...mantineHtmlProps}>
      <head>
        <ColorSchemeScript forceColorScheme="light" />
      </head>
      <body>
        <MantineProvider theme={theme} forceColorScheme="light">
          <AppFrame>{children}</AppFrame>
        </MantineProvider>
      </body>
    </html>
  );
}
