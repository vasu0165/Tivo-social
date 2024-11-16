import React, { useContext, useState } from "react";
import { updateDoc, doc, arrayUnion, arrayRemove } from "firebase/firestore";
import { getDoc, setDoc } from "firebase/firestore";

import { db } from "../Firebase/FirebaseConfig";
import { AuthContext } from "../Context/UserContext";
import toast, { Toaster } from "react-hot-toast";

function useUpdatereMovies() {
  const { User } = useContext(AuthContext);
  const [Error, setError] = useState(false);

  function notify() {
    toast.success("Movie removed from Recommendations List");
  }
  function alertError(message) {
    toast.error(message);
  }
  const addToRemovedRecommendationMovies = async (movie) => {
    const userDocRef = doc(db, "RemovedRecommendation", User.uid);

  try {
    // Check if the document already exists
    const docSnap = await getDoc(userDocRef);

    if (docSnap.exists()) {
      // If the document exists, update the "movies" array by adding the movie
      await updateDoc(userDocRef, {
        movies: arrayUnion(movie),
      });
    } else {
      // If the document does not exist, create a new one with the movie
      await setDoc(userDocRef, {
        movies: [movie],
      });
    }
  } catch (error) {
    console.error("Error updating the removed recommendations:", error);
  }
    console.log("added in removed")
  };

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

  return { removeFromreMovies,addToRemovedRecommendationMovies, removePopupreMessage };
}

export default useUpdatereMovies;
