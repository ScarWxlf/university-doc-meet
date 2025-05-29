"use client";
import { Button } from "@/components/ui/button";
import { CreateMeetingModal } from "@/components/CreateMeetModal";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Loading from "@/components/ui/loading";
import { Meeting } from "@prisma/client";
import MeetingCard from "@/components/MeetingCard";
import ModalWrapper from "@/components/ModalWrapper";

export default function MeetingsPage() {
  const { data: session, status } = useSession();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(true);

  const router = useRouter();

  useEffect(() => {
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
    <div className="flex flex-col flex-grow px-4 sm:px-6 lg:px-8 bg-gray-100 h-full">
  <div className="flex flex-col space-y-4 sm:space-y-0 sm:flex-row w-full p-4 sm:p-6 justify-between items-start sm:items-center">
    {/* Title Section */}
    <div className="flex gap-2 items-center">
      <h1 className="text-2xl sm:text-3xl text-gray-700 font-medium">Meetings</h1>
    </div>
    
    {/* Action Section */}
    <div className="flex justify-end w-full sm:w-auto">
      <Button
        className="rounded-full flex gap-2 w-full sm:w-auto justify-center px-4 py-2 text-sm sm:text-base"
        variant="default"
        size="default"
        onClick={handleCreateMeeting}
      >
        <span className="hidden xs:inline">Create New Meeting</span>
        <span className="xs:hidden">Create Meeting</span>
      </Button>
      
      <ModalWrapper isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <CreateMeetingModal userId={session?.user.id} onClose={() => setIsModalOpen(false)} />
      </ModalWrapper>
      
      {/* <DatePickerDemo availableDates={availableDates} onDateSelect={setSelectedDate} /> */}
    </div>
  </div>
      {loading ? (
        <Loading />
      ) : (
        <div className="bg-white px-3 rounded-xl shadow-xl">
          <div className="w-full hidden lg:flex items-center p-4">
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
                index={index}
                meeting={meeting}
                userId={session!.user.id}
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
