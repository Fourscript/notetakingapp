import { Box } from "@mui/material";
import { useRef } from "react";
import {
  isColliding,
  mergePointIntoPosition,
  swapPosition,
} from "../../../helpers/sortable";
import SortableNote from "./SortableNote";

export default function SortableNotesContainer({
  noteCollection,
  setNoteCollection,
  categories,
}) {
  const dragConstraintRef = useRef(null);
  const positions = useRef([]);

  const setPosition = (index, position) => {
    positions.current[index] = position;
    console.log(positions.current);
  };

  const moveNote = (currentIndex, currentPoint) => {
    const currentPosition = mergePointIntoPosition(
      positions.current[currentIndex],
      currentPoint
    );

    const collidingIndices = [];
    for (
      let positionIndex = 0;
      positionIndex < positions.current.length;
      positionIndex++
    ) {
      if (currentIndex === positionIndex) {
        continue;
      }
      if (isColliding(currentPosition, positions.current[positionIndex])) {
        console.log(true);
        collidingIndices.push(positionIndex);
      }
    }

    if (collidingIndices.length > 0) {
      positions.current = swapPosition(
        positions.current,
        currentIndex,
        collidingIndices[0]
      );
      setNoteCollection(
        swapPosition(noteCollection, currentIndex, collidingIndices[0])
      );
    }
  };

  return (
    <Box
      ref={dragConstraintRef}
      p="1.5em"
      display="grid"
      gap="2em"
      gridTemplateColumns="repeat(auto-fill, minmax(300px, 1fr))"
      justifyItems="center"
    >
      {noteCollection.map((note, index) => (
        <SortableNote
          key={note.id}
          note={note}
          noteIdx={index}
          dragConstraintRef={dragConstraintRef}
          moveNote={moveNote}
          setPosition={setPosition}
          noteCollection={noteCollection}
          setNoteCollection={setNoteCollection}
          categories={categories}
        />
      ))}
    </Box>
  );
}