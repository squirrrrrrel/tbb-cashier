import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/useAuthStore";

const LoginPage = () => {
  const [credentials, setCredentials] = useState({
    username: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const loginWithCredentials = useAuthStore((s) => s.loginWithCredentials);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!credentials.username || !credentials.password) {
      setError("Please enter both username and password");
      setLoading(false);
      return;
    }

    try {
      await loginWithCredentials(credentials);
      // Navigate to POS dashboard on success
      navigate("/pos/dashboard");
    } catch (err) {
      setError("Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setCredentials({
      ...credentials,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="login bg-gradient-to-b from-primary to-secondary min-h-screen flex items-center justify-center">
      <div className="card bg-white shadow-lg py-16 px-20 text-primary">
        <h1 className="text-3xl font-semibold mb-10 text-center">
          Welcome to Qkarts POS!
        </h1>
        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-2 justify-center items-center font-semibold"
        >
          <div className="username flex flex-col">
            <label className="text-sm text-center">Username or Email</label>
            <input
              type="text"
              name="username"
              value={credentials.username}
              onChange={handleChange}
              autoFocus
              disabled={loading}
              className="border border-primary p-2 rounded-sm text-black w-70 outline-none text-center disabled:opacity-50"
            />
          </div>
          <div className="password flex flex-col">
            <label className="text-sm text-center">Password</label>
            <input
              type="password"
              name="password"
              value={credentials.password}
              onChange={handleChange}
              disabled={loading}
              className="border border-primary p-2 rounded-sm text-black w-70 outline-none text-center disabled:opacity-50"
            />
          </div>
          {error && (
            <div className="text-red-500 text-sm text-center w-70">
              {error}
            </div>
          )}
          <div className="forget underline cursor-pointer">Forget Password</div>
          <button
            type="submit"
            disabled={loading}
            className="bg-primary hover:bg-secondary hover:cursor-pointer text-white p-2 rounded transition w-70 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Logging in..." : "Log In"}
          </button>
        </form>
        <div className="text-center mt-4 text-lg font-medium">
          Thanks for using Warnoc!
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
