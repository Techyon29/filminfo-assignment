import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, act } from "@testing-library/react";
import { MovieContext, MovieProvider } from "../context/movieContext";
import { useContext } from "react";

// Helper component to access context values
function TestConsumer({ onRender }) {
  const ctx = useContext(MovieContext);
  onRender(ctx);
  return <div data-testid="count">{ctx.wishlistCount}</div>;
}

describe("MovieContext", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("provides initial empty wishlist", () => {
    let contextValue;
    render(
      <MovieProvider>
        <TestConsumer onRender={(ctx) => (contextValue = ctx)} />
      </MovieProvider>
    );
    expect(contextValue.wishlist).toEqual([]);
    expect(contextValue.wishlistCount).toBe(0);
  });

  it("adds a movie to wishlist", () => {
    let contextValue;
    render(
      <MovieProvider>
        <TestConsumer onRender={(ctx) => (contextValue = ctx)} />
      </MovieProvider>
    );

    act(() => {
      contextValue.addToWishlist({
        id: "tt0133093",
        primaryTitle: "The Matrix",
        startYear: 1999,
        primaryImage: { url: "https://example.com/matrix.jpg" },
        plot: "A hacker discovers reality is a simulation.",
      });
    });

    expect(contextValue.wishlist).toHaveLength(1);
    expect(contextValue.wishlist[0].title).toBe("The Matrix");
    expect(contextValue.wishlist[0].id).toBe("tt0133093");
  });

  it("prevents duplicate movies", () => {
    let contextValue;
    render(
      <MovieProvider>
        <TestConsumer onRender={(ctx) => (contextValue = ctx)} />
      </MovieProvider>
    );

    const movie = {
      id: "tt0133093",
      primaryTitle: "The Matrix",
      startYear: 1999,
      plot: "A hacker discovers reality is a simulation.",
    };

    act(() => {
      contextValue.addToWishlist(movie);
    });
    act(() => {
      contextValue.addToWishlist(movie);
    });

    expect(contextValue.wishlist).toHaveLength(1);
  });

  it("removes a movie from wishlist", () => {
    let contextValue;
    render(
      <MovieProvider>
        <TestConsumer onRender={(ctx) => (contextValue = ctx)} />
      </MovieProvider>
    );

    act(() => {
      contextValue.addToWishlist({
        id: "tt0133093",
        primaryTitle: "The Matrix",
        startYear: 1999,
        plot: "",
      });
    });

    expect(contextValue.wishlist).toHaveLength(1);

    act(() => {
      contextValue.removeFromWishlist("tt0133093");
    });

    expect(contextValue.wishlist).toHaveLength(0);
  });

  it("persists wishlist to localStorage", () => {
    let contextValue;
    render(
      <MovieProvider>
        <TestConsumer onRender={(ctx) => (contextValue = ctx)} />
      </MovieProvider>
    );

    act(() => {
      contextValue.addToWishlist({
        id: "tt0133093",
        primaryTitle: "The Matrix",
        startYear: 1999,
        plot: "",
      });
    });

    const stored = JSON.parse(localStorage.getItem("wishlist"));
    expect(stored).toHaveLength(1);
    expect(stored[0].id).toBe("tt0133093");
  });

  it("loads wishlist from localStorage on mount", () => {
    localStorage.setItem(
      "wishlist",
      JSON.stringify([
        { id: "tt0133093", title: "The Matrix", year: 1999, poster: "", plot: "" },
      ])
    );

    let contextValue;
    render(
      <MovieProvider>
        <TestConsumer onRender={(ctx) => (contextValue = ctx)} />
      </MovieProvider>
    );

    expect(contextValue.wishlist).toHaveLength(1);
    expect(contextValue.wishlist[0].title).toBe("The Matrix");
  });

  it("handles corrupted localStorage gracefully", () => {
    localStorage.setItem("wishlist", "not-valid-json");

    let contextValue;
    render(
      <MovieProvider>
        <TestConsumer onRender={(ctx) => (contextValue = ctx)} />
      </MovieProvider>
    );

    expect(contextValue.wishlist).toEqual([]);
  });

  it("ignores null movie input", () => {
    let contextValue;
    render(
      <MovieProvider>
        <TestConsumer onRender={(ctx) => (contextValue = ctx)} />
      </MovieProvider>
    );

    act(() => {
      contextValue.addToWishlist(null);
    });

    expect(contextValue.wishlist).toEqual([]);
  });
});
