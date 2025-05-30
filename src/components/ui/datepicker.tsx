"use client"

import * as React from "react"
import { format } from "date-fns"
import { FaCalendarAlt } from "react-icons/fa";

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

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
    
    if (date) {
      // Створюємо нормалізовану дату без часу
      const normalizedDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
      console.log('DatePicker - Selected date:', normalizedDate);
      onDateSelect(normalizedDate);
    } else {
      onDateSelect(undefined);
    }
  };

  const isDateAvailable = (date: Date) => {
    return availableDates.some((availableDate) => {
      // Порівнюємо тільки дати, ігноруючи час
      return (
        date.getFullYear() === availableDate.getFullYear() &&
        date.getMonth() === availableDate.getMonth() &&
        date.getDate() === availableDate.getDate()
      );
    });
  };

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
          {selectedDate ? format(selectedDate, "PPP") : <span>Pick a date</span>}
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