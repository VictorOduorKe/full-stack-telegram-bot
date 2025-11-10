import { use } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../services/api/api"
import { useState ,useEffect} from "react"
import {toast} from "react-toastify"
const Register = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: ""
    });

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await api("/api/users", "POST", formData, { withCredentials: true });
            toast.success(response.message);
            setLoading(false);
        } catch (error) {
            toast.error(error.message || "Registration failed");
            console.error("Registration failed:", error);
            setLoading(false);
            setTimeout(() => {
                navigate("/register");
            }, 2000);
            return;
        } finally {
            setLoading(false);
        }
        // On successful registration, navigate to login
        if (!loading) {
            navigate("/login");
        }
    };
useEffect(() => {
   document.title = "Register Page";
}, []);
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
            <h2>Register Page</h2>
            <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow-md w-full max-w-sm">
                <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="username">
                        Username
                    </label>
                    <input
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        id="username"
                        name="name"
                        type="text"
                        placeholder="Enter your username"
                        value={formData.name}
                        onChange={handleChange}
                    />
                </div>
                <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">
                        Email
                    </label>
                    <input
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        id="email"
                        name="email"
                        type="email"
                        placeholder="Enter your email"
                        value={formData.email}
                        onChange={handleChange}
                    />
                </div>
                <div className="mb-6">
                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">
                        Password
                    </label>
                    <input
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline"
                        id="password"
                        type="password"
                        placeholder="Enter your password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                    />
                </div>
                <div className="flex items-center justify-between">
                    <button
                        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                        type="submit"
                    >
                       {loading ? "Registering..." : "Register"}
                    </button>
                </div>
                <div className="mt-4 text-center">
                    <a href="/login" className="inline-block align-baseline font-bold text-sm text-blue-500 hover:text-blue-800">
                        Already have an account? Login
                    </a>
                </div>
            </form>
        </div>
    )
}

export default Register