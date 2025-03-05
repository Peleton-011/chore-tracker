import React, { useState } from "react";
import RecurrenceSelector from "./RecurrenceSelector";
import DateTimePicker from "./DateTimePicker";

interface RecurrenceDefinition {
  intervalValue: number;
  intervalUnit: string;
  doesRecurrenceEnd: boolean;
  recurrenceEndDate: Date | null;
}

const defaultRecurrenceDefinition: RecurrenceDefinition = {
  intervalUnit: "days",
  intervalValue: 1,
  doesRecurrenceEnd: false,
  recurrenceEndDate: null,
};

const DateTimeSelector: React.FC<{ handleSubmit: (data: any) => void }> = ({
  handleSubmit,
}) => {
  const [dateTime, setDateTime] = useState<Date | null>(null);
  const [recurrenceDefinition, setRecurrenceDefinition] =
    useState<RecurrenceDefinition>(defaultRecurrenceDefinition);

  return (
    <div>
      <h1>Date & Time</h1>
      <DateTimePicker dateTime={dateTime} setDateTime={setDateTime} />
      <RecurrenceSelector
        recurrenceDefinition={recurrenceDefinition}
        setRecurrenceDefinition={setRecurrenceDefinition}
      />
      <button
        onClick={() =>
          handleSubmit({
            dateTime,
            recurrenceDefinition,
          })
        }
      >
        Apply changes
      </button>
    </div>
  );
};

export default DateTimeSelector;
