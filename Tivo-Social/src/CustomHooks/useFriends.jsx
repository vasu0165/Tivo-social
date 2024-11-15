import { useEffect, useState } from 'react';
import { database } from '../services/firebase'; // Firebase setup for accessing the Realtime Database

const useFriends = () => {
  const [friends, setFriends] = useState([]); // List of friends
  const [loading, setLoading] = useState(true); // Loading state
  const [error, setError] = useState(null); // Error state
  const userId = firebase.auth().currentUser?.uid; // Get the current user's UID from Firebase Auth

  useEffect(() => {
    if (!userId) {
      setError('No user logged in.');
      setLoading(false);
      return;
    }

    // Get the current user's friends from Firebase Realtime Database
    const userRef = database.ref(`users/${userId}/friends`);

    // Fetch friends data
    userRef.once('value', async (snapshot) => {
      const friendsData = snapshot.val();

      if (friendsData) {
        const friendIds = Object.keys(friendsData); // Get the friend IDs
        const friendsList = [];

        // Fetch each friend's details (e.g., email)
        for (let friendId of friendIds) {
          const friendRef = database.ref(`users/${friendId}`);
          const friendSnapshot = await friendRef.once('value');
          const friendData = friendSnapshot.val();
          
          if (friendData) {
            friendsList.push({ id: friendId, email: friendData.email }); // Add friend data to list
          }
        }

        setFriends(friendsList); // Set the state with the fetched friend details
      } else {
        setFriends([]); // No friends found
      }
      setLoading(false); // Set loading to false once data is fetched
    }, (err) => {
      setError(err.message); // Handle any errors
      setLoading(false); // Set loading to false
    });
  }, [userId]);

  return { friends, loading, error };
};

export default useFriends;
