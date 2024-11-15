import React, { useState, useEffect } from "react";
import { db, auth } from "./firebase"; // Import Firebase config
import { collection, query, where, getDocs } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";

const FriendsList = () => {
  const [userFriends, setUserFriends] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Function to fetch friends' UIDs by email
  const fetchFriendsUids = async (friendEmails) => {
    try {
      // Reference to the Users collection in Firestore
      const usersRef = collection(db, "Users");

      // Query to find users by email in the friends list
      const q = query(
        usersRef,
        where("email", "in", friendEmails) // 'in' operator is used to query multiple emails
      );

      const querySnapshot = await getDocs(q);

      const friendsData = [];
      querySnapshot.forEach((doc) => {
        friendsData.push({
          email: doc.data().email,
          uid: doc.id, // The user UID is the document ID in Firestore
        });
      });

      setUserFriends(friendsData);
    } catch (err) {
      setError("Failed to fetch friends' UIDs");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchUserData = async () => {
      onAuthStateChanged(auth, async (user) => {
        if (user) {
          // Get the current logged-in user's email
          const currentUserEmail = user.email;

          // Fetch the user's document from Firestore based on their email
          const userRef = collection(db, "Users");
          const q = query(userRef, where("email", "==", currentUserEmail));

          const querySnapshot = await getDocs(q);
          let userDoc = null;
          querySnapshot.forEach((doc) => {
            userDoc = doc.data();
          });

          if (userDoc) {
            // Extract friend emails from the user's friends array
            const friendEmails = userDoc.friends || [];
            if (friendEmails.length > 0) {
              // Fetch the friends' UIDs
              fetchFriendsUids(friendEmails);
            } else {
              setLoading(false);
              setError("You have no friends.");
            }
          } else {
            setLoading(false);
            setError("User not found.");
          }
        } else {
          setLoading(false);
          setError("User not authenticated");
        }
      });
    };

    fetchUserData();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div>
      <h3>Your Friends' UIDs</h3>
      <ul>
        {userFriends.map((friend, index) => (
          <li key={index}>
            {friend.email} (UID: {friend.uid})
          </li>
        ))}
      </ul>
    </div>
  );
};

export default FriendsList;
