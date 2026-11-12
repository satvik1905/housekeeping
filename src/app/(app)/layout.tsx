import { AppFrame } from "@/components/layout/AppFrame";

// Every screen behind the PIN shares the app frame; /login has none
export default function AppLayout({ children }: LayoutProps<"/">) {
  return <AppFrame>{children}</AppFrame>;
}
