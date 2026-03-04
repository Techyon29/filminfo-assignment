import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FiSearch } from "react-icons/fi";

const Navbar = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");

  const handleSearch = () => {
    if (search.trim()) {
      navigate("/" + search.trim());
      setSearch("");
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleSearch();
  };

  return (
    <div className="flex pt-7 pb-4 mx-7 md:mx-22 justify-end gap-4">
      <h1
        className="cursor-pointer text-2xl md:text-4xl font-semibold bg-linear-to-r from-primary to-btn bg-clip-text text-transparent mr-auto"
        onClick={() => navigate("/")}
      >
        <span>Film</span>
        <span>Info</span>
      </h1>
      <span
        className="text-md text-secondary hover:text-white transition-all duration-200 ease-in-out cursor-pointer my-auto"
        onClick={() => navigate("/wishlist")}
      >
        Wishlist
      </span>
      {id && (
        <div className="bg-background_secondary rounded-full inline-flex items-center max-sm:hidden">
          <input
            type="text"
            placeholder="Search by IMDb ID"
            className="bg-background_secondary px-4 py-1.5 max-sm:px-2 rounded-full"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <button
            className="bg-btn rounded-full py-2 px-2 cursor-pointer"
            onClick={handleSearch}
          >
            <FiSearch />
          </button>
        </div>
      )}
    </div>
  );
};

export default Navbar;
