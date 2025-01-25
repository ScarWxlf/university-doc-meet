import { useState } from "react";
import { format } from "date-fns";
import { Calendar } from "@/components/calendar";
import { Button } from "./button";
import { cn } from "@/lib/utils";
import { toast } from "react-toastify";

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
  const [selectedTime, setSelectedTime] = useState<string>("12:00"); // Default time
  const [calendarOpen, setCalendarOpen] = useState(false);

  const handleSubmit = async () => {
    if (!title || !selectedDate || !selectedTime) {
      const missingField = !title
        ? "Title"
        : !selectedDate
        ? "Date"
        : "Time";
      toast.error(`${missingField} is required`);
      return;
    }

    // Combine the selected date and time into a single Date object
    const [hours, minutes] = selectedTime.split(":").map(Number);
    const meetingDate = new Date(selectedDate);
    meetingDate.setHours(hours, minutes, 0, 0);

    const response = await fetch("/api/meetings/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title,
        description,
        date: meetingDate,
        userId,
        participants: [], // Add participants dynamically if needed
      }),
    });

    if (response.ok) {
      toast.success("Meeting created!");
      onClose();
    } else {
      toast.error("Failed to create meeting.");
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
          {/* Date Picker */}
          <Button
            className="text-wrap"
            onClick={() => setCalendarOpen(!calendarOpen)}
          >
            {selectedDate === undefined
              ? "Click to select date"
              : `${format(selectedDate, "PPP")}`}
          </Button>
          <Calendar
            selected={selectedDate}
            onSelect={setSelectedDate}
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
        <div className="my-4">
          {/* Time Picker */}
          <label className="block text-sm font-medium">
            Select Time
          </label>
          <input
            type="time"
            id="time-picker"
            value={selectedTime}
            onChange={(e) => setSelectedTime(e.target.value)}
            className="border-2 border-gray-300 rounded-md p-2 my-2 w-full"
          />
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
