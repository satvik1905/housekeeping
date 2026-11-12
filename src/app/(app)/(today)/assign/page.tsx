"use client";

import type { ReactNode } from "react";
import { useState } from "react";
import type { CollisionDetection, DragEndEvent, DragStartEvent } from "@dnd-kit/core";
import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  pointerWithin,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { Group, Text } from "@mantine/core";
import { AssigneeName } from "@/components/AssigneeName";
import { HousekeeperCard } from "@/components/HousekeeperCard";
import { Section } from "@/components/layout/Section";
import { StickyBar } from "@/components/layout/StickyBar";
import { RoomGrid } from "@/components/RoomGrid";
import { RoomTile } from "@/components/RoomTile";
import type { Room } from "@/data/rooms";
import { FLOORS, ROOMS } from "@/data/rooms";
import type { RoomStatus } from "@/data/status";
import type { TodayStaff } from "@/server/todayData";
import { useTodayFlow } from "../TodayFlow";
import classes from "./page.module.css";

// What's being dragged: a housekeeper's card, or a name off a tile
type DragItem = { staffId: number; fromRoom?: number };

type CardStats = { checkouts: number; stayovers: number };

// A tile counts only where it's actually visible under the pointer, not
// where the sticky bar or the footer covers it
const visibleTileUnderPointer: CollisionDetection = (args) => {
  const point = args.pointerCoordinates;
  if (!point) return [];
  // The dragged copy ignores the pointer (see page.module.css)
  const top = document.elementFromPoint(point.x, point.y);
  return pointerWithin(args).filter(({ id }) => {
    const node = args.droppableContainers.find((container) => container.id === id)?.node.current;
    return node && top && node.contains(top);
  });
};

// Step 2: drag housekeepers onto the marked rooms
export default function AssignStep() {
  const { day, assign } = useTodayFlow();
  const [dragging, setDragging] = useState<DragItem | null>(null);
  const sensors = useSensors(
    // A few pixels of movement before a drag starts
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor),
  );

  const housekeepers = day.picks.filter((pick) => pick.role === "housekeeper");
  const names = new Map(day.picks.map((pick) => [pick.id, pick.name]));
  const markedRooms = ROOMS.filter((room) => day.marks[room.number]);

  const stats = (staffId: number): CardStats => {
    const statuses = markedRooms
      .filter((room) => day.assignments[room.number] === staffId)
      .map((room) => day.marks[room.number]);
    const checkouts = statuses.filter((status) => status === "checkout").length;
    return { checkouts, stayovers: statuses.length - checkouts };
  };

  const onDragStart = ({ active }: DragStartEvent) => {
    setDragging(active.data.current as DragItem);
  };

  // Onto a tile: assign (or reassign, or move a name there). A name
  // dropped anywhere else: unassign its room.
  const onDragEnd = ({ active, over }: DragEndEvent) => {
    setDragging(null);
    const { staffId, fromRoom } = active.data.current as DragItem;
    const target = over ? Number(over.id) : null;
    if (target === fromRoom) return;
    if (target !== null) assign(target, staffId);
    if (fromRoom !== undefined) assign(fromRoom, null);
  };

  return (
    <DndContext
      id="assign"
      sensors={sensors}
      collisionDetection={visibleTileUnderPointer}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onDragCancel={() => setDragging(null)}
    >
      <StickyBar>
        {housekeepers.length === 0 ? (
          <Text c="textSecondary">No housekeepers picked. Go back to pick who&apos;s working.</Text>
        ) : (
          <Group gap="md">
            {housekeepers.map((member) => (
              <DraggableCard key={member.id} member={member} {...stats(member.id)} />
            ))}
          </Group>
        )}
      </StickyBar>

      {FLOORS.map(({ floor, title }) => (
        <Section key={floor} title={title}>
          <RoomGrid>
            {markedRooms
              .filter((room) => room.floor === floor)
              .map((room) => {
                const staffId = day.assignments[room.number];
                return (
                  <DropTile key={room.number} room={room} status={day.marks[room.number]!}>
                    {staffId === undefined ? (
                      <Text size="sm" c="textSecondary">
                        Drop here
                      </Text>
                    ) : (
                      <DraggableName
                        room={room.number}
                        staffId={staffId}
                        name={names.get(staffId) ?? ""}
                      />
                    )}
                  </DropTile>
                );
              })}
          </RoomGrid>
        </Section>
      ))}

      {/* The dragged copy, above everything (sticky bar included) */}
      <DragOverlay className={classes.overlay} dropAnimation={null}>
        {dragging &&
          (dragging.fromRoom === undefined ? (
            <HousekeeperCard
              name={names.get(dragging.staffId) ?? ""}
              {...stats(dragging.staffId)}
            />
          ) : (
            <AssigneeName name={names.get(dragging.staffId) ?? ""} />
          ))}
      </DragOverlay>
    </DndContext>
  );
}

function DraggableCard({ member, ...counts }: { member: TodayStaff } & CardStats) {
  const { setNodeRef, listeners, attributes, isDragging } = useDraggable({
    id: `card:${member.id}`,
    data: { staffId: member.id } satisfies DragItem,
  });
  return (
    <HousekeeperCard
      ref={setNodeRef}
      name={member.name}
      dragging={isDragging}
      {...counts}
      {...listeners}
      {...attributes}
    />
  );
}

function DraggableName({ room, staffId, name }: { room: number; staffId: number; name: string }) {
  const { setNodeRef, listeners, attributes, isDragging } = useDraggable({
    id: `name:${room}`,
    data: { staffId, fromRoom: room } satisfies DragItem,
  });
  return (
    <AssigneeName
      ref={setNodeRef}
      name={name}
      dragging={isDragging}
      {...listeners}
      {...attributes}
    />
  );
}

function DropTile({
  room,
  status,
  children,
}: {
  room: Room;
  status: RoomStatus;
  children: ReactNode;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: room.number });
  return (
    <RoomTile ref={setNodeRef} room={room} status={status} dropTarget={isOver}>
      {children}
    </RoomTile>
  );
}
