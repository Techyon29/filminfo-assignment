import { useState } from "react";
import Navbar from "../Components/Navbar";
import { useNavigate } from "react-router-dom";
import { motion } from "motion/react";

const IMDB_ID_REGEX = /^tt\d{7,}$/;

const Home = () => {
  const [search, setSearch] = useState("");
  const [validationError, setValidationError] = useState("");
  const navigate = useNavigate();

  const handleSearch = () => {
    const trimmed = search.trim();
    if (!trimmed) {
      setValidationError("Please enter an IMDb ID.");
      return;
    }
    if (!IMDB_ID_REGEX.test(trimmed)) {
      setValidationError('Invalid format. IMDb IDs start with "tt" followed by numbers (e.g., tt0133093).');
      return;
    }
    setValidationError("");
    navigate(`/${trimmed}`);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleSearch();
  };

  return (
    <div className="w-full h-screen min-h-fit bg-background">
      <Navbar />
      <div className="flex mt-20 md:mt-20 md:pt-20 flex-col items-center mx-10 md:mx-22 p-4 gap-7 relative z-10">
        <h1 className="text-4xl md:text-6xl font-semibold text-center">
          <span className="text-btn">AI</span> Movie{" "}
          <span className="bg-linear-to-r from-btn to-primary bg-clip-text text-transparent">
            Insight Builder
          </span>
        </h1>
        <h3 className="text-sm sm:text-md text-center text-secondary">
          Enter an IMDb movie ID to get title, cast, plot, rating — and AI-
          <br className="hidden md:block" />
          powered audience sentiment analysis
        </h3>
        <div className="mt-10 max-w-lg max-sm:mx-10 flex rounded-full bg-background_secondary">
          <input
            type="text"
            className="bg-background_secondary md:px-4 md:py-2.5 px-3 py-1.5 max-w-full md:min-w-sm rounded-full border-gray-500 md:text-xl text-md"
            placeholder="e.g., tt0133093"
            onChange={(e) => {
              setSearch(e.target.value);
              setValidationError("");
            }}
            onKeyDown={handleKeyDown}
            value={search}
          />
          <button
            className="bg-btn hover:scale-105 duration-200 ease-in-out px-3 py-1.5 cursor-pointer rounded-full"
            onClick={handleSearch}
          >
            Search
          </button>
        </div>
        {validationError && (
          <p className="text-red-400 text-sm mt-2">{validationError}</p>
        )}
      </div>
      <motion.div
        className="w-20 h-20 bg-btn rounded-full absolute bottom-10 left-1/2 -translate-x-1/2"
        initial={{ y: 0 }}
        animate={{ y: [-100, 0, -50, 0, -25, 0, -15, 0, -7.5, 0] }}
        transition={{ duration: 15, repeat: Infinity }}
      />
      <div className="w-70 h-70 bg-btn rounded-full absolute md:block bottom-50 -left-25 hidden" />
    </div>
  );
};

export default Home;
