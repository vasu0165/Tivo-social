import React, { useEffect, useState, useContext } from "react";
import Banner from "../componets/Banner/Banner";
import Footer from "../componets/Footer/Footer";
import RowPost from "../componets/RowPost/RowPost";
import {
  originals,
  trending,
  comedy,
  horror,
  Adventure,
  SciFi,
  Animated,
  War,
  trendingSeries,
  UpcomingMovies,
} from "../Constants/URLs";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../Firebase/FirebaseConfig";
import { AuthContext } from "../Context/UserContext";
import ProductionHouse from "../componets/ProductionHouse";

function Home() {
  const { User } = useContext(AuthContext);
  const [watchedMovies, setWatchedMovies] = useState([]);
  const [reMovies, setReMovies] = useState([]);
  const [friendUIDs, setFriendUIDs] = useState([]);

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
  const fetchAndStoreRecommendedMovies = async () => {
    if (!loggedInUserUid || friendUIDs.length === 0) return;
  
    try {
      // Reset the recommended movies array before fetching new data
      let newRecommendedMovies = [];
  
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

  useEffect(() => {
    getDoc(doc(db, "WatchedMovies", User.uid)).then((result) => {
      if (result.exists()) {
        const mv = result.data();
        setWatchedMovies(mv.movies);
      }
    });
    fetchAndStoreRecommendedMovies();
  }, [User.uid]);

  useEffect(() => {
    getDoc(doc(db, "Recommended", User.uid)).then((result) => {
      if (result.exists()) {
        const mv = result.data();
        setReMovies(mv.movies);
      }
    });
  }, [User.uid]);

  return (
    <div>
      <Banner url={trending}></Banner>
      <div className="div pb-20 pt-10">
        <ProductionHouse></ProductionHouse>
      </div>
      <div className="w-[99%] ml-1 pt-20">
        <RowPost first title="Trending" url={trending} key={trending}></RowPost>
        <RowPost title="Animated" url={Animated} key={Animated}></RowPost>
        {watchedMovies.length !== 0 ? (
          <RowPost
            title="Watched Movies"
            movieData={watchedMovies.slice().reverse()} // Use slice() to avoid mutating the state
            key={"Watched Movies"}
          ></RowPost>
        ) : null}
        {reMovies.length !== 0 ? (
          <RowPost
            title="Follow your Friends"
            movieData={reMovies.slice().reverse()} // Use slice() to avoid mutating the state
            key={"Follow your Friends"}
          ></RowPost>
        ) : null}
        <RowPost
          title="Netflix Originals"
          islarge
          url={originals}
          key={originals}
        ></RowPost>
        <RowPost
          title="Trending Series"
          url={trendingSeries}
          key={trendingSeries}
        ></RowPost>
        <RowPost title="Science Fiction" url={SciFi}></RowPost>
        <RowPost title="Now on Prime" url={UpcomingMovies}></RowPost>
        <RowPost title="Hotstar Originals" url={comedy}></RowPost>
        <RowPost title="Adventure" url={Adventure}></RowPost>
        <RowPost title="Horror" url={horror}></RowPost>
        <RowPost title="War" url={War}></RowPost>
      </div>
      <Footer></Footer>
    </div>
  );
}

export default Home;
