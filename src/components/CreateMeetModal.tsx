import { useState } from "react";
import { format, isBefore } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "./ui/button";
import { cn } from "@/lib/utils";
import { toast } from "react-toastify";
import { TimePicker } from "./ui/time-picker";

export function CreateMeetingModal({
  onClose,
  userId,
}: {
  onClose: () => void;
  userId: string;
}) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [calendarOpen, setCalendarOpen] = useState(false);

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      const updatedDate = new Date(date);
      updatedDate.setHours(12, 0, 0, 0);
      setSelectedDate(updatedDate);
    } else {
      setSelectedDate(undefined);
    }
  };

  const handleSubmit = async () => {
    if (!title || !selectedDate) {
      const missingField = !title
        ? "Title"
        : !selectedDate
        ? "Date"
        : "Time";
      toast.error(`${missingField} is required`);
      return;
    }

    const now = new Date();
    if (isBefore(selectedDate, now)) {
      toast.error("Cannot select a time in the past.");
      return;
    }

    const response = await fetch("/api/meetings/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title,
        description,
        date: selectedDate,
        userId
      }),
    });

    const data = await response.json();
    if (response.ok) {
      toast.success("Meeting created!");
      onClose();
    } else {
      toast.error("Failed to create meeting." + data.error);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 overflow-visible">
      <div className="bg-white p-6 rounded-lg shadow-lg w-96">
        <h2 className="text-lg font-semibold">Create Meeting</h2>
        <input
          type="text"
          placeholder="Meeting Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="border-2 border-gray-300 rounded-md p-2 my-2 w-full"
        />
        <textarea
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="border-2 border-gray-300 rounded-md p-2 my-2 w-full max-h-28"
        />
        <div className="relative w-full flex flex-col items-center h-10 overflow-visible">
          <Button
            className="text-wrap"
            onClick={() => setCalendarOpen(!calendarOpen)}
          >
            {selectedDate === undefined
              ? "Click to select date"
              : `${format(selectedDate, "PPP HH:mm")}`}
          </Button>
          <Calendar
            selected={selectedDate}
            onSelect={handleDateSelect}
            disabled={{ before: new Date() }}
            mode="single"
            className={cn(
              "mt-2 absolute bottom-[360px] rounded-xl shadow-xl bg-white z-10 transition-all duration-300",
              {
                "opacity-0 scale-95 pointer-events-none": !calendarOpen,
                "opacity-100 scale-100": calendarOpen,
              }
            )}
          />
        </div>
        <div className="flex justify-center w-full my-4">
          <TimePicker date={selectedDate} setDate={setSelectedDate} />
        </div>
        <div className="flex w-full justify-between mt-4">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="default" onClick={handleSubmit}>
            Create
          </Button>
        </div>
      </div>
    </div>
  );
}
