"use client";

import { useEffect, useMemo, useState } from "react";
import { CalendarIcon, Clock3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

function formatDateLabel(value: string) {
  if (!value) return "Pick a date";

  const parsed = new Date(`${value}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) return "Pick a date";

  return parsed.toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function toIsoDate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

type PublicDateFieldProps = {
  name: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
};

export function PublicDateField({
  name,
  value,
  onChange,
  placeholder,
}: PublicDateFieldProps) {
  const [open, setOpen] = useState(false);
  const selectedDate = value ? new Date(`${value}T00:00:00`) : undefined;

  return (
    <div className="mt-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            className="h-11 w-full justify-between rounded-2xl border-border bg-background px-4 font-normal"
          >
            <span className="truncate text-sm text-foreground/90">
              {value ? formatDateLabel(value) : placeholder || "Pick a date"}
            </span>
            <CalendarIcon className="h-4 w-4 text-muted-foreground" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            captionLayout="dropdown"
            selected={selectedDate}
            onSelect={(date) => {
              if (!date) {
                onChange("");
                return;
              }
              onChange(toIsoDate(date));
              setOpen(false);
            }}
            initialFocus
          />
        </PopoverContent>
      </Popover>

      <input type="hidden" name={name} value={value} />
    </div>
  );
}

const HOUR_OPTIONS = [
  "01",
  "02",
  "03",
  "04",
  "05",
  "06",
  "07",
  "08",
  "09",
  "10",
  "11",
  "12",
];

const MINUTE_OPTIONS = [
  "00",
  "05",
  "10",
  "15",
  "20",
  "25",
  "30",
  "35",
  "40",
  "45",
  "50",
  "55",
];

function parseTimeValue(value: string) {
  type ParsedTime = { hour: string; minute: string; period: "AM" | "PM" };

  if (!value || !/^\d{2}:\d{2}$/.test(value)) {
    return { hour: "", minute: "", period: "AM" } as ParsedTime;
  }

  const [hourRaw, minuteRaw] = value.split(":");
  const hour24 = Number(hourRaw);

  if (Number.isNaN(hour24)) {
    return { hour: "", minute: "", period: "AM" } as ParsedTime;
  }

  const period = hour24 >= 12 ? "PM" : "AM";
  const hour12 = hour24 % 12 === 0 ? 12 : hour24 % 12;

  return {
    hour: String(hour12).padStart(2, "0"),
    minute: minuteRaw,
    period,
  } as ParsedTime;
}

function to24HourTime(hour: string, minute: string, period: "AM" | "PM") {
  if (!hour || !minute) return "";

  let hourNumber = Number(hour);
  if (Number.isNaN(hourNumber)) return "";

  if (period === "PM" && hourNumber < 12) {
    hourNumber += 12;
  }

  if (period === "AM" && hourNumber === 12) {
    hourNumber = 0;
  }

  return `${String(hourNumber).padStart(2, "0")}:${minute}`;
}

type PublicTimeFieldProps = {
  name: string;
  value: string;
  onChange: (value: string) => void;
};

export function PublicTimeField({ name, value, onChange }: PublicTimeFieldProps) {
  type TimeParts = { hour: string; minute: string; period: "AM" | "PM" };
  const parsed = useMemo(() => parseTimeValue(value), [value]);
  const [timeParts, setTimeParts] = useState<TimeParts>(parsed);

  useEffect(() => {
    setTimeParts(parsed);
  }, [parsed.hour, parsed.minute, parsed.period]);

  function update(next: Partial<TimeParts>) {
    const merged: TimeParts = {
      hour: timeParts.hour,
      minute: timeParts.minute,
      period: timeParts.period,
      ...next,
    };

    setTimeParts(merged);
    onChange(to24HourTime(merged.hour, merged.minute, merged.period));
  }

  return (
    <div className="mt-2 space-y-2">
      <div className="grid grid-cols-3 gap-2">
        <Select
          value={timeParts.hour}
          onValueChange={(nextHour) => update({ hour: nextHour })}
        >
          <SelectTrigger className="h-11 rounded-2xl border-border bg-background">
            <SelectValue placeholder="HH" />
          </SelectTrigger>
          <SelectContent>
            {HOUR_OPTIONS.map((hour) => (
              <SelectItem key={hour} value={hour}>
                {hour}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={timeParts.minute}
          onValueChange={(nextMinute) => update({ minute: nextMinute })}
        >
          <SelectTrigger className="h-11 rounded-2xl border-border bg-background">
            <SelectValue placeholder="MM" />
          </SelectTrigger>
          <SelectContent>
            {MINUTE_OPTIONS.map((minute) => (
              <SelectItem key={minute} value={minute}>
                {minute}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={timeParts.period}
          onValueChange={(nextPeriod) => update({ period: nextPeriod as "AM" | "PM" })}
        >
          <SelectTrigger className="h-11 rounded-2xl border-border bg-background">
            <SelectValue placeholder="AM/PM" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="AM">AM</SelectItem>
            <SelectItem value="PM">PM</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Clock3 className="h-3.5 w-3.5" />
        Time is saved in 24-hour format.
      </div>

      <input type="hidden" name={name} value={value} />
    </div>
  );
}
