"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { PinInput, Stack, Text } from "@mantine/core";
import { verifyPin } from "@/server/auth";

const MESSAGES = {
  wrongPin: "Wrong PIN.",
  locked: "Too many tries. Try again in 15 minutes.",
  offline: "Couldn't reach the server. Check the Wi-Fi and try again.",
};

export function PinForm() {
  const router = useRouter();
  const [pin, setPin] = useState("");
  const [error, setError] = useState<keyof typeof MESSAGES | null>(null);
  // When the lockout ends; the input is disabled until then
  const [lockedUntil, setLockedUntil] = useState<Date | null>(null);
  const checking = useRef(false);

  // Re-enable the input when the lockout ends. If this device's clock is
  // ahead, the next try just reports the lock again with its end time.
  useEffect(() => {
    if (!lockedUntil) return;
    const timer = setTimeout(() => {
      setLockedUntil(null);
      setError(null);
      setPin("");
    }, lockedUntil.getTime() - Date.now());
    return () => clearTimeout(timer);
  }, [lockedUntil]);

  // Submits on the 6th digit
  const submit = async (value: string) => {
    if (checking.current) return;
    checking.current = true;
    try {
      const result = await verifyPin(value);
      if (result.ok) {
        // Next keeps this page's state after leaving it; don't bring the
        // PIN back if the session ends and the screen returns here
        setPin("");
        setError(null);
        router.replace("/");
        return;
      }
      setError(result.error);
      if (result.error === "locked") setLockedUntil(new Date(result.lockedUntil));
      else setPin("");
    } catch {
      // Clear the boxes so the next 6th digit tries again
      setError("offline");
      setPin("");
    } finally {
      checking.current = false;
    }
  };

  return (
    <Stack align="center" gap="xs">
      <PinInput
        length={6}
        type="number"
        oneTimeCode={false}
        ariaLabel="PIN"
        value={pin}
        onChange={setPin}
        onComplete={submit}
        error={error !== null}
        disabled={lockedUntil !== null}
      />
      {error && <Text role="alert">{MESSAGES[error]}</Text>}
    </Stack>
  );
}
