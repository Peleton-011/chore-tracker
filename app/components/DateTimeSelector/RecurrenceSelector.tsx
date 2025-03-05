import React from "react";
import { format } from "date-fns";
import AutonomousModal from "../Modals/AutonomousModal";

interface RecurrenceDefinition {
  intervalValue: number;
  intervalUnit: string;
  doesRecurrenceEnd: boolean;
  recurrenceEndDate: Date | null;
}

interface RecurrenceSelectorProps {
  recurrenceDefinition: RecurrenceDefinition;
  setRecurrenceDefinition: (definition: RecurrenceDefinition) => void;
}

const RecurrenceSelector: React.FC<RecurrenceSelectorProps> = ({
  recurrenceDefinition,
  setRecurrenceDefinition,
}) => {
  const [isRecurrenceModalOpen, setRecurrenceModalOpen] = React.useState(false);

  const recurrenceOptions = [
    { label: "Once", value: 0, unit: "days" },
    { label: "Daily", value: 1, unit: "days" },
    { label: "Weekly", value: 1, unit: "weeks" },
    { label: "Monthly", value: 1, unit: "months" },
    { label: "Yearly", value: 1, unit: "years" },
    { label: "Custom", value: null, unit: null },
  ];

  const handleRecurrenceSelect = (option: any) => {
    if (option.label === "Custom") {
      setRecurrenceModalOpen(true);
    } else {
      setRecurrenceDefinition({
        ...recurrenceDefinition,
        intervalValue: option.value || 0,
        intervalUnit: option.unit || "days",
      });
    }
  };

  return (
    <div>
      <h3>Occurring</h3>
      <div style={{ display: "flex", overflowX: "auto", gap: "1rem", padding: "1rem 0" }}>
        {recurrenceOptions.map((option) => (
          <button key={option.label} onClick={() => handleRecurrenceSelect(option)}>
            {option.label}
          </button>
        ))}
      </div>
      {isRecurrenceModalOpen && (
        <AutonomousModal isOpen={isRecurrenceModalOpen} onClose={() => setRecurrenceModalOpen(false)}>
          <h2>Custom Recurrence</h2>
          <label>
            Interval Value:
            <input
              type="number"
              min="1"
              value={recurrenceDefinition.intervalValue || ""}
              onChange={(e) =>
                setRecurrenceDefinition({
                  ...recurrenceDefinition,
                  intervalValue: parseInt(e.target.value, 10) || 0,
                })
              }
            />
          </label>
          <label>
            Interval Unit:
            <select
              value={recurrenceDefinition.intervalUnit || ""}
              onChange={(e) =>
                setRecurrenceDefinition({
                  ...recurrenceDefinition,
                  intervalUnit: e.target.value,
                })
              }
            >
              <option value="">Select Unit</option>
              <option value="minutes">Minutes</option>
              <option value="hours">Hours</option>
              <option value="days">Days</option>
              <option value="weeks">Weeks</option>
              <option value="months">Months</option>
              <option value="years">Years</option>
            </select>
          </label>
          <label>
            <input
              type="checkbox"
              checked={recurrenceDefinition.doesRecurrenceEnd}
              onChange={(e) =>
                setRecurrenceDefinition({
                  ...recurrenceDefinition,
                  doesRecurrenceEnd: e.target.checked,
                  recurrenceEndDate: e.target.checked ? recurrenceDefinition.recurrenceEndDate : null,
                })
              }
            />
            Recurrence End Date
          </label>
          <input
            type="date"
            value={recurrenceDefinition.recurrenceEndDate ? format(recurrenceDefinition.recurrenceEndDate, "yyyy-MM-dd") : ""}
            onChange={(e) =>
              setRecurrenceDefinition({
                ...recurrenceDefinition,
                recurrenceEndDate: new Date(e.target.value),
              })
            }
            disabled={!recurrenceDefinition.doesRecurrenceEnd}
          />
          <button onClick={() => setRecurrenceModalOpen(false)}>Save</button>
        </AutonomousModal>
      )}
    </div>
  );
};

export default RecurrenceSelector;