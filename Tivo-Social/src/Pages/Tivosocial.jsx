import React, { useState, useEffect } from "react";
import { db } from "../Firebase/FirebaseConfig";
import { collection, query, where, getDocs, updateDoc, doc, arrayUnion } from "firebase/firestore";
import { getAuth } from "firebase/auth"; // To get the logged-in user's UID
import UsersList from "./UserList";

const Tivosocial = () => {
  const [searchQuery, setSearchQuery] = useState(""); // Search input state
  const [users, setUsers] = useState([]); // List of users
  const [friends, setFriends] = useState([]); // List of added friends
  const [loggedInUserUid, setLoggedInUserUid] = useState(null); // Store logged-in user's UID

  // Fetch users based on search query
  const fetchUsers = async (queryString) => {
    if (queryString.trim() === "") {
      setUsers([]); // If search query is empty, reset the users list
      return;
    }

    const usersRef = collection(db, "Users");
    // Construct query for case-insensitive search by email
    const q = query(
      usersRef,
      where("email", ">=", queryString),  // Start query from queryString
      where("email", "<=", queryString + "\uf8ff") // End query with a wildcard character
    );

    const querySnapshot = await getDocs(q);
    const usersList = querySnapshot.docs.map((doc) => doc.data());
    setUsers(usersList);
  };

  // Trigger search on input change
  const handleSearchChange = (e) => {
    const queryString = e.target.value;
    setSearchQuery(queryString);
    fetchUsers(queryString); // Fetch filtered users based on the search input
  };

  // Fetch the logged-in user's friends from Firestore
  const fetchFriends = async () => {
    const auth = getAuth();
    const user = auth.currentUser;
  
    if (user) {
      setLoggedInUserUid(user.uid); // Set logged-in user UID
      try {
        // Correct syntax to get a document by its ID in the latest Firebase version
        const userRef = doc(db, "Users", user.uid);
        const userDoc = await getDoc(userRef);
  
        if (userDoc.exists()) {
          setFriends(userDoc.data().friends || []); // Set friends from Firestore or empty array
          console.log("Fetched friends:", userDoc.data().friends);
        } else {
          console.log("No user document found!");
        }
      } catch (error) {
        console.error("Error fetching friends:", error);
      }
    }
  };

  // Handle adding a friend
  const handleAddFriend = async (email) => {
    if (!loggedInUserUid) return;

    // Check if the user already added the friend
    if (!friends.includes(email)) {
      try {
        // Update the current user's friends list in Firestore
        const userRef = doc(db, "Users", loggedInUserUid);
        await updateDoc(userRef, {
          friends: arrayUnion(email), // Add email to the friends array
        });

        // Add the logged-in user's email to the friend's friend list
        const friendRef = doc(db, "Users", email);
        await updateDoc(friendRef, {
          friends: arrayUnion(loggedInUserUid), // Add logged-in user to the friend's array
        });

        // Update local state to reflect the change
        setFriends((prevFriends) => [...prevFriends, email]);
        console.log("Friend added successfully!");
      } catch (error) {
        console.error("Error adding friend:", error);
      }
    }
  };

  // Fetch friends on component mount or when user logs in
  useEffect(() => {
    fetchFriends();
  }, []);

  return (
    <div className="flex flex-col items-center p-4">
      <h1 className="text-2xl font-bold text-white mb-4">Tivo Social</h1>

      {/* Search Bar */}
      <input
        type="text"
        placeholder="Search by email"
        value={searchQuery}
        onChange={handleSearchChange}
        className="p-2 border-2 border-gray-300 rounded-lg mb-4"
      />

      {/* List of Filtered Users */}
      <div className="w-full">
        {users.length > 0 ? (
          users.map((user) => (
            <div key={user.uid} className="flex justify-between items-center p-2 border-b border-gray-300">
              <span className="text-white">{user.email}</span>
              <button
                onClick={() => handleAddFriend(user.email)}
                className="px-4 py-2 bg-blue-500 text-white rounded-md"
              >
                Add Friend
              </button>
            </div>
          ))
        ) : (
          <p className="text-white">No users found.</p>
        )}
      </div>

      {/* Friend List */}
      {/* <UsersList></UsersList> */}
      <div className="mt-6 w-full">
        <h2 className="text-xl font-semibold text-white mb-4">Friends List</h2>
        {friends.length > 0 ? (
          friends.map((friend, index) => (
            <div key={index} className="flex justify-between items-center p-2 border-b border-gray-300">
              <span className="text-white">{friend}</span>
            </div>
          ))
        ) : (
          <p className="text-white">No friends added yet.</p>
        )}
      </div>
    </div>
  );
};

export default Tivosocial;
