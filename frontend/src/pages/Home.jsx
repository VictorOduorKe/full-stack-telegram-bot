import NavBar from "../components/Navbar";
import { UserContext } from "../context/UserContext";
import { useContext } from "react";
import { UserDashboard } from "./user/UserDasboard";
import { useNavigate } from "react-router-dom";

const Home = () => {
  const navigate = useNavigate();
  const { user } = useContext(UserContext);

  return (
    <div className="bg-gray-800 min-h-screen text-white">
      <NavBar />

      {user ? (
        <UserDashboard />
      ) : (
        <div className="flex flex-col items-center justify-center gap-12 py-12 px-4">
          {/* Hero / Welcome Section */}
          <div className="flex flex-col items-center gap-4 text-center">
            <h1 className="text-4xl font-bold">Welcome to Telegram Bot Cleaner</h1>
            <p className="max-w-xl">
              This app is designed to delete the annoying messages from Telegram such as "User joined Telegram" with just a few simple steps.
            </p>
            <span
              onClick={() => navigate("/login")}
              className="cursor-pointer bg-blue-600 hover:bg-blue-700 transition-colors px-6 py-2 rounded-xl font-semibold"
            >
              Get Started
            </span>
          </div>

          {/* About Section */}
          <section className="max-w-4xl text-center bg-gray-700 rounded-xl p-8 shadow-md">
            <h2 className="text-3xl font-bold mb-4">About</h2>
            <p>
              Telegram Bot Cleaner is a simple yet powerful tool that helps you clean up unnecessary notifications in your Telegram groups and channels. 
              This app is designed to delete the annoying messages from Telegram like "User joined Telegram" with just a few simple steps, making your chat experience cleaner and more organized.
            </p>
          </section>

          {/* Contact Section */}
          <section className="max-w-4xl text-center bg-gray-700 rounded-xl p-8 shadow-md">
            <h2 className="text-3xl font-bold mb-4">Contact</h2>
            <p>If you have any questions or feedback, feel free to reach out:</p>
            <ul className="mt-4 space-y-2">
              <li>Email: <a href="mailto:support@telegrambotcleaner.com" className="text-blue-400 hover:underline">support@telegrambotcleaner.com</a></li>
              <li>Twitter: <a href="https://twitter.com/telegrambotcleaner" target="_blank" className="text-blue-400 hover:underline">twitter.com/telegrambotcleaner</a></li>
            </ul>
          </section>
        </div>
      )}
    </div>
  );
};

export default Home;
