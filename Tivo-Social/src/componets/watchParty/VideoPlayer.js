import React, { useEffect, useRef } from 'react';
import VideoJS from 'video.js';

const VideoPlayer = ({ setVideoTime, videoTime, partyId }) => {
  const videoRef = useRef(null);

  useEffect(() => {
    const player = VideoJS(videoRef.current, {
      controls: true,
      autoplay: false,
      preload: 'auto',
      sources: [{ src: 'https://path-to-your-video.mp4', type: 'video/mp4' }]
    });

    player.on('timeupdate', () => {
      const currentTime = player.currentTime();
      setVideoTime(currentTime);
      // Sync with Firebase
      database.ref(`parties/${partyId}/videoTime`).set(currentTime);
    });

    return () => player.dispose();
  }, [partyId, setVideoTime]);

  return <video ref={videoRef} className="video-js vjs-default-skin" />;
};

export default VideoPlayer;
