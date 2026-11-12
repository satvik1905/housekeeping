"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { PinInput, Stack, Text } from "@mantine/core";
import { verifyPin } from "@/server/auth";

const MESSAGES = {
  wrongPin: "Wrong PIN.",
  locked: "Too many tries. Try again in 15 minutes.",
};

export function PinForm() {
  const router = useRouter();
  const [pin, setPin] = useState("");
  const [error, setError] = useState<keyof typeof MESSAGES | null>(null);
  const checking = useRef(false);

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
      if (result.error === "wrongPin") setPin("");
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
        disabled={error === "locked"}
      />
      {error && <Text role="alert">{MESSAGES[error]}</Text>}
    </Stack>
  );
}
