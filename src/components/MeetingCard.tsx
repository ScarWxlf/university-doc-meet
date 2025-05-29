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
import ModalWrapper from "./ModalWrapper";

export default function MeetingCard({
  index,
  meeting,
  userId,
  onDelete,
}: {
  index: number;
  meeting: Meeting;
  userId: string;
  onDelete: (meetingId: number) => void;
}) {
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
      if (response.ok) {
        toast.success(data.message);
        onDelete(meeting.id);
      } else {
        toast.error(data.error);
      }
    } catch (error) {
      toast.error("Error deleting meeting:" + (error as Error).message);
    }
  };

  const isOwner = meeting.createdById === parseInt(userId);

  return (
    <>
      {index !== 0 && <div className="h-[1px] bg-gray-400" />}

      {/* Desktop view */}
      <div className="hidden lg:flex w-full items-center p-4">
        <p className="w-1/5 text-center font-medium">{meeting.title}</p>
        <p className="w-1/5 text-center text-gray-600">
          {meeting.description ? meeting.description : "none"}
        </p>
        <p className="w-1/5 text-center text-sm">
          {format(meeting.date, "PPP HH:mm")}
        </p>
        <p className="w-1/5 text-center">
          <Link
            className={cn(buttonVariants({ variant: "link", size: "link" }))}
            href={`/rooms/${meeting.roomName}`}
          >
            {meeting.roomName}
          </Link>
        </p>
        <div className="w-1/5 text-center flex justify-center gap-2">
          <Button
            variant="fileAction"
            size="none"
            className="h-6"
            onClick={() => setIsModalOpen(true)}
            disabled={!isOwner}
          >
            <IoPersonAddSharp size={24} />
          </Button>
          <Button
            variant="fileAction"
            size="none"
            className="h-6"
            onClick={handleDelete}
            disabled={!isOwner}
          >
            <FaRegTrashAlt size={24} />
          </Button>
        </div>
      </div>

      {/* Tablet view */}
      <div className="hidden md:flex lg:hidden w-full items-center p-4 gap-4">
        <div className="flex-1 min-w-0">
          <h3 className="font-medium truncate">{meeting.title}</h3>
          <p className="text-sm text-gray-600 truncate">
            {meeting.description || "No description"}
          </p>
        </div>
        <div className="flex-1 text-center">
          <p className="text-sm">{format(meeting.date, "PPP")}</p>
          <p className="text-xs text-gray-500">
            {format(meeting.date, "HH:mm")}
          </p>
        </div>
        <div className="flex-1 text-center">
          <Link
            className={cn(buttonVariants({ variant: "link", size: "sm" }))}
            href={`/rooms/${meeting.roomName}`}
          >
            {meeting.roomName}
          </Link>
        </div>
        <div className="flex gap-2">
          <Button
            variant="fileAction"
            size="sm"
            onClick={() => setIsModalOpen(true)}
            disabled={!isOwner}
          >
            <IoPersonAddSharp size={24} />
          </Button>
          <Button
            variant="fileAction"
            size="sm"
            onClick={handleDelete}
            disabled={!isOwner}
          >
            <FaRegTrashAlt size={24} />
          </Button>
        </div>
      </div>

      {/* Mobile view */}
      <div className="flex md:hidden w-full flex-col p-4 space-y-3">
        <div className="flex justify-between items-start">
          <div className="flex-1 min-w-0 pr-4">
            <h3 className="font-medium text-lg">{meeting.title}</h3>
            {meeting.description && (
              <p className="text-sm text-gray-600 mt-1">
                {meeting.description}
              </p>
            )}
          </div>
          <div className="flex gap-2 flex-shrink-0">
            <Button
              variant="fileAction"
              size="sm"
              onClick={() => setIsModalOpen(true)}
              disabled={!isOwner}
              className="p-2"
            >
              <IoPersonAddSharp size={24} />
            </Button>
            <Button
              variant="fileAction"
              size="sm"
              onClick={handleDelete}
              disabled={!isOwner}
              className="p-2"
            >
              <FaRegTrashAlt size={24} />
            </Button>
          </div>
        </div>

        <div className="flex justify-between items-center text-sm">
          <div>
            <p className="font-medium">{format(meeting.date, "PPP")}</p>
            <p className="text-gray-500">{format(meeting.date, "HH:mm")}</p>
          </div>
          <Link
            className={cn(
              buttonVariants({ variant: "outline", size: "sm" }),
              "border-green-500 text-white bg-green-500 hover:bg-green-600"
            )}
            href={`/rooms/${meeting.roomName}`}
          >
            Join {meeting.roomName}
          </Link>
        </div>

        {!isOwner && (
          <p className="text-xs text-gray-500 italic">
            You can only edit meetings you created
          </p>
        )}
      </div>

      <ModalWrapper isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <AddParticipiantModel
          meetingId={meeting.id}
          onClose={() => setIsModalOpen(false)}
        />
      </ModalWrapper>
    </>
  );
}
