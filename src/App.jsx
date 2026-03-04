import { Route, Routes } from "react-router-dom";
import Home from "./Pages/Home";
import MovieDetail from "./Pages/MovieDetail";
import Wishlist from "./Pages/Wishlist";

const App = () => {
  return (
    <div className="text-primary">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/wishlist" element={<Wishlist />} />
        <Route path="/:id" element={<MovieDetail />} />
      </Routes>
    </div>
  );
};

export default App;
