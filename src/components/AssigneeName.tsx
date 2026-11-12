import type { HTMLAttributes, Ref } from "react";
import { Badge } from "@mantine/core";
import classes from "./AssigneeName.module.css";

type AssigneeNameProps = {
  name: string;
  ref?: Ref<HTMLDivElement>;
  dragging?: boolean;
} & HTMLAttributes<HTMLDivElement>;

// The housekeeper assigned to a room, shown on its tile; draggable
export function AssigneeName({ name, ref, dragging, ...rest }: AssigneeNameProps) {
  return (
    <Badge
      ref={ref}
      className={classes.root}
      mod={{ dragging }}
      component="div"
      variant="filled"
      size="lg"
      tt="none"
      {...rest}
    >
      {name}
    </Badge>
  );
}
