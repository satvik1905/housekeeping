// Ported from reference/index.html (LABEL and the mode buttons), same order.
// Each status key is also the name of its theme color.

export type RoomStatus = "checkout" | "stayover" | "stayoverRoomService";

export const STATUS_LABEL: Record<RoomStatus, string> = {
  checkout: "Checkout",
  stayover: "Stayover",
  stayoverRoomService: "Stayover + Room service",
};

export const STATUSES = (Object.keys(STATUS_LABEL) as RoomStatus[]).map(
  (value) => ({ value, label: STATUS_LABEL[value] }),
);

export const NOT_MARKED_LABEL = "Not marked";
