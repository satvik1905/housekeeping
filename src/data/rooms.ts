// Ported from reference/index.html (TYPES / ROOMS). Names copied exactly.

export const BED_TYPES = [
  "Queen Room w/ Fireplace",
  "King w/ Fireplace",
  "Two Queen Beds",
  "Two Queen Beds w/ Fireplace",
  "King Bed",
  "Kitchenette",
  "Handicap Double",
  "Handicap King Fireplace",
] as const;

export type BedType = (typeof BED_TYPES)[number];

export type Floor = 1 | 2;

// Room sections on screen, in order
export const FLOORS: readonly { floor: Floor; title: string }[] = [
  { floor: 1, title: "100s" },
  { floor: 2, title: "200s" },
];

export type Room = {
  number: number;
  bedType: BedType;
  floor: Floor;
};

// Sorted by room number. Floor 1 = 100s, floor 2 = 200s.
export const ROOMS: readonly Room[] = [
  { number: 101, bedType: "Queen Room w/ Fireplace", floor: 1 },
  { number: 102, bedType: "Queen Room w/ Fireplace", floor: 1 },
  { number: 104, bedType: "Handicap King Fireplace", floor: 1 },
  { number: 105, bedType: "Two Queen Beds w/ Fireplace", floor: 1 },
  { number: 107, bedType: "King w/ Fireplace", floor: 1 },
  { number: 108, bedType: "Queen Room w/ Fireplace", floor: 1 },
  { number: 109, bedType: "Kitchenette", floor: 1 },
  { number: 110, bedType: "King w/ Fireplace", floor: 1 },
  { number: 111, bedType: "Two Queen Beds", floor: 1 },
  { number: 112, bedType: "King Bed", floor: 1 },
  { number: 113, bedType: "King w/ Fireplace", floor: 1 },
  { number: 114, bedType: "Two Queen Beds w/ Fireplace", floor: 1 },
  { number: 115, bedType: "Two Queen Beds w/ Fireplace", floor: 1 },
  { number: 116, bedType: "Two Queen Beds w/ Fireplace", floor: 1 },
  { number: 117, bedType: "Two Queen Beds", floor: 1 },
  { number: 118, bedType: "Two Queen Beds", floor: 1 },
  { number: 119, bedType: "Two Queen Beds", floor: 1 },
  { number: 120, bedType: "Handicap Double", floor: 1 },
  { number: 121, bedType: "King w/ Fireplace", floor: 1 },
  { number: 122, bedType: "King w/ Fireplace", floor: 1 },
  { number: 123, bedType: "King Bed", floor: 1 },
  { number: 124, bedType: "Queen Room w/ Fireplace", floor: 1 },
  { number: 125, bedType: "Queen Room w/ Fireplace", floor: 1 },
  { number: 201, bedType: "King w/ Fireplace", floor: 2 },
  { number: 202, bedType: "Queen Room w/ Fireplace", floor: 2 },
  { number: 203, bedType: "Kitchenette", floor: 2 },
  { number: 204, bedType: "King w/ Fireplace", floor: 2 },
  { number: 205, bedType: "Queen Room w/ Fireplace", floor: 2 },
  { number: 206, bedType: "Kitchenette", floor: 2 },
  { number: 207, bedType: "King w/ Fireplace", floor: 2 },
  { number: 208, bedType: "Queen Room w/ Fireplace", floor: 2 },
  { number: 209, bedType: "Kitchenette", floor: 2 },
  { number: 210, bedType: "King w/ Fireplace", floor: 2 },
  { number: 211, bedType: "Two Queen Beds", floor: 2 },
  { number: 212, bedType: "King Bed", floor: 2 },
  { number: 213, bedType: "King w/ Fireplace", floor: 2 },
  { number: 214, bedType: "Two Queen Beds w/ Fireplace", floor: 2 },
  { number: 215, bedType: "Two Queen Beds w/ Fireplace", floor: 2 },
  { number: 216, bedType: "Two Queen Beds w/ Fireplace", floor: 2 },
  { number: 217, bedType: "Two Queen Beds", floor: 2 },
  { number: 218, bedType: "Two Queen Beds", floor: 2 },
  { number: 219, bedType: "Two Queen Beds", floor: 2 },
  { number: 220, bedType: "King Bed", floor: 2 },
  { number: 221, bedType: "Queen Room w/ Fireplace", floor: 2 },
  { number: 222, bedType: "King w/ Fireplace", floor: 2 },
  { number: 223, bedType: "Two Queen Beds", floor: 2 },
  { number: 224, bedType: "King w/ Fireplace", floor: 2 },
  { number: 225, bedType: "King w/ Fireplace", floor: 2 },
  { number: 226, bedType: "Two Queen Beds w/ Fireplace", floor: 2 },
  { number: 227, bedType: "King w/ Fireplace", floor: 2 },
  { number: 228, bedType: "King w/ Fireplace", floor: 2 },
  { number: 229, bedType: "King w/ Fireplace", floor: 2 },
  { number: 230, bedType: "Queen Room w/ Fireplace", floor: 2 },
  { number: 231, bedType: "King w/ Fireplace", floor: 2 },
  { number: 232, bedType: "King Bed", floor: 2 },
];
