import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import AppToolbar from "./AppToolbar";
import NotesTimeline from "./NotesTimeline";
import axios from "axios";

export default function Dashboard() {
  const navigate = useNavigate();
  const token = localStorage.getItem("auth-token");

  const [noteCollection, setNoteCollection] = useState([]);
  const [categories, setCategories] = useState([]);
  const [showPage, setShowPage] = useState(false);

  // Search Bar
  const [searchValue, setSearchValue] = useState("");

  const url = "http://localhost:8000/api";

  useEffect(() => {
    async function loadDashboard() {
      const result = await verifyJWT();
      if (result) getAllNotes();
      console.log(result);
    }

    loadDashboard();
  }, []);

  const verifyJWT = async () => {
    console.log(token);

    return axios
      .get(`${url}/token`, {
        headers: {
          "auth-token": token, //the token is a variable which holds the token
        },
      })
      .then((result) => {
        console.log(result);
        console.log("VALID TOKEN AFTER RESULT");
        setShowPage(true);
        return true;
      })
      .catch((err) => {
        console.log("GO BACK TO LOGIN");
        navigate("../auth", { replace: true });
        return false;
        // navigate('/auth');
      });
  };

  const getAllNotes = () => {
    console.log("here");
    axios
      .get(`${url}/note`, {
        headers: {
          "auth-token": token, //the token is a variable which holds the token
        },
      })
      .then(({ data }) => {
        setNoteCollection(data.noteItem.notes.reverse()); // Reverse the note order, to show the newest first.
        setCategories(data.noteItem.categories);
        console.log("NoteITEM: ", data.noteItem);
      })
      .catch((error) => console.error(`Error: ${error.message}`));
  };

  if (!showPage) return null;
  else
    return (
      <>
        <AppToolbar
          noteCollection={noteCollection}
          setNoteCollection={setNoteCollection}
          categories={categories}
          setCategories={setCategories}
          searchValue={searchValue}
          setSearchValue={setSearchValue}
        />
        <NotesTimeline
          noteCollection={noteCollection}
          setNoteCollection={setNoteCollection}
          categories={categories}
          setCategories={setCategories}
          searchValue={searchValue}
        />
      </>
    );
}
