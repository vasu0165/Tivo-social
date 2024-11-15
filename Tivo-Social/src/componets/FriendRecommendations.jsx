import React, { useEffect, useContext } from "react";
import { db } from "../Firebase/FirebaseConfig";
import { AuthContext } from "../Context/UserContext";
import { doc, getDoc, collection, getDocs, setDoc } from "firebase/firestore";

const FriendRecommendations = () => {
  const { User } = useContext(AuthContext); // Get logged-in user from Auth context

  useEffect(() => {
    const fetchAndStoreFriendsRecommendations = async () => {
      try {
        // Step 1: Fetch logged-in user's friends
        const userRef = doc(db, "Users", User.uid);
        const userDoc = await getDoc(userRef);

        if (userDoc.exists()) {
          const { friends } = userDoc.data();
          let allFriendsWatchedMovies = [];

          // Step 2: Loop through each friend to retrieve their watched movies
          for (const friendEmail of friends) {
            // Find friend's document by email
            const friendsQuery = collection(db, "Users");
            const friendsSnapshot = await getDocs(friendsQuery);
            const friendDoc = friendsSnapshot.docs.find(
              (doc) => doc.data().email === friendEmail
            );

            if (friendDoc) {
              const friendUid = friendDoc.id; // Retrieve friend's UID
              console.log(friendUid);
              const friendWatchedRef = doc(db, "WatchedMovies", friendUid);
              const friendWatchedDoc = await getDoc(friendWatchedRef);

              if (friendWatchedDoc.exists()) {
                const friendWatchedMovies = friendWatchedDoc.data().movies;
                allFriendsWatchedMovies = [
                  ...allFriendsWatchedMovies,
                  ...friendWatchedMovies,
                ];
              }
            }
          }

          // Step 3: Remove duplicate movies from the aggregated list
          const uniqueMovies = [...new Set(allFriendsWatchedMovies)];

          // Step 4: Store unique recommendations in Firestore under "Recommended"
          const recommendationsRef = doc(db, "Recommended", User.uid);
          await setDoc(recommendationsRef, {
            Uid: User.uid, // Store the user's UID as a string
            movies: uniqueMovies, // Store unique recommended movies
          });

          console.log("Friends' recommended movies successfully stored in Firestore!");
        }
      } catch (error) {
        console.error("Error storing friends' recommendations:", error);
      }
    };

    fetchAndStoreFriendsRecommendations();
  }, [User.uid]);

  return null; // No UI is needed, just data processing and storage
};

export default FriendRecommendations;
