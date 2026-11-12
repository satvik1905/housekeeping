// Ported from reference/index.html (STAFF), in the same order.

export type StaffRole = "housekeeper" | "laundry" | "maintenance";

export type StaffMember = {
  name: string;
  role: StaffRole;
};

export const STAFF: readonly StaffMember[] = [
  { name: "Maria", role: "housekeeper" },
  { name: "Mari", role: "housekeeper" },
  { name: "Mabel", role: "housekeeper" },
  { name: "Isabel", role: "housekeeper" },
  { name: "Peya", role: "housekeeper" },
  { name: "Berta", role: "housekeeper" },
  { name: "Eloy", role: "maintenance" },
  { name: "Jose", role: "laundry" },
  { name: "Ivan", role: "laundry" },
];

export function getHousekeepers(): StaffMember[] {
  return STAFF.filter((member) => member.role === "housekeeper");
}

// Staff picker groups on the Today screen, in display order
export const ROLE_GROUPS: readonly { role: StaffRole; label: string }[] = [
  { role: "housekeeper", label: "Housekeepers" },
  { role: "laundry", label: "Laundry" },
  { role: "maintenance", label: "Maintenance" },
];
