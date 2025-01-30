"use client";
import { Button } from "@/components/ui/button";
import { CreateMeetingModal } from "@/components/CreateMeetModal";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Loading from "@/components/ui/loading";
import { Meeting } from "@prisma/client";
import MeetingCard from "@/components/MeetingCard";

export default function MeetingsPage() {
  const { data: session, status } = useSession();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(true);

  const router = useRouter();

  async function getMeetings() {
    setLoading(true);
    if (status !== "loading") {
      const response = await fetch("/api/meetings/getall", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: session?.user?.id,
          email: session?.user?.email,
        }),
      });
      const data = await response.json();
      setMeetings(data.meetings);
      setLoading(false);
    }
  }
  useEffect(() => {
    getMeetings();
  }, [session, status, isModalOpen]);

  const handleCreateMeeting = async () => {
    if(!session?.user?.id){
      router.push('/signin')
      return;
    }
    setIsModalOpen(true)
  }

  const handleDeleteMeeting = (meetingId: number) => {
    setMeetings((prevMeetings) => prevMeetings.filter((meeting) => meeting.id !== meetingId));
  };
  return (
    <div className="flex flex-col px-8 bg-gray-100 h-full">
      <div className="flex w-full p-6 justify-between">
        <div className="flex gap-2">
          <h1 className="text-3xl text-gray-700 font-medium">Meetings</h1>
        </div>
        <div className="flex justify-between">
          <Button
            className="rounded-full flex gap-2"
            variant="default"
            size="default"
            onClick={handleCreateMeeting}
          >
            Create New Meeting
          </Button>
          {isModalOpen && (
            <CreateMeetingModal
              userId={session?.user?.id}
              onClose={() => setIsModalOpen(false)}
            />
          )}
          {/* <DatePickerDemo availableDates={availableDates} onDateSelect={setSelectedDate} /> */}
        </div>
      </div>
      {loading ? (
        <Loading />
      ) : (
        <div className="bg-white px-3 rounded-xl shadow-xl">
          <div className="w-full flex items-center p-4">
            <p className="w-1/5 text-center">Title</p>
            <p className="w-1/5 text-center">Description</p>
            <p className="w-1/5 text-center">Date</p>
            <p className="w-1/5 text-center">Room Name</p>
            <p className="w-1/5 text-center">Participants </p>
          </div>
          {(meetings && meetings.length > 0) ? (
            meetings.map((meeting, index) => (
              <MeetingCard
                key={index}
                meeting={meeting}
                userId={session?.user?.id}
                onDelete={handleDeleteMeeting}
              />
            ))
          ) : (
            <p className="text-center text-lg p-4">No meetings found 😥</p>
          )}
        </div>
      )}
    </div>
  );
}
