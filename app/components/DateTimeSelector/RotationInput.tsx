import React from "react";
import { DragDropContext, Droppable, Draggable, DraggableProvided, DroppableProvided } from "react-beautiful-dnd";

interface RotationScheduleInputProps {
  members: string[];
  setMembers: (members: string[]) => void;
  schedule: boolean[][];
  setSchedule: (schedule: boolean[][]) => void;
}

const RotationScheduleInput: React.FC<RotationScheduleInputProps> = ({
  members,
  setMembers,
  schedule,
  setSchedule,
}) => {
  const handleToggle = (rowIndex: number, colIndex: number) => {
    const newSchedule = schedule.map((row, rIdx) =>
      rIdx === rowIndex
        ? row.map((val, cIdx) => (cIdx === colIndex ? !val : val))
        : row
    );
    setSchedule(newSchedule);
  };

  const handleAddRow = () => {
    setSchedule([...schedule, Array(members.length).fill(false)]);
  };

  const onDragEnd = (result: any) => {
    if (!result.destination) return;

    const { source, destination, type } = result;

    if (type === "column") {
      const newMembers = [...members];
      const [movedMember] = newMembers.splice(source.index, 1);
      newMembers.splice(destination.index, 0, movedMember);
      setMembers(newMembers);

      const newSchedule = schedule.map(row => {
        const newRow = [...row];
        const [movedValue] = newRow.splice(source.index, 1);
        newRow.splice(destination.index, 0, movedValue);
        return newRow;
      });
      setSchedule(newSchedule);
    } else {
      const newSchedule = [...schedule];
      const [movedRow] = newSchedule.splice(source.index, 1);
      newSchedule.splice(destination.index, 0, movedRow);
      setSchedule(newSchedule);
    }
  };

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <Droppable droppableId="columns" direction="horizontal" type="column">
        {(provided: DroppableProvided) => (
          <div ref={provided.innerRef} {...provided.droppableProps} style={{ display: "flex" }}>
            {members.map((member, colIndex) => (
              <Draggable key={member} draggableId={member} index={colIndex}>
                {(provided: DraggableProvided) => (
                  <div ref={provided.innerRef} {...provided.draggableProps} style={{ margin: "0 5px" }}>
                    <div {...provided.dragHandleProps} style={{ cursor: "grab" }}>{member}</div>
                    <Droppable droppableId={`row-${colIndex}`} type="row">
                      {(provided: DroppableProvided) => (
                        <div ref={provided.innerRef} {...provided.droppableProps}>
                          {schedule.map((row, rowIndex) => (
                            <Draggable key={rowIndex.toString()} draggableId={`row-${rowIndex}`} index={rowIndex}>
                              {(provided: DraggableProvided) => (
                                <div ref={provided.innerRef} {...provided.draggableProps}>
                                  <button
                                    {...provided.dragHandleProps}
                                    onClick={() => handleToggle(rowIndex, colIndex)}
                                    style={{ width: "50px", height: "30px", background: row[colIndex] ? "green" : "red" }}
                                  >
                                    {row[colIndex] ? "✔" : "✖"}
                                  </button>
                                </div>
                              )}
                            </Draggable>
                          ))}
                          {provided.placeholder}
                        </div>
                      )}
                    </Droppable>
                  </div>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
      <button onClick={handleAddRow}>Add Row</button>
    </DragDropContext>
  );
};

export default RotationScheduleInput;