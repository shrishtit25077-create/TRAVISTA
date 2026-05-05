import { useState } from "react";
import { login, loginWithGoogle } from "../services/auth";
import { useNavigate, Link } from "react-router-dom";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async () => {
    console.log(email, password);
    setLoading(true);
    try {
      await login(email, password);
      navigate("/");
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      await loginWithGoogle();
      navigate("/");
    } catch (err) {
      alert("Google login failed: " + err.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-white via-gray-50 to-gray-100">
      <div className="bg-white/80 backdrop-blur-xl p-8 rounded-3xl shadow-xl w-80">
        <h2 className="text-2xl font-bold mb-6 text-center">Welcome back</h2>

        <input
          className="w-full mb-3 p-3 border rounded-xl"
          placeholder="Email Address"
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          className="w-full mb-4 p-3 border rounded-xl"
          placeholder="Password"
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          onClick={handleLogin}
          disabled={loading}
          className="w-full bg-teal-500 text-white p-3 rounded-xl hover:scale-[1.02] transition mb-3"
        >
          {loading ? "Logging in..." : "Start Planning"}
        </button>

        <button 
          onClick={handleGoogleLogin}
          className="w-full bg-white text-gray-700 border border-gray-200 p-3 rounded-xl hover:scale-[1.02] transition font-medium shadow-sm"
        >
          Sign in with Google
        </button>

        <p className="text-sm mt-4 text-center">
          Don’t have an account?{" "}
          <Link to="/signup" className="text-teal-500 font-semibold">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
