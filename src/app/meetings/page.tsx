'use client'
import { Button } from "@/components/button";
import { CreateMeetingModal } from "@/components/CreateMeetModal";
import { useSession } from "next-auth/react";
import { useState } from "react";

export default function MeetingsPage() {
    const {data: session, status} = useSession();
    const [isModalOpen, setIsModalOpen] = useState(false);
  return (
    <div className="flex flex-col px-8 bg-gray-100">
      <div className="flex w-full p-6 justify-between">
        <div className="flex gap-2">
          <h1 className="text-3xl text-gray-700 font-medium">
            Meetings
          </h1>
        </div>
        <div className="flex justify-between">
          <Button
            className="rounded-full flex gap-2"
            variant="default"
            size="default"
            onClick={() => setIsModalOpen(true)}
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
      <div className="bg-white px-3 rounded-xl shadow-xl">
        <div className="w-full flex items-center p-4">
          <p className="w-1/5 text-center">Title</p>
          <p className="w-1/5 text-center">Description</p>
          <p className="w-1/5 text-center">Date</p>
          <p className="w-1/5 text-center">Room Name</p>
          <p className="w-1/5 text-center">Participants </p>
        </div>
        { [0, 1, 2].map((file, index) => (
            <div key={index} className="w-full flex items-center p-4">
                <p className="w-1/5 text-center">Some title</p>
                <p className="w-1/5 text-center">Some Description</p>
                <p className="w-1/5 text-center">Some Date</p>
                <p className="w-1/5 text-center">Some Room Name</p>
                <p className="w-1/5 text-center">Some Participants </p>
            </div>
        ))}
      </div>
    </div>
  );
}
