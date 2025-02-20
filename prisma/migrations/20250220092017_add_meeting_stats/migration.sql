-- CreateTable
CREATE TABLE "MeetingStats" (
    "id" SERIAL NOT NULL,
    "events" JSONB NOT NULL,

    CONSTRAINT "MeetingStats_pkey" PRIMARY KEY ("id")
);
