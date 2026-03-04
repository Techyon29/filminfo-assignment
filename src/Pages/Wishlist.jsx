import { useContext } from "react";
import Navbar from "../Components/Navbar";
import { MovieContext } from "../context/movieContext";
import { useNavigate } from "react-router-dom";

const Wishlist = () => {
  const { wishlist, removeFromWishlist } = useContext(MovieContext);
  const navigate = useNavigate();

  return (
    <div className="w-full min-h-screen bg-background">
      <Navbar />
      <div className="mx-10 md:mx-20 mt-20">
        <h1 className="text-3xl md:text-5xl font-semibold pl-5 border-l-4 border-btn">
          Wishlist
        </h1>
        <div className="mt-10 pb-10">
          {wishlist.map((movie) => (
            <div
              key={movie.id}
              className="px-2 py-3 bg-background_secondary flex max-sm:flex-col gap-4 rounded-xl mb-10"
            >
              {movie.poster && (
                <img
                  src={movie.poster}
                  alt={movie.title}
                  className="max-w-50 max-sm:m-auto"
                />
              )}
              <div className="flex flex-col gap-2">
                <span className="text-4xl font-semibold">{movie.title}</span>
                <span className="text-sm text-secondary">{movie.year}</span>
                {movie.plot && (
                  <>
                    <h3 className="text-2xl font-semibold">Plot</h3>
                    <p className="text-md text-secondary max-w-2xl">
                      {movie.plot}
                    </p>
                  </>
                )}
                <div className="mt-10">
                  <button
                    className="border border-green-500 px-4 py-2 rounded-full cursor-pointer hover:bg-green-500 mr-2"
                    onClick={() => navigate(`/${movie.id}`)}
                  >
                    View Details
                  </button>
                  <button
                    className="border border-red-500 px-4 py-2 rounded-full cursor-pointer hover:bg-red-500"
                    onClick={() => removeFromWishlist(movie.id)}
                  >
                    Remove
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
        {wishlist.length === 0 && (
          <div className="text-4xl text-center text-secondary">
            No movies in your Wishlist
          </div>
        )}
      </div>
    </div>
  );
};

export default Wishlist;
