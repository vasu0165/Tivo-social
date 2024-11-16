import React, { useContext, useState } from "react";
import { updateDoc, doc, arrayUnion, arrayRemove } from "firebase/firestore";
import { db } from "../Firebase/FirebaseConfig";
import { AuthContext } from "../Context/UserContext";
import toast, { Toaster } from "react-hot-toast";

function useUpdatereMovies() {
  const { User } = useContext(AuthContext);
  const [Error, setError] = useState(false);

  function notify() {
    toast.success("  Movie removed from Recommendations List  ");
  }
  function alertError(message) {
    toast.error(message);
  }
//   const addToWatchedMovies = (movie) => {
//     updateDoc(doc(db, "WatchedMovies", User.uid), {
//       movies: arrayUnion(movie),
//     });
//   };

  const removeFromreMovies = (movie) => {
    updateDoc(doc(db, "Recommended", User.uid), {
      movies: arrayRemove(movie),
    })
      .then(() => {
        notify();
        console.log(movie)
      })
      .catch((error) => {
        console.log(error.code);
        console.log(error.message);
        alertError(error.message);
        setError(true);
      });
  };

  const removePopupreMessage = (
    <Toaster
      toastOptions={{
        style: {
          padding: "1.5rem",
          backgroundColor: Error ? "#fff4f4" : "#f4fff4",
          borderLeft: Error ? "6px solid red" : "6px solid lightgreen",
        },
      }}
    />
  );

  return { removeFromreMovies, removePopupreMessage };
}

export default useUpdatereMovies;
