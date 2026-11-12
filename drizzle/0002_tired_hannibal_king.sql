CREATE TABLE "room_assignments" (
	"date" date NOT NULL,
	"room_number" integer NOT NULL,
	"staff_id" integer NOT NULL,
	CONSTRAINT "room_assignments_date_room_number_pk" PRIMARY KEY("date","room_number")
);
--> statement-breakpoint
CREATE TABLE "sheet_prints" (
	"date" date NOT NULL,
	"staff_id" integer NOT NULL,
	"printed_at" timestamp with time zone NOT NULL,
	CONSTRAINT "sheet_prints_date_staff_id_pk" PRIMARY KEY("date","staff_id")
);
--> statement-breakpoint
ALTER TABLE "room_assignments" ADD CONSTRAINT "room_assignments_date_room_number_room_marks_date_room_number_fk" FOREIGN KEY ("date","room_number") REFERENCES "public"."room_marks"("date","room_number") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "room_assignments" ADD CONSTRAINT "room_assignments_date_staff_id_day_staff_date_staff_id_fk" FOREIGN KEY ("date","staff_id") REFERENCES "public"."day_staff"("date","staff_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sheet_prints" ADD CONSTRAINT "sheet_prints_staff_id_staff_id_fk" FOREIGN KEY ("staff_id") REFERENCES "public"."staff"("id") ON DELETE no action ON UPDATE no action;