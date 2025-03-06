import React from "react";
import { format } from "date-fns";

interface DateTimeInputProps {
  dateTime: Date | null;
  setDateTime: (date: Date) => void;
}

const DateTimeInput: React.FC<DateTimeInputProps> = ({ dateTime, setDateTime }) => {
  return (
    <div>
      <h3>Starting</h3>
      <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
        <input
          type="date"
          value={dateTime ? format(dateTime, "yyyy-MM-dd") : ""}
          onChange={(e) => {
            const updatedDate = new Date(e.target.value);
            if (dateTime) {
              updatedDate.setHours(dateTime.getHours(), dateTime.getMinutes());
            }
            setDateTime(updatedDate);
          }}
        />
        <input
          type="time"
          value={dateTime ? format(dateTime, "HH:mm") : ""}
          onChange={(e) => {
            if (dateTime) {
              const [hours, minutes] = e.target.value.split(":");
              const updatedTime = new Date(dateTime);
              updatedTime.setHours(parseInt(hours, 10), parseInt(minutes, 10));
              setDateTime(updatedTime);
            }
          }}
        />
      </div>
    </div>
  );
};

export default DateTimeInput;