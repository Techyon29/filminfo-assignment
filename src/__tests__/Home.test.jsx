import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Home from "../Pages/Home";
import { MovieProvider } from "../context/movieContext";

const renderHome = () =>
  render(
    <MemoryRouter>
      <MovieProvider>
        <Home />
      </MovieProvider>
    </MemoryRouter>
  );

describe("Home Page", () => {
  it("renders the title", () => {
    renderHome();
    expect(screen.getByText("AI")).toBeInTheDocument();
    expect(screen.getByText("Insight Builder")).toBeInTheDocument();
  });

  it("renders search input with correct placeholder", () => {
    renderHome();
    const input = screen.getByPlaceholderText("e.g., tt0133093");
    expect(input).toBeInTheDocument();
  });

  it("shows validation error for empty input", () => {
    renderHome();
    const button = screen.getByText("Search");
    fireEvent.click(button);
    expect(screen.getByText("Please enter an IMDb ID.")).toBeInTheDocument();
  });

  it("shows validation error for invalid IMDb ID format", () => {
    renderHome();
    const input = screen.getByPlaceholderText("e.g., tt0133093");
    fireEvent.change(input, { target: { value: "hello123" } });
    fireEvent.click(screen.getByText("Search"));
    expect(
      screen.getByText(/Invalid format. IMDb IDs start with/)
    ).toBeInTheDocument();
  });

  it("clears validation error when typing", () => {
    renderHome();
    const input = screen.getByPlaceholderText("e.g., tt0133093");
    fireEvent.click(screen.getByText("Search"));
    expect(screen.getByText("Please enter an IMDb ID.")).toBeInTheDocument();

    fireEvent.change(input, { target: { value: "t" } });
    expect(screen.queryByText("Please enter an IMDb ID.")).not.toBeInTheDocument();
  });
});
