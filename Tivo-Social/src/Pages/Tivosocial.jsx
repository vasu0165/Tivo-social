import React, { useState, useEffect } from "react";
import { db } from "../Firebase/FirebaseConfig";
import { collection, query, where, getDocs, getDoc, updateDoc, doc, arrayUnion ,  arrayRemove} from "firebase/firestore";
import { getAuth } from "firebase/auth";

const Tivosocial = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [users, setUsers] = useState([]);
  const [friends, setFriends] = useState([]);
  const [loggedInUserUid, setLoggedInUserUid] = useState(null);

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
    const usersList = querySnapshot.docs.map((doc) => doc.data());
    setUsers(usersList);
  };

  const handleSearchChange = (e) => {
    const queryString = e.target.value;
    setSearchQuery(queryString);
    fetchUsers(queryString);
  };

  const fetchFriends = async () => {
    const auth = getAuth();
    const user = auth.currentUser;

    if (user) {
      setLoggedInUserUid(user.uid);
      try {
        const userRef = doc(db, "Users", user.uid);
        const userDoc = await getDoc(userRef);

        if (userDoc.exists()) {
          setFriends(userDoc.data().friends || []);
        } else {
          console.log("No user document found!");
        }
      } catch (error) {
        console.error("Error fetching friends:", error);
      }
    }
  };
  const handleRemoveFriend = async (friendEmail) => {
    if (!loggedInUserUid) return;
  
    try {
      const userRef = doc(db, "Users", loggedInUserUid);
      await updateDoc(userRef, {
        friends: arrayRemove(friendEmail), // Remove the friend from the user's friends array
      });
  
      const friendRef = doc(db, "Users", friendEmail);
      fetchFriends();
      await updateDoc(friendRef, {
        friends: arrayRemove(loggedInUserUid), // Remove the logged-in user from the friend's list
      });
      setFriends((prevFriends) => prevFriends.filter((friend) => friend !== friendEmail)); // Update local state
      console.log("Friend removed successfully!");
    } catch (error) {
      console.error("Error removing friend:", error);
    }
  };
  
  const handleAddFriend = async (email) => {
    if (!loggedInUserUid) return;

    if (!friends.includes(email)) {
      try {
        const userRef = doc(db, "Users", loggedInUserUid);
        await updateDoc(userRef, {
          friends: arrayUnion(email),
        });
        fetchFriends();

        const friendRef = doc(db, "Users", email);
        await updateDoc(friendRef, {
          friends: arrayUnion(loggedInUserUid),
        });

        setFriends((prevFriends) => [...prevFriends, email]);
      } catch (error) {
        console.error("Error adding friend:", error);
      }
    }
  };

  useEffect(() => {
    fetchFriends();
  }, []);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-900 via-purple-800 to-gray-900">
      <div className="w-full max-w-lg p-6 bg-white rounded-lg shadow-lg">
        <h1 className="text-2xl font-bold text-center text-gray-800 mb-6">TiVo Social</h1>

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
                  onClick={() => handleAddFriend(user.email)}
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

  {friends.length > 0 ? (
    friends.map((friend, index) => (
      <div
        key={index}
        className="flex justify-between items-center p-4 mb-3 bg-gray-50 rounded-lg shadow-sm hover:bg-gray-100 transition duration-300"
      >
        {/* Display only the part of the email before "@" */}
        <span className="text-lg font-medium text-gray-800">{friend.split('@')[0]}</span>

        <button
          onClick={() => handleRemoveFriend(friend)}
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
