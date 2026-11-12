CREATE TABLE "auth_lockout" (
	"id" integer PRIMARY KEY DEFAULT 1 NOT NULL,
	"failed_attempts" integer DEFAULT 0 NOT NULL,
	"locked_until" timestamp with time zone,
	CONSTRAINT "auth_lockout_single_row" CHECK ("auth_lockout"."id" = 1)
);
--> statement-breakpoint
INSERT INTO "auth_lockout" ("id") VALUES (1);
