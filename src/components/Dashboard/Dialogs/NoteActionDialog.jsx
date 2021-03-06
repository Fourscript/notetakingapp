import { LoadingButton } from "@mui/lab";
import {
  Card,
  Dialog,
  Fade,
  Grow,
  TextField,
  useMediaQuery,
  useTheme,
  Zoom,
} from "@mui/material";
import { motion } from "framer-motion";
import React, { useEffect, useState } from "react";
import { useMutation } from "react-query";
import {
  NOTE_DESCRIPTION_CHAR_LIMIT,
  NOTE_TITLE_CHAR_LIMIT,
} from "../../../constants/input-limits";
import { MODAL_ACTIONS } from "../../../helpers/models/dialogs";
import {
  createCategoryID,
  doCategoryNamesCollide,
  getOrCreateCategoryID,
} from "../../../helpers/notes/category";
import {
  createNote,
  updateNote,
} from "../../../helpers/requests/note-requests";
import { variantFadeSlideUpSlow } from "../../../styles/animations/definitions";
import { dialogCard } from "../../../styles/components/dialog";
import RemainingCharCount from "../SharedComponents/RemainingCharCount";
import EditableCategoryChip from "./Components/EditableCategoryChip";
import SelectOrAddCategory from "./Components/SelectOrAddCategory";
import Titlebar from "./Components/Titlebar";

const DESCRIPTION_ROWS = {
  TINY: 4,
  SMALL: 8,
  MEDIUM: 12,
  LARGE: 16,
  HUGE: 20,
  GIGANTIC: 24,
};

export default function NoteActionDialog({
  action,
  noteID,
  title,
  description,
  categoryName,
  categoryColor,
  categoriesCollection,
  setNoteCollection,
  setCategoriesCollection,
  dialogOpen,
  handleDialogClose,
}) {
  //#region Hooks
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isSmallMobile = useMediaQuery(theme.breakpoints.down("380"));

  // Tracks any changes to the current action being performed (edit, create, view, etc)
  const [currentAction, setCurrentAction] = useState(action);

  const [newTitle, setNewTitle] = useState(title);
  const [newDescription, setNewDescription] = useState(description);
  const [newCategoryName, setNewCategoryName] = useState(categoryName);
  const [newCategoryColor, setNewCategoryColor] = useState(categoryColor);
  const [displayCategoryChip, setDisplayCategoryChip] = useState(
    !!categoryName
  );
  const [isCategoryNew, setIsCategoryNew] = useState(false);

  useEffect(() => {
    setCurrentAction(action);
    setNewTitle(title);
    setNewDescription(description);
    setNewCategoryName(categoryName);
    setNewCategoryColor(categoryColor);
    setDisplayCategoryChip(!!categoryName);
  }, [action, title, description, categoryName, categoryColor]);
  //#endregion

  //#region Query Handling Hooks
  const { mutate: mutateEdit, status: editStatus } = useMutation(updateNote, {
    onSuccess: ({ data }) => {
      handleDialogClose();
      // Reflect the database changes on the front-end
      setNoteCollection(data.noteItem.notes.reverse());
      setCategoriesCollection(data.noteItem.categories);
      setIsCategoryNew(false); // Reset the flag. If a new category was created, it is not new anymore
    },
    onError: (error) => {
      console.error(error.message);
    },
  });

  const { mutate: mutateCreate, status: createStatus } = useMutation(
    createNote,
    {
      onSuccess: ({ data }) => {
        handleDialogClose();
        // Reflect the database changes on the front-end
        setNoteCollection(data.noteItem.notes.reverse());
        setCategoriesCollection(data.noteItem.categories);
        handleResetModalValues(); // Only reset on successful note creation
      },
      onError: (error) => {
        console.error(error.message);
      },
    }
  );
  //#endregion
  //#endregion

  //#region Helper Functions
  // Reset modal values is used when creating or editing a note
  // If keepCurrentAction is true, it means that we don't want to reset the current action (e.g. when resetting the values)
  const handleResetModalValues = (keepCurrentAction = false) => {
    if (!keepCurrentAction) {
      setCurrentAction(action);
    }
    setNewTitle(title);
    setNewDescription(description);
    setNewCategoryName(categoryName);
    setNewCategoryColor(categoryColor);
    setDisplayCategoryChip(!!categoryName);
    setIsCategoryNew(false);
  };
  //#endregion

  //#region Handlers
  const handleActionChange = (newAction) => {
    setCurrentAction(newAction);
  };

  const handleCreateNote = () => {
    const newNote = {
      title: `${newTitle.trim()}`,
      description: `${newDescription.trim()}`,
      category: {
        id: getOrCreateCategoryID(categoriesCollection, newCategoryName.trim()),
        name: `${newCategoryName.trim()}`,
        color: `${newCategoryColor || "none"}`,
      },
      tags: [],
    };
    mutateCreate(newNote);
  };

  const handleEditNote = () => {
    // If no changes made, no database request necessary
    if (valuesChanged) {
      const editedNote = {
        noteID: Number(noteID),
        title: `${newTitle.trim()}`,
        description: `${newDescription.trim()}`,
        category: {
          id: getOrCreateCategoryID(
            categoriesCollection,
            newCategoryName.trim()
          ),
          name: displayCategoryChip ? `${newCategoryName.trim()}` : "", // Ensure we don't send the temporary category name
          color: `${newCategoryColor}`,
        },
        tags: [],
      };
      mutateEdit(editedNote);
    } else {
      handleDialogClose();
    }
  };

  const handleCategoryChipDelete = () => {
    console.log("handleCategoryChipDelete");
    setNewCategoryName("");
    setNewCategoryColor("none");
    setDisplayCategoryChip(false);
    setIsCategoryNew(false);
  };

  const handleAfterModalClose = (event = {}, reason = "") => {
    if (reason === "closeModal" || !valuesChanged) {
      handleResetModalValues();
    }
  };
  //#endregion

  //#region Derived State Variables
  // Short variable names for the current action being performed
  const isViewing = currentAction === MODAL_ACTIONS.VIEW;
  const isEditing = currentAction === MODAL_ACTIONS.EDIT;
  const isCreating = currentAction === MODAL_ACTIONS.CREATE_NOTE;
  // Description textarea row count
  let maxDescriptionRows = DESCRIPTION_ROWS.HUGE;
  let minDescriptionRows = DESCRIPTION_ROWS.TINY;
  if (isSmallMobile) {
    maxDescriptionRows = isViewing
      ? DESCRIPTION_ROWS.MEDIUM
      : DESCRIPTION_ROWS.SMALL;
  } else if (isMobile) {
    maxDescriptionRows = isViewing
      ? DESCRIPTION_ROWS.LARGE
      : DESCRIPTION_ROWS.MEDIUM;
  } else {
    minDescriptionRows = DESCRIPTION_ROWS.SMALL;
    maxDescriptionRows = isViewing
      ? DESCRIPTION_ROWS.HUGE
      : DESCRIPTION_ROWS.LARGE;
  }
  // modified categories collection with the new category
  let modifiedCategoriesCollection = [...categoriesCollection];
  if (isCategoryNew) {
    modifiedCategoriesCollection = [
      ...modifiedCategoriesCollection,
      {
        id: createCategoryID(categoriesCollection),
        name: newCategoryName,
        color: newCategoryColor,
      },
    ];
  }
  // Input validation
  const titleError = newTitle.trim() === "";
  const valuesChanged =
    newTitle.trim() !== title ||
    newDescription.trim() !== description ||
    newCategoryName.trim() !== categoryName ||
    newCategoryColor !== categoryColor;
  const saveDisabled =
    titleError ||
    !valuesChanged ||
    doCategoryNamesCollide(modifiedCategoriesCollection);
  //#endregion

  return (
    <Dialog
      open={dialogOpen}
      onClose={handleDialogClose}
      TransitionComponent={Grow}
      TransitionProps={{ onExited: () => handleAfterModalClose() }}
      closeAfterTransition
    >
      <Card sx={dialogCard}>
        <Titlebar
          action={currentAction}
          title={
            (isViewing && "Viewing Note") ||
            (isEditing && "Editing Note") ||
            (isCreating && "Creating a Note")
          }
          disableRevert={!valuesChanged}
          onClose={() => {
            handleDialogClose();
            setTimeout(() => {
              handleResetModalValues();
            }, 250);
          }}
          onActionChange={handleActionChange}
          onRevert={handleResetModalValues}
        />

        <TextField
          disabled={currentAction === MODAL_ACTIONS.VIEW}
          required
          id="outlined-required"
          label={"Title"}
          value={newTitle}
          sx={{ my: "1em" }}
          InputProps={{
            endAdornment: !isViewing && (
              <RemainingCharCount
                stringLength={newTitle.length}
                characterLimit={NOTE_TITLE_CHAR_LIMIT}
              />
            ),
          }}
          inputProps={{
            maxLength: NOTE_TITLE_CHAR_LIMIT,
          }}
          onChange={(event) => setNewTitle(event.target.value)}
        />

        <TextField
          disabled={currentAction === MODAL_ACTIONS.VIEW}
          id="outlined-multiline-static"
          label={"Description"}
          value={newDescription}
          multiline
          minRows={minDescriptionRows}
          maxRows={maxDescriptionRows}
          sx={{ mb: "1em" }}
          inputProps={{ maxLength: NOTE_DESCRIPTION_CHAR_LIMIT }}
          onChange={(event) => setNewDescription(event.target.value)}
        />

        {/* Display either the category chip or the search category component based on the user intended action */}
        {displayCategoryChip && (
          <motion.div
            variants={variantFadeSlideUpSlow}
            initial={"hidden"}
            animate={"visible"}
          >
            <EditableCategoryChip
              categoryName={newCategoryName}
              categoryColor={newCategoryColor}
              setCategoryName={setNewCategoryName}
              setCategoryColor={setNewCategoryColor}
              categoryCollection={modifiedCategoriesCollection}
              enableEdit={isCategoryNew} // Enable edit if category is new
              onDelete={!isViewing ? handleCategoryChipDelete : null}
            />
          </motion.div>
        )}
        {!displayCategoryChip && (isCreating || isEditing) && (
          <Fade in>
            <div>
              <SelectOrAddCategory
                categoriesCollection={categoriesCollection}
                categoryName={newCategoryName}
                setCategoryName={setNewCategoryName}
                setCategoryColor={setNewCategoryColor}
                setIsCategoryNew={setIsCategoryNew}
                setDisplayCategoryChip={setDisplayCategoryChip}
              />
            </div>
          </Fade>
        )}

        <Zoom in={isCreating || isEditing} unmountOnExit>
          <LoadingButton
            loading={editStatus === "loading" || createStatus === "loading"}
            variant="contained"
            size="small"
            disabled={saveDisabled} // Disable button if required title field is empty
            onClick={isEditing ? handleEditNote : handleCreateNote}
            sx={{
              border: "1px",
              mt: 2,
              ml: "auto",
            }}
          >
            {isEditing && "Save"}
            {isCreating && "Create"}
          </LoadingButton>
        </Zoom>
      </Card>
    </Dialog>
  );
}
