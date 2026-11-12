import { Box, Chip } from "@mantine/core";
import classes from "./StaffChip.module.css";

type StaffChipProps = {
  name: string;
  // 1-based position in the pick order; undefined when not picked
  pickNumber?: number;
  onToggle: () => void;
};

export function StaffChip({ name, pickNumber, onToggle }: StaffChipProps) {
  return (
    <Chip
      variant="outline"
      checked={pickNumber !== undefined}
      onChange={onToggle}
      icon={<Box className={classes.number}>{pickNumber}</Box>}
      classNames={{ label: classes.label, iconWrapper: classes.iconWrapper }}
    >
      {name}
    </Chip>
  );
}
