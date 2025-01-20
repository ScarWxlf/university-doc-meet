"use client"

import * as React from "react"
import { format, isSameDay } from "date-fns"
import { FaCalendarAlt } from "react-icons/fa";

import { cn } from "@/lib/utils"
import { Button } from "@/components/button"
import { Calendar } from "@/components/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/popover"

export function DatePickerDemo({
  availableDates,
  onDateSelect,
}: {
  availableDates: Date[];
  onDateSelect: (date: Date | undefined) => void;
}) {
  const [selectedDate, setSelectedDate] = React.useState<Date | undefined>();

  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date);
    onDateSelect(date);
  };

  const isDateAvailable = (date: Date) =>
    availableDates.some((availableDate) => isSameDay(availableDate, date));

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          className={cn(
            "w-[240px] justify-start text-left font-normal",
            !selectedDate && "text-muted-foreground"
          )}
        >
          <FaCalendarAlt className="mr-2" />
          {selectedDate  ? format(selectedDate, "PPP") : <span>Pick a date</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          className="p-3"
          mode="single"
          selected={selectedDate}
          onSelect={handleDateSelect}
          disabled={(date) => !isDateAvailable(date)}
          autoFocus
        />
      </PopoverContent>
    </Popover>
  )
}
