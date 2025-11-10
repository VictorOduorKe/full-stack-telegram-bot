import { useNavigate } from "react-router-dom";
import { useContext } from "react";
import { UserContext } from "../context/UserContext";
import api from "../services/api/api";
import { toast } from "react-toastify";
import { useEffect,useState } from "react";

const NavBar = () => {
  const navigate = useNavigate();
  const { user, setUser } = useContext(UserContext);

  const handleLogout = async () => {
    try {
      const response = await api("/api/users/logout", "POST", null, { withCredentials: true });
      toast.success(response.message || "Logged out successfully");
      localStorage.removeItem("user");
      setUser(null);
      navigate("/login");
    } catch (error) {
      console.error("Logout failed:", error);
      toast.error(error.response?.message || "Logout failed");
    }
  };

  return (
    <header className="bg-black text-white flex justify-between gap-1.5 p-4">
      <h1 className="text-white p-2 font-bold">Telegram Bot Cleaner</h1>
      <nav>
        <ul className="flex justify-around p-2 text-white gap-4 items-center">
          {!user ? (
            <>
              <li onClick={() => navigate("/login")} className="text-white hover:text-blue-600 font-extrabold cursor-pointer">
                Login
              </li>
              <li onClick={() => navigate("/register")} className="text-white hover:text-blue-600 font-extrabold cursor-pointer">
                Register
              </li>
            </>
          ) : (
            <>
              <li className="text-white font-extrabold">{user.name}</li>
              <li
                onClick={handleLogout}
                className="text-white rounded-3xl bg-red-600 px-4 py-2 hover:bg-red-700 font-extrabold cursor-pointer"
              >
                Logout
              </li>
            </>
          )}
        </ul>
      </nav>
    </header>
  );
};

export default NavBar;
