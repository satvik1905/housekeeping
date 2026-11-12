CREATE TYPE "public"."room_status" AS ENUM('checkout', 'stayover', 'stayoverRoomService');--> statement-breakpoint
CREATE TYPE "public"."staff_role" AS ENUM('housekeeper', 'laundry', 'maintenance');--> statement-breakpoint
CREATE TABLE "day_staff" (
	"date" date NOT NULL,
	"staff_id" integer NOT NULL,
	"pick_order" integer NOT NULL,
	CONSTRAINT "day_staff_date_staff_id_pk" PRIMARY KEY("date","staff_id")
);
--> statement-breakpoint
CREATE TABLE "room_marks" (
	"date" date NOT NULL,
	"room_number" integer NOT NULL,
	"status" "room_status" NOT NULL,
	CONSTRAINT "room_marks_date_room_number_pk" PRIMARY KEY("date","room_number")
);
--> statement-breakpoint
CREATE TABLE "staff" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"role" "staff_role" NOT NULL,
	"active" boolean DEFAULT true NOT NULL
);
--> statement-breakpoint
ALTER TABLE "day_staff" ADD CONSTRAINT "day_staff_staff_id_staff_id_fk" FOREIGN KEY ("staff_id") REFERENCES "public"."staff"("id") ON DELETE no action ON UPDATE no action;