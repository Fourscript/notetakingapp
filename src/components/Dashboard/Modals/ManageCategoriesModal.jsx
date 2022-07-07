import { Close, Restore } from "@mui/icons-material";
import { LoadingButton } from "@mui/lab";
import {
  Box,
  Card,
  Grow,
  IconButton,
  Modal,
  Stack,
  Typography,
} from "@mui/material";
import { AnimatePresence, motion } from "framer-motion";
import React, { useEffect, useState } from "react";
import { useMutation } from "react-query";
import { updateCategories } from "../../../helpers/requests/category-requests";
import {
  springShort,
  variantFadeSlideDownStagger,
} from "../../../styles/animations/definitions";
import { modalCard } from "../../../styles/components/modal";
import { getOrCreateCategoryID } from "../../../utils/id-utils";
import {
  doCategoryNamesCollide,
  doesCategoryExist,
} from "../../../utils/input-validation/validate-category";
import CategorySearchInput from "../SharedComponents/CategorySearchInput";
import CustomTooltip from "../SharedComponents/CustomTooltip";
import EditableCategoryChip from "./Category/EditableCategoryChip";

export default function ManageCategoriesModal({
  modalOpen,
  handleModalClose,
  categoriesCollection,
  setCategoriesCollection,
  setNoteCollection,
  isMobile,
}) {
  //#region Hooks
  const [inputCategoryName, setInputCategoryName] = useState("");
  const [modifiedCategories, setModifiedCategories] = useState([]);

  const [noCategoriesDisplayed, setNoCategoriesDisplayed] = useState(false);

  useEffect(() => {
    // Reflect any changes to categoriesCollection in modifiedCategories
    setModifiedCategories(categoriesCollection);
  }, [categoriesCollection]);

  const isCategoryNew = !doesCategoryExist(
    inputCategoryName,
    modifiedCategories
  );

  //#region Query Handling Hooks
  // Updates the categories collection in the database
  const { mutate: mutateUpdate, status: updateStatus } = useMutation(
    updateCategories,
    {
      onSuccess: ({ data }) => {
        setCategoriesCollection(data.noteItem.categories);
        setNoteCollection(data.noteItem.notes.reverse());
        handleModalClose();
      },
      onError: (error) => {
        console.error(error);
      },
    }
  );
  //#endregion
  //#endregion

  const categoriesChanged =
    JSON.stringify(modifiedCategories) !== JSON.stringify(categoriesCollection);
  // Filter out the empty "" category names
  // From the filtered categories, filter out the ones that don't match the inputCategoryName if it's not empty
  const filteredCategories = modifiedCategories.filter(
    (category) =>
      category.id !== 0 &&
      (inputCategoryName === "" ||
        category.name
          .toLowerCase()
          .includes(inputCategoryName.trim().toLowerCase()))
  );

  // If there are no filtered categories, delay the display of the no categories message to avoid flicker
  if (filteredCategories.length === 0 && !noCategoriesDisplayed) {
    setTimeout(() => {
      setNoCategoriesDisplayed(true);
    }, 400);
  } else if (filteredCategories.length > 0 && noCategoriesDisplayed) {
    setNoCategoriesDisplayed(false);
  }

  //#region Helper Functions
  // Reset modal values is used when creating a note
  const resetModalValues = () => {
    setInputCategoryName("");
    setModifiedCategories(categoriesCollection);
  };
  //#endregion

  //#region Handlers
  const handleSaveCategories = () => {
    mutateUpdate({ categories: modifiedCategories });
  };

  // Change the previous name of the category to the new one
  const handleRenameCategory = (
    categoryId,
    prevCategoryName,
    newCategoryName
  ) => {
    setModifiedCategories((prevCategories) =>
      prevCategories.map((category) =>
        category.id === categoryId
          ? { ...category, name: newCategoryName }
          : category
      )
    );
  };

  const handleRecolorCategory = (
    categoryId,
    prevCategoryColor,
    categoryColor
  ) => {
    if (prevCategoryColor !== categoryColor) {
      setModifiedCategories((prevCategories) =>
        prevCategories.map((category) =>
          category.id === categoryId
            ? { ...category, color: categoryColor }
            : category
        )
      );
    }
  };

  const handleCreateCategory = () => {
    if (isCategoryNew) {
      setModifiedCategories((prevCategories) => [
        {
          id: getOrCreateCategoryID(prevCategories, inputCategoryName),
          name: inputCategoryName,
          color: "none",
          note_count: 0,
        },
        ...prevCategories,
      ]);
      setInputCategoryName("");
    }
  };

  const handleDeleteCategory = (categoryId) => {
    setModifiedCategories((prevCategories) =>
      prevCategories.filter((category) => category.id !== categoryId)
    );
  };

  const handleBeforeModalClose = (event, reason) => {
    if (reason === "closeModal") {
      handleModalClose();
      setTimeout(() => {
        resetModalValues();
      }, 500); // Don't immediately reset the values till the closing animation is complete
    } else {
      handleModalClose();
    }
  };
  //#endregion

  return (
    <Modal open={modalOpen} onClose={handleModalClose} closeAfterTransition>
      <Grow in={modalOpen}>
        <Card sx={modalCard}>
          <Box display={"flex"}>
            <Typography
              display={"flex"}
              alignSelf={"center"}
              variant="h5"
              color={"primary"}
            >
              Manage Categories
            </Typography>
            <Box display={"flex"} ml={"auto"}>
              <CustomTooltip title={"Revert changes"}>
                <IconButton
                  color={"neutral"}
                  size={"small"}
                  disabled={!categoriesChanged}
                  onClick={resetModalValues}
                  sx={{ transition: "all 0.2s ease-in-out" }}
                >
                  <Restore />
                </IconButton>
              </CustomTooltip>
              <CustomTooltip title={"Close dialog"}>
                <IconButton
                  color={"neutral"}
                  size={"small"}
                  onClick={(event) =>
                    handleBeforeModalClose(event, "closeModal")
                  }
                >
                  <Close />
                </IconButton>
              </CustomTooltip>
            </Box>
          </Box>
          <CategorySearchInput
            categoryName={inputCategoryName}
            setCategoryName={setInputCategoryName}
            categoryExists={!isCategoryNew}
            onCreate={handleCreateCategory}
            sx={{ my: "1rem" }}
          />
          <Stack
            direction={"column"}
            spacing={2}
            py={"1em"}
            px={isMobile ? "0" : "1em"} // Add a small right padding for scrollbar on desktop
            overflow={"scroll"}
            height={["20rem", "22rem", "24rem", "28rem", "32rem"]}
          >
            <AnimatePresence>
              {filteredCategories.map((category, index) => (
                <motion.div
                  key={category.id}
                  layout
                  transition={springShort}
                  variants={variantFadeSlideDownStagger}
                  custom={index}
                  initial={"hidden"}
                  animate={"visible"}
                  exit={"hidden"}
                >
                  <EditableCategoryChip
                    categoryName={category.name}
                    categoryColor={category.color}
                    setCategoryName={(categoryName) =>
                      handleRenameCategory(
                        category.id,
                        category.name,
                        categoryName
                      )
                    }
                    setCategoryColor={(categoryColor) =>
                      handleRecolorCategory(
                        category.id,
                        category.color,
                        categoryColor
                      )
                    }
                    categoryCollection={modifiedCategories}
                    enableEdit
                    onDelete={() => handleDeleteCategory(category.id)}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
            {noCategoriesDisplayed && (
              <Grow in>
                <Typography
                  textAlign={"center"}
                  variant="body1"
                  color={"primary"}
                >
                  No categories to display
                </Typography>
              </Grow>
            )}
          </Stack>
          <LoadingButton
            loading={updateStatus === "loading"}
            variant="contained"
            size="small"
            disabled={
              !categoriesChanged || doCategoryNamesCollide(modifiedCategories)
            }
            onClick={handleSaveCategories}
            sx={{
              border: "1px",
              mt: 2,
              ml: "auto",
            }}
          >
            Save
          </LoadingButton>
        </Card>
      </Grow>
    </Modal>
  );
}
