import React, { useState, useEffect } from 'react';
import VideoPlayer from './VideoPlayer';
import ChatBox from './ChatBox';
import { useAuth } from '../context/AuthContext'; // Assuming you have this for user state
import { useParams } from 'react-router-dom';
import { database } from '../services/firebase'; // Firebase service for real-time DB

const WatchParty = () => {
  const { user } = useAuth();  // Get user from AuthContext
  const { partyId } = useParams(); // Get party ID from URL params
  const [videoTime, setVideoTime] = useState(0);

  useEffect(() => {
    if (user) {
      // Set up Firebase listener for video time sync
      const videoTimeRef = database.ref(`parties/${partyId}/videoTime`);
      videoTimeRef.on('value', snapshot => {
        const currentTime = snapshot.val();
        if (currentTime !== null) {
          setVideoTime(currentTime);
        }
      });

      // Clean up listener on unmount
      return () => {
        videoTimeRef.off();
      };
    }
  }, [user, partyId]);

  return (
    <div className="watch-party">
      <h1>Watch Party - {partyId}</h1>
      {user ? (
        <>
          <VideoPlayer setVideoTime={setVideoTime} videoTime={videoTime} partyId={partyId} />
          <ChatBox partyId={partyId} />
        </>
      ) : (
        <p>Please log in to join the Watch Party.</p>
      )}
    </div>
  );
};

export default WatchParty;
