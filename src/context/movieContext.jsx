import { createContext, useState, useEffect, useRef } from "react";

export const MovieContext = createContext(null);

export const MovieProvider = ({ children }) => {
  const [wishlist, setWishlist] = useState(() => {
    // Initialize from localStorage to avoid race condition
    try {
      const stored = localStorage.getItem("wishlist");
      return stored ? JSON.parse(stored) : [];
    } catch {
      localStorage.removeItem("wishlist");
      return [];
    }
  });

  const isInitialized = useRef(false);

  // Save to localStorage only after initial load
  useEffect(() => {
    if (!isInitialized.current) {
      isInitialized.current = true;
      return;
    }
    localStorage.setItem("wishlist", JSON.stringify(wishlist));
  }, [wishlist]);

  const addToWishlist = (movie) => {
    if (!movie) return;

    setWishlist((prev) => {
      const movieId = movie.id || movie.imdbID;
      if (prev.some((item) => item.id === movieId)) return prev;

      return [
        ...prev,
        {
          id: movieId,
          title: movie.primaryTitle || movie.title,
          year: movie.startYear || movie.year,
          poster: movie.primaryImage?.url || "",
          plot: movie.plot || "",
        },
      ];
    });
  };

  const removeFromWishlist = (movieId) => {
    setWishlist((prev) => prev.filter((item) => item.id !== movieId));
  };

  return (
    <MovieContext.Provider
      value={{ wishlist, addToWishlist, removeFromWishlist, wishlistCount: wishlist.length }}
    >
      {children}
    </MovieContext.Provider>
  );
};
