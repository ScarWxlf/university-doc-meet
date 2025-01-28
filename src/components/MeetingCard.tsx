import { Meeting } from "@prisma/client";
import { format } from "date-fns";
import { Button, buttonVariants } from "./ui/button";
import { IoPersonAddSharp } from "react-icons/io5";
import { FaRegTrashAlt } from "react-icons/fa";
import { useState } from "react";
import AddParticipiantModel from "./AddParticipiantModel";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { toast } from "react-toastify";

export default function MeetingCard({ meeting, userId, onDelete }: { meeting: Meeting, userId: string, onDelete: (meetingId: number) => void }) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleDelete = async () => {
    try {
      const response = await fetch(`/api/meetings/meeting`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ meetingId: meeting.id }),
      });
      const data = await response.json();
      if(response.ok){
        toast.success(data.message);
        onDelete(meeting.id);
      } else {
        toast.error(data.error);
      }
    } catch (error) {
      toast.error("Error deleting meeting:" + (error as Error).message);
    }
  }
  return (
    <>
      <div className="h-[1px] bg-gray-400" />
      <div className="w-full flex items-center p-4">
        <p className="w-1/5 text-center">{meeting.title}</p>
        <p className="w-1/5 text-center">
          {meeting.description ? meeting.description : "none"}
        </p>
        <p className="w-1/5 text-center">{format(meeting.date, "PPP HH:mm")}</p>
        <p className="w-1/5 text-center">
          <Link className={cn(buttonVariants({ variant: "link", size: "link" }))} href={`/rooms/${meeting.roomName}`}>{meeting.roomName}</Link>
        </p>
        <div className="w-1/5 text-center flex justify-center gap-2">
          <Button
            variant="fileAction"
            size="none"
            className="h-6"
            onClick={() => setIsModalOpen(true)}
            disabled={meeting.createdById !== parseInt(userId)}
          >
            <IoPersonAddSharp size={24} />
          </Button>
          <Button
            variant="fileAction"
            size="none"
            className="h-6"
            onClick={handleDelete}
            disabled={meeting.createdById !== parseInt(userId)}
            >
            <FaRegTrashAlt size={24} /> 
            </Button>
        </div>
      </div>
      {isModalOpen && (
        <AddParticipiantModel
          meetingId={meeting.id}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </>
  );
}
