import type { Metadata } from "next";
import "@mantine/core/styles.css";
import "@mantine/notifications/styles.css";

import {
  ColorSchemeScript,
  MantineProvider,
  mantineHtmlProps,
} from "@mantine/core";
import { ModalsProvider } from "@mantine/modals";
import { Notifications } from "@mantine/notifications";
import { AppFrame } from "@/components/layout/AppFrame";
import { cssVariablesResolver, theme } from "@/theme";

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
        <MantineProvider
          theme={theme}
          cssVariablesResolver={cssVariablesResolver}
          forceColorScheme="light"
        >
          <Notifications />
          <ModalsProvider>
            <AppFrame>{children}</AppFrame>
          </ModalsProvider>
        </MantineProvider>
      </body>
    </html>
  );
}
