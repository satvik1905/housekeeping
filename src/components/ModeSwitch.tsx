import { Group, SegmentedControl } from "@mantine/core";
import { StatusDot } from "@/components/StatusDot";
import type { RoomStatus } from "@/data/status";
import { STATUSES } from "@/data/status";
import classes from "./ModeSwitch.module.css";

const OPTIONS = STATUSES.map(({ value, label }) => ({
  value,
  label: (
    <Group gap="xs" justify="center" wrap="nowrap">
      <StatusDot status={value} />
      {label}
    </Group>
  ),
}));

type ModeSwitchProps = {
  value: RoomStatus;
  onChange: (value: RoomStatus) => void;
};

export function ModeSwitch({ value, onChange }: ModeSwitchProps) {
  return (
    <SegmentedControl
      data={OPTIONS}
      value={value}
      onChange={(next) => onChange(next as RoomStatus)}
      mod={{ mode: value }}
      classNames={{
        root: classes.root,
        indicator: classes.indicator,
        label: classes.label,
      }}
    />
  );
}
