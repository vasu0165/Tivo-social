import React, { useState, useEffect } from "react";
import { db } from "../Firebase/FirebaseConfig";
import { collection, query, where, getDocs, getDoc, updateDoc, doc, arrayUnion, arrayRemove, setDoc } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { deleteDoc } from "firebase/firestore";
// import { db } from "../Firebase/FirebaseConfig";

const Tivosocial = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [users, setUsers] = useState([]);
  const [friends, setFriends] = useState([]);
  const [rmovies, setrMovies] = useState([]);
  const [loggedInUserUid, setLoggedInUserUid] = useState(null);
  const [friendUIDs, setFriendUIDs] = useState([]);
  const [friendEmails, setFriendEmails] = useState([]); // To store email of friends


  

const deleteDocument = async (collectionName, documentId) => {
  try {
    // Reference the document
    const docRef = doc(db, collectionName, documentId);

    // Delete the document
    await deleteDoc(docRef);

    console.log(`Document with ID '${documentId}' from '${collectionName}' collection has been deleted.`);
  } catch (error) {
    console.error("Error deleting document:", error);
  }
};
  // Fetch users based on search query
  const fetchUsers = async (queryString) => {
    if (queryString.trim() === "") {
      setUsers([]);
      return;
    }

    const usersRef = collection(db, "Users");
    const q = query(
      usersRef,
      where("email", ">=", queryString),
      where("email", "<=", queryString + "\uf8ff")
    );

    const querySnapshot = await getDocs(q);
    const usersList = querySnapshot.docs.map((doc) => {
      const userData = doc.data();
      return { uid: doc.id, email: userData.email }; // Save both uid and email
    });
    setUsers(usersList);
  };

  const handleSearchChange = (e) => {
    const queryString = e.target.value;
    setSearchQuery(queryString);
    fetchUsers(queryString);
  };

  // Fetch the logged-in user's friends and their UIDs
  const fetchFriends = async () => {
    const auth = getAuth();
    const user = auth.currentUser;

    if (user) {
      setLoggedInUserUid(user.uid);
      try {
        const userRef = doc(db, "Users", user.uid);
        const userDoc = await getDoc(userRef);

        if (userDoc.exists()) {
          const Updatedfriends = userDoc.data().friends;

          if (Updatedfriends.length==0){
            deleteDocument("Recommended", loggedInUserUid)
          }
          
          setFriends(userDoc.data().friends || []);
          
          // Fetch the UIDs of friends
          const friendsUIDs = userDoc.data().friends || [];
          setFriendUIDs(friendsUIDs);

          // Fetch emails of friends using UIDs
          const emails = await getFriendEmails(friendsUIDs);
          setFriendEmails(emails);
        } else {
          console.log("No user document found!");
        }
      } catch (error) {
        console.error("Error fetching friends:", error);
      }
    }
  };

  // Function to get emails for friends by their UIDs
  const getFriendEmails = async (friendUIDs) => {
    const emails = [];
    for (let uid of friendUIDs) {
      const userRef = doc(db, "Users", uid);
      const userDoc = await getDoc(userRef);
      if (userDoc.exists()) {
        emails.push(userDoc.data().email);
      }
    }
    return emails;
  };

  // Add a friend
  const handleAddFriend = async (friendUid) => {
    if (!loggedInUserUid) return;

    if (!friends.includes(friendUid)) {
      try {
        const userRef = doc(db, "Users", loggedInUserUid);
        await updateDoc(userRef, {
          friends: arrayUnion(friendUid),
        });
        
        

        const friendRef = doc(db, "Users", friendUid);
        await updateDoc(friendRef, {
          friends: arrayUnion(loggedInUserUid),
        });

        setFriends((prevFriends) => [...prevFriends, friendUid]);
        fetchFriends();
        console.log("Will call soon");
      } catch (error) {
        console.error("Error adding friend:", error);
      }
    }
    
  };
  const fetchAndStoreRecommendedMovies = async () => {
    // await fetchFriends();
    console.log("loogedin user ",loggedInUserUid);
    console.log("friends",friendUIDs);
    if (!loggedInUserUid || friendUIDs.length === 0) { // Replace 'Users' and 'document-id-here' with your collection name and document ID
      return;}
  
    try {
      // Reset the recommended movies array before fetching new data
      let newRecommendedMovies = [];
      console.log("In TiVo Social", friendUIDs)
      // Iterate through the list of friends' UIDs
      for (let friendUid of friendUIDs) {
        // Fetch the watched movies collection of the friend
        const docRef = doc(db, "WatchedMovies", friendUid);
        const docSnapshot = await getDoc(docRef);
        if (docSnapshot.exists()) {
          const movies = docSnapshot.data().movies; // Assuming 'movies' is a field, not a sub-collection
          console.log(movies);
  
          // For each movie, check if it exists in the 'RemovedRecommendation' collection
          const removedMoviesRef = doc(db, "RemovedRecommendation", loggedInUserUid);
          const removedMoviesSnapshot = await getDoc(removedMoviesRef);
  
          // Filter out movies that are in the 'RemovedRecommendation' collection
          const removedMovies = removedMoviesSnapshot.exists() ? removedMoviesSnapshot.data().movies || [] : [];
  
          const filteredMovies = movies.filter((movie) => {
            return !removedMovies.some((removedMovie) => removedMovie.id === movie.id);
          });
  
          // Add friend's movies (filtered from removed recommendations) to the new list
          newRecommendedMovies = [...newRecommendedMovies, ...filteredMovies];
        } else {
          console.log("No data found for this friend.");
        }
      }
  
      // Update the recommended movies in the Firestore 'Recommended' collection
      if (newRecommendedMovies.length > 0) {
        const recommendedRef = doc(db, "Recommended", loggedInUserUid);
        const recommendedDoc = await getDoc(recommendedRef);
  
        if (recommendedDoc.exists()) {
          // If the document exists, we update it with the new list of recommended movies
          await updateDoc(recommendedRef, {
            movies: newRecommendedMovies,
          });
        } else {
          // If no document exists, we create a new one with the list of recommended movies
          await setDoc(recommendedRef, {
            movies: newRecommendedMovies,
          });
        }
  
        console.log("Recommended movies updated in Firestore!");
      } else {
        console.log("No recommended movies to update.");
      }
    } catch (error) {
      console.error("Error fetching and storing recommended movies:", error);
    }
  };
  
  

  // Remove a friend
  const handleRemoveFriend = async (friendUid) => {
    if (!loggedInUserUid) return;
  
    try {
      const userRef = doc(db, "Users", loggedInUserUid);
      await updateDoc(userRef, {
        friends: arrayRemove(friendUid),
      });
  
      const friendRef = doc(db, "Users", friendUid);
      await updateDoc(friendRef, {
        friends: arrayRemove(loggedInUserUid),
      });
  
      setFriends((prevFriends) => prevFriends.filter((friend) => friend !== friendUid));
      console.log("Friend removed successfully!");
  
      // Call fetchAndStoreRecommendedMovies after removing a friend
      await fetchFriends();
      // fetchAndStoreRecommendedMovies();
       // Trigger the movie fetch and store logic
    } catch (error) {
      console.error("Error removing friend:", error);
    }
  };
  

  // // Store friends UIDs in f_Recommended collection
  // const storeFriendUIDsInRecommended = async () => {
  //   if (!loggedInUserUid) return;
  //   try {
  //     const recommendedRef = collection(db, "Users", loggedInUserUid, "f_Recommended");
  //     const docRef = doc(recommendedRef, "friendsUIDs");
  //     await setDoc(docRef, {
  //       uids: friendUIDs,
  //     });
  //     console.log("Friend UIDs stored in f_Recommended!");
  //   } catch (error) {
  //     console.error("Error storing friend UIDs:", error);
  //   }
  // };

  useEffect(() => {
    fetchFriends();
  }, []); // Fetch friends when component mounts

  useEffect(() => {
    if (friendUIDs.length > 0) {
      // fetchFriends();
      fetchAndStoreRecommendedMovies();
      console.log("Tikkkkkk");
      // storeFriendUIDsInRecommended(); // Store the UIDs once they are updated
    }
  }, [friends]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-900 via-purple-800 to-gray-900">
      <div className="w-full max-w-lg p-6 bg-white rounded-lg shadow-lg">
        <h1 className="text-2xl font-bold text-center text-gray-800 mb-6">TiVo Connect</h1>

        {/* Search Bar */}
        <input
          type="text"
          placeholder="Search by email"
          value={searchQuery}
          onChange={handleSearchChange}
          className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600 mb-4"
        />

        {/* List of Filtered Users */}
        <div className="w-full mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-2">Search Results</h2>
          {users.length > 0 ? (
            users.map((user) => (
              <div key={user.uid} className="flex justify-between items-center p-2 border-b border-gray-300">
                <span className="text-gray-800">{user.email}</span>
                <button
                  onClick={() => handleAddFriend(user.uid)} // Use UID here
                  className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition"
                >
                  Add Friend
                </button>
              </div>
            ))
          ) : (
            <p className="text-gray-600">No users found.</p>
          )}
        </div>


        {/* Friend List */}
        <div className="w-full max-w-xl mx-auto mt-8 bg-white p-6 rounded-lg shadow-lg">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Friends List</h2>
          {friendEmails.length > 0 ? (
            friendEmails.map((email, index) => (
              <div
                key={index}
                className="flex justify-between items-center p-4 mb-3 bg-gray-50 rounded-lg shadow-sm hover:bg-gray-100 transition duration-300"
              >
                <span className="text-lg font-medium text-gray-800">{email.split("@")[0]}</span> {/* Display email here */}
                <button
                  onClick={() => handleRemoveFriend(friendUIDs[index])}
                  className="px-4 py-2 bg-red-500 text-white rounded-md text-sm font-semibold hover:bg-red-600 transition duration-200"
                >
                  Remove
                </button>
              </div>
            ))
          ) : (
            <p className="text-gray-500">No friends added yet.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Tivosocial;
