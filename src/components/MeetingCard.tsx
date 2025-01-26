import { Meeting } from "@prisma/client";
import { format } from "date-fns";
import { Button } from "./ui/button";
import { IoIosPersonAdd } from "react-icons/io";

export default function MeetingCard({ meeting }: { meeting: Meeting }) {
  return (
    <>
      <div className="h-[1px] bg-gray-400" />
      <div className="w-full flex items-center p-4">
        <p className="w-1/5 text-center">{meeting.title}</p>
        <p className="w-1/5 text-center">
          {meeting.description ? meeting.description : "none"}
        </p>
        <p className="w-1/5 text-center">{format(meeting.date, "PPP HH:mm")}</p>
        <p className="w-1/5 text-center">{meeting.roomName}</p>
        <div className='w-1/5 text-center flex justify-center gap-2'>
                <Button variant='fileAction' size='none' className="h-8">
                    <IoIosPersonAdd size={32} />
                </Button>
            </div>
      </div>
    </>
  );
}
