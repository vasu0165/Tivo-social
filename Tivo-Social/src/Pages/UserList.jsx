import React, { useEffect, useState, useContext } from "react";
import { db } from "../Firebase/FirebaseConfig";
import { AuthContext } from "../Context/UserContext";
import { collection, query, where, getDocs } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";

function UserList() {
  const { User } = useContext(AuthContext);
  const [friendsList, setFriendsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Fetching the friends of the current user
  useEffect(() => {
    if (User) {
      const fetchFriends = async () => {
        try {
          // Assuming you have a Friends collection that stores the friendships
          const friendsRef = collection(db, "Friends");
          const q = query(friendsRef, where("userId", "==", User.uid));
          const querySnapshot = await getDocs(q);

          const friendsArray = [];
          querySnapshot.forEach((doc) => {
            friendsArray.push(doc.data().friendId);
          });

          // Get the friend details (e.g., name, email)
          const friendsDetails = await Promise.all(
            friendsArray.map(async (friendId) => {
              const userDoc = await getDocs(
                query(collection(db, "Users"), where("uid", "==", friendId))
              );
              let friendData = {};
              userDoc.forEach((doc) => {
                friendData = doc.data();
              });
              return friendData;
            })
          );

          setFriendsList(friendsDetails);
        } catch (error) {
          toast.error("Error fetching friends: " + error.message);
        } finally {
          setLoading(false);
        }
      };

      fetchFriends();
    }
  }, [User]);

  const handleProfileClick = (friendId) => {
    // Navigate to the selected friend's profile page or perform any action
    navigate(`/profile/${friendId}`);
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <Toaster />
      <h1 className="text-2xl font-bold text-center mb-4">Your Friends</h1>

      {loading ? (
        <div className="text-center">Loading friends...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {friendsList.length > 0 ? (
            friendsList.map((friend, index) => (
              <div
                key={index}
                className="bg-gray-800 p-4 rounded-lg flex items-center cursor-pointer"
                onClick={() => handleProfileClick(friend.uid)}
              >
                <img
                  src={friend.photoURL || "https://www.w3schools.com/howto/img_avatar.png"}
                  alt={friend.displayName}
                  className="w-16 h-16 rounded-full mr-4"
                />
                <div>
                  <h2 className="text-xl text-white">{friend.displayName}</h2>
                  <p className="text-sm text-gray-400">{friend.email}</p>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center text-white">No friends found</div>
          )}
        </div>
      )}
    </div>
  );
}

export default UserList;
