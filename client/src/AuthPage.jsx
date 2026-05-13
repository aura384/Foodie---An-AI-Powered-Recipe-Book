import { useState } from "react";
import "./AuthPage.css";
import girlImg from "./login.png";
import logoImg from "./foodie.png";
import foodshowerImg from "./foodshower.png";

const API_BASE = process.env.REACT_APP_API_URL;

export default function AuthPage({ onLogin }) {
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const endpoint =
  mode === "login"
    ? "/api/auth/login"
    : "/api/auth/register";
      const body = mode === "login"
        ? { email: form.email, password: form.password }
        : { name: form.name, email: form.email, password: form.password };

      const res = await fetch(`${API_BASE}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (!res.ok) return setError(data.error || "Something went wrong.");

      localStorage.setItem("foodie_token", data.token);
      localStorage.setItem("foodie_user", JSON.stringify(data.user));
      onLogin(data.user);
    } catch {
      setError("Couldn't connect to server. Is it running?");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      {/* two copies stacked vertically so the scroll loops seamlessly */}
      <div className="auth-bg">
        <img src={foodshowerImg} alt="" className="bg-img" />
        <img src={foodshowerImg} alt="" className="bg-img" />
      </div>
      <div className="bg-overlay" />

      <div className="auth-card">
        <div className="auth-brand">
          <img src={girlImg} alt="Foodie" className="auth-mascot" />
          <img src={logoImg} alt="Foodie" className="auth-logo" />
          <p className="auth-tagline">
            {mode === "login"
              ? "Hey there! Sign in to continue."
              : "Create an account to get started."}
          </p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          {mode === "register" && (
            <div className="auth-field">
              <label>Name</label>
              <input name="name" type="text" placeholder="Your name"
                value={form.name} onChange={handleChange} required />
            </div>
          )}
          <div className="auth-field">
            <label>Email</label>
            <input name="email" type="email" placeholder="you@email.com"
              value={form.email} onChange={handleChange} required />
          </div>
          <div className="auth-field">
            <label>Password</label>
            <input name="password" type="password"
              placeholder={mode === "register" ? "At least 6 characters" : "Your password"}
              value={form.password} onChange={handleChange} required />
          </div>

          {error && <p className="auth-error">{error}</p>}

          <button className="auth-submit" type="submit" disabled={loading}>
            {loading ? "Please wait…" : mode === "login" ? "Sign In" : "Create Account"}
          </button>
        </form>

        <p className="auth-switch">
          {mode === "login" ? (
            <>Don't have an account?{" "}
              <button onClick={() => { setMode("register"); setError(null); }}>Register here</button>
            </>
          ) : (
            <>Already have an account?{" "}
              <button onClick={() => { setMode("login"); setError(null); }}>Sign in</button>
            </>
          )}
        </p>
      </div>
    </div>
  );
}