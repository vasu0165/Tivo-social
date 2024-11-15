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

  useEffect(() => {
    getDoc(doc(db, "WatchedMovies", User.uid)).then((result) => {
      if (result.exists()) {
        const mv = result.data();
        setWatchedMovies(mv.movies);
      }
    });
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
