import { useContext, useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import Navbar from "../Components/Navbar";
import { easeInOut, motion } from "motion/react";
import OpenAI from "openai";
import axios from "axios";
import { MovieContext } from "../context/movieContext";

// Lazy-initialized AI client singleton
let aiClient = null;
const getAiClient = () => {
  if (!aiClient) {
    aiClient = new OpenAI({
      apiKey: import.meta.env.VITE_AI_API_KEY,
      baseURL: "https://api.groq.com/openai/v1",
      dangerouslyAllowBrowser: true,
    });
  }
  return aiClient;
};

const MovieDetail = () => {
  const { id } = useParams();
  const [movieDetail, setMovieDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const { addToWishlist, wishlist } = useContext(MovieContext);

  const [summary, setSummary] = useState("");
  const [positiveReview, setPositiveReview] = useState(0);
  const [negativeReview, setNegativeReview] = useState(0);
  const [neutralReview, setNeutralReview] = useState(0);
  const [reviewCount, setReviewCount] = useState(0);
  const [aiLoading, setAiLoading] = useState(true);
  const [error, setError] = useState(null);

  const isMovieInList = useMemo(
    () => wishlist.some((item) => item.id === movieDetail?.id),
    [wishlist, movieDetail]
  );


  const getData = async (signal) => {
    try {
      setError(null);
      const response = await axios.get(
        `https://api.imdbapi.dev/titles/${id}`,
        { signal }
      );
      if (response.status === 200) {
        const movieData = response.data;
        if (!movieData || !movieData.primaryTitle) {
          setError("Movie not found.");
          return;
        }
        setMovieDetail(movieData);

        // Fetch TMDB reviews
        const tmdbFind = await axios.get(
          `https://api.themoviedb.org/3/find/${id}?api_key=${import.meta.env.VITE_API_Key}&external_source=imdb_id&language=en-US`,
          { signal }
        );
        const tmdbMovie = tmdbFind.data.movie_results?.[0];
        if (!tmdbMovie) {
          setAiLoading(false);
          return;
        }

        const reviewsRes = await axios.get(
          `https://api.themoviedb.org/3/movie/${tmdbMovie.id}/reviews?api_key=${import.meta.env.VITE_API_Key}&page=1`,
          { signal }
        );
        const reviews = reviewsRes.data.results || [];
        setReviewCount(reviews.length);
        getSummaryReview(reviews, signal);
      }
    } catch (e) {
      if (axios.isCancel(e)) return; // Ignore aborted requests
      console.error("Failed to fetch movie data:", e);
      setError("Failed to fetch movie details. Please check the IMDb ID.");
    } finally {
      setLoading(false);
    }
  };

  const getSummaryReview = async (reviews, signal) => {
    try {
      if (!reviews || reviews.length === 0) {
        setAiLoading(false);
        return;
      }
      if (signal?.aborted) return;

      const reviewTexts = reviews.map((r) => r.content);
      const response = await getAiClient().chat.completions.create({
        model: "llama-3.3-70b-versatile",
        messages: [
          {
            role: "system",
            content: "You are a movie review analyst. Return ONLY valid JSON.",
          },
          {
            role: "user",
            content: `Here are recent audience reviews:\n${JSON.stringify(reviewTexts)}\n\nTasks:\n1. Write a concise 2-4 sentence summary of what people are saying.\n2. Estimate percentage: Positive / Negative / Neutral (must sum to 100%).\n3. Return ONLY valid JSON: {"summary": "string", "positive_percent": number, "negative_percent": number, "neutral_percent": number}`,
          },
        ],
        temperature: 0.3,
      });

      if (signal?.aborted) return;

      const raw = response.choices?.[0]?.message?.content;
      if (!raw) return;

      const jsonMatch = raw.match(/\{[\s\S]*\}/);
      if (!jsonMatch) return;

      const parsed = JSON.parse(jsonMatch[0]);
      setSummary(parsed.summary);
      setPositiveReview(parsed.positive_percent);
      setNegativeReview(parsed.negative_percent);
      setNeutralReview(parsed.neutral_percent);
    } catch (e) {
      if (signal?.aborted) return;
      console.error("AI analysis failed:", e);
    } finally {
      setAiLoading(false);
    }
  };

  const handleAddWishList = () => {
    if (!isMovieInList && movieDetail) {
      addToWishlist(movieDetail);
    }
  };

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setAiLoading(true);
    setSummary("");
    setPositiveReview(0);
    setNegativeReview(0);
    setNeutralReview(0);
    setReviewCount(0);
    getData(controller.signal);

    return () => controller.abort();
  }, [id]);


  // Derive overall sentiment label from percentages
  const getSentimentLabel = () => {
    if (positiveReview >= 60) return { label: "Positive", color: "text-green-500" };
    if (negativeReview >= 60) return { label: "Negative", color: "text-red-500" };
    return { label: "Mixed", color: "text-amber-400" };
  };

  if (loading) {
    return (
      <div className="w-full min-h-screen bg-background">
        <motion.div
          animate={{ scale: [1, 1.25, 1.5, 1.75, 2, 1.75, 1.5, 1.25, 1] }}
          transition={{ duration: 3, repeat: Infinity, ease: easeInOut }}
          className="top-1/2 left-1/2 absolute -translate-x-1/2 -translate-y-1/2 w-20 h-20 border-4 border-btn rounded-full"
        />
      </div>
    );
  }

  if (!movieDetail) {
    return (
      <div className="w-full h-screen bg-background">
        <Navbar />
        <div className="mt-20">
          <h1 className="md:text-6xl text-center font-semibold text-2xl">
            {error || "404 Not Found"}
          </h1>
          <p className="text-center text-secondary mt-4">
            Please check the IMDb ID and try again (e.g., tt0133093)
          </p>
        </div>
      </div>
    );
  }

  const sentiment = getSentimentLabel();

  return (
    <div className="w-full min-h-screen bg-background">
      <Navbar />
      <div>
        <div className="mx-10 md:mx-20 md:mt-20 mt-10 py-4 px-4 bg-background_secondary rounded-2xl">
          <div className="flex justify-between max-sm:flex-col">
            <div>
              <h1 className="text-4xl font-semibold mb-2">
                {movieDetail.primaryTitle}
              </h1>
              <div className="mb-5">
                <span className="text-md text-secondary">
                  {movieDetail.startYear}
                </span>
              </div>
            </div>
            <div className="mb-4 flex items-center gap-5">
              <div
                className={`border border-gray-400 px-4 py-1.5 rounded-full cursor-pointer backdrop-blur-2xl ${
                  isMovieInList
                    ? "bg-amber-500"
                    : "bg-transparent hover:bg-[#fff5]"
                }`}
                onClick={handleAddWishList}
              >
                {isMovieInList ? "In Wishlist" : "Add to Wishlist"}
              </div>
              {movieDetail.rating?.aggregateRating && (
                <div>
                  <h2 className="text-xl mr-10 mt-5 mb-2">RATING</h2>
                  <span className="hover:bg-[#fff3] px-3 py-1.5 pt-3 rounded-full backdrop-blur-2xl cursor-pointer text-center">
                    <span className="text-2xl font-medium text-amber-500">
                      {movieDetail.rating.aggregateRating}
                    </span>{" "}
                    <span className="text-secondary">/ 10</span>
                  </span>
                </div>
              )}
            </div>
          </div>
          <div className="flex gap-10 max-md:flex-col">
            {movieDetail.primaryImage?.url && (
              <img
                src={movieDetail.primaryImage.url}
                alt={movieDetail.primaryTitle}
                className="w-60 max-sm:m-auto"
              />
            )}
            <div>
              {movieDetail.genres?.length > 0 && (
                <div>
                  <h3 className="text-xl mb-2 font-semibold">Genre</h3>
                  <div className="mb-5 flex flex-wrap">
                    {movieDetail.genres.map((genre, i) => (
                      <span
                        key={i}
                        className="border border-gray-400 px-2 py-1 rounded-full text-sm mr-3 mb-2 hover:bg-[#fff3]"
                      >
                        {genre}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {movieDetail.plot && (
                <>
                  <h3 className="text-xl mb-4 font-semibold">Plot</h3>
                  <p className="text-sm text-secondary max-w-xl mb-5">
                    {movieDetail.plot}
                  </p>
                </>
              )}
              {movieDetail.directors?.length > 0 && (
                <>
                  <h3 className="text-xl mb-2 font-semibold">Directors</h3>
                  <div className="mb-4">
                    {movieDetail.directors.map((dir, i) => (
                      <span key={i} className="text-sm text-secondary mr-3">
                        {dir.displayName}
                      </span>
                    ))}
                  </div>
                </>
              )}
              {movieDetail.writers?.length > 0 && (
                <>
                  <h3 className="text-xl mb-2 font-semibold">Writers</h3>
                  <div>
                    {movieDetail.writers.map((writer, i) => (
                      <span key={i} className="text-sm text-secondary mr-3">
                        {writer.displayName}
                      </span>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* AI Audience Sentiment */}
        <div className="mx-10 md:mx-20 md:mt-20 mt-10 pb-10">
          <h2 className="text-4xl font-semibold pl-5 border-l-4 border-btn mb-10">
            AI Audience Sentiment
          </h2>
          {aiLoading && (
            <div className="w-full h-50 flex justify-center items-center">
              <motion.div
                animate={{
                  scale: [1, 1.25, 1.5, 1.75, 2, 1.75, 1.5, 1.25, 1],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: easeInOut,
                }}
                className="w-20 h-20 border-4 border-btn rounded-full"
              />
            </div>
          )}
          {!aiLoading && (
            <div>
              {summary ? (
                <p className="text-md max-w-5xl text-secondary mb-5">
                  {summary}
                </p>
              ) : (
                <p className="text-md max-w-5xl text-secondary mb-5">
                  No reviews available for AI analysis.
                </p>
              )}
              {/* Overall Sentiment Classification */}
              {summary && (
                <div className="mb-6">
                  <span className="text-secondary text-sm">Overall: </span>
                  <span className={`text-2xl font-bold ${sentiment.color}`}>
                    {sentiment.label}
                  </span>
                </div>
              )}
              <div className="flex gap-10 flex-wrap">
                <div className="px-6 py-4 bg-background_secondary rounded-xl">
                  <div className="text-2xl text-center text-green-500">
                    {positiveReview}%
                  </div>
                  <div className="text-center text-sm text-secondary">
                    Positive
                  </div>
                </div>
                <div className="px-6 py-4 bg-background_secondary rounded-xl">
                  <div className="text-2xl text-center text-red-700">
                    {negativeReview}%
                  </div>
                  <div className="text-center text-sm text-secondary">
                    Negative
                  </div>
                </div>
                <div className="px-6 py-4 bg-background_secondary rounded-xl">
                  <div className="text-2xl text-center text-amber-400">
                    {neutralReview}%
                  </div>
                  <div className="text-center text-sm text-secondary">
                    Neutral
                  </div>
                </div>
                <div className="px-6 py-4 bg-background_secondary rounded-xl">
                  <div className="text-2xl text-center">{reviewCount}</div>
                  <div className="text-center text-sm text-secondary">
                    Reviews
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Cast */}
        {movieDetail.stars?.length > 0 && (
          <div className="mx-10 md:mx-20 md:mt-20 mt-10 pb-10">
            <h2 className="text-4xl font-semibold pl-5 border-l-4 border-btn mb-10">
              Cast
            </h2>
            <div className="grid md:grid-cols-2 gap-10">
              {movieDetail.stars.slice(0, 18).map((actor, i) => (
                <div className="flex items-center gap-4" key={i}>
                  <img
                    src={
                      actor.primaryImage?.url ||
                      "https://www.freeiconspng.com/uploads/profile-icon-9.png"
                    }
                    alt={actor.displayName}
                    className="w-20 h-20 rounded-full object-cover"
                  />
                  <span className="text-xl text-secondary hover:text-white">
                    {actor.displayName}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MovieDetail;
