import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/useAuthStore";
import jdImage from "../../assets/images/jd.png";
import habikiImage from "../../assets/images/habiki.png";
import absoluteImage from "../../assets/images/absolute.png";
import zoyaImage from "../../assets/images/zoya.png";
import jbImage from "../../assets/images/jb.png";
import bottegaImage from "../../assets/images/bottega.png";
import portofinoImage from "../../assets/images/portofino.png";
import londonImage from "../../assets/images/london.png";
import henikenImage from "../../assets/images/heniken.png";
import bombayImage from "../../assets/images/bombay.png";
import tullemoreImage from "../../assets/images/tullemore.png";
import smrinoffImage from "../../assets/images/smrinoff.png";
import { useCartStore } from "../../store/useCartStore";

/**
 * Config for floating items behind the login card.
 * - quantity: number of floating items to show
 * - images: array of image sources (imported or URL strings); items cycle through these
 */
const FLOATING_CONFIG = {
  quantity: 60,
  images: [jdImage, habikiImage, absoluteImage, zoyaImage, jbImage, bottegaImage, portofinoImage, londonImage, henikenImage, bombayImage, tullemoreImage, smrinoffImage],
};

/** Returns a random number in [min, max) (or [min, max] if integers). */
function randomBetween(min, max) {
  return min + Math.random() * (max - min);
}

/** Shuffles array in place (Fisher–Yates). */
function shuffleArray(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/** Builds a shuffled list of image indices so each image is used roughly equally (no one image dominating). */
function buildShuffledImageIndices(quantity, imageCount) {
  const indices = [];
  for (let i = 0; i < quantity; i++) {
    indices.push(i % imageCount);
  }
  return shuffleArray(indices);
}

/** Generates floating item entries with full randomness: positions, size, timing, rotation. Covers entire screen; no predictable pattern. */
function generateFloatingItems({ quantity, images }) {
  if (!quantity || !images?.length) return [];
  const items = [];
  const imageIndices = buildShuffledImageIndices(quantity, images.length);

  for (let i = 0; i < quantity; i++) {
    // Full screen: random left/bottom with margin so nothing sits exactly on 0 or edge
    const left = randomBetween(1, 95);
    const bottom = randomBetween(1, 95);
    // Size: random in range for variety
    const size = Math.round(randomBetween(80, 180));
    // Duration & delay: random so no synced wave; no zero delay
    const duration = randomBetween(10, 20);
    const delay = randomBetween(-18, 10);
    const rotate = Math.round(randomBetween(-15, 15));
    const src = images[imageIndices[i]];

    items.push({
      type: "img",
      size,
      left: `${left}%`,
      bottom: `${bottom}%`,
      duration,
      delay,
      rotate,
      src,
    });
  }
  return items;
}

const FLOATING_ITEMS_CONFIG = generateFloatingItems(FLOATING_CONFIG);

const FloatingItem = ({ item, index }) => {
  const startRotate = item.rotate ?? 0;
  const endRotate = startRotate + 15;
  const style = {
    left: item.left,
    bottom: item.bottom ?? "0%",
    width: item.size,
    height: item.size,
    // Start at animation "from" state so no diagonal flash on load/reload
    transform: `translateY(100vh) rotate(${startRotate}deg)`,
    opacity: 0.8,
    animation: `float-up ${item.duration}s ease-in-out infinite`,
    animationDelay: `${item.delay}s`,
    ["--start-rotate"]: `${startRotate}deg`,
    ["--end-rotate"]: `${endRotate}deg`,
  };
  return (
    <div
      className="login-float absolute opacity-80 pointer-events-none"
      style={style}
      aria-hidden
    >
      {item.type === "box" ? (
        <div className="w-full h-full bg-white/40 border border-white/60" />
      ) : (
        <img
          src={item.src}
          alt={item.alt ?? ""}
          className="w-full h-full object-contain rounded-lg"
        />
      )}
    </div>
  );
};

const LoginPage = () => {
  const [credentials, setCredentials] = useState({
    username: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const loginWithCredentials = useAuthStore((s) => s.loginWithCredentials);
  const resetCart = useCartStore((s) => s.resetCart);
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
      const user = await loginWithCredentials(credentials);
      const role = user?.role?.name;
console.log("User role:", role);
      // Navigate to POS dashboard on success

     if (role === "manager") {
      navigate("/select-outlet");
    } else if (role === "cashier") {
      resetCart(); // Clear any existing cart data on login
      navigate("/pos/dashboard");
    } else {
      navigate("/");
    }
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
    <div className="login relative overflow-hidden bg-linear-to-b from-primary to-secondary min-h-screen flex items-center justify-center">
      {/* Floating items behind the card — edit FLOATING_ITEMS_CONFIG to use type: "image" + src for food/butchery/bottle */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        {FLOATING_ITEMS_CONFIG.map((item, index) => (
          <FloatingItem key={index} item={item} index={index} />
        ))}
      </div>
      <div className="card relative z-10 bg-white shadow-lg py-16 px-20 text-primary">
        <h1 className="text-3xl font-semibold mb-10 text-center">
          Welcome to Qkarts POS!
        </h1>
        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-2 justify-center items-center font-semibold"
          autoComplete="off"
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
              autoComplete="off"
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
              autoComplete="off"
              className="border border-primary p-2 rounded-sm text-black w-70 outline-none text-center disabled:opacity-50"
            />
          </div>
          {error && (
            <div className="text-red-500 text-sm text-center w-70">
              {error}
            </div>
          )}
          <button
            type="submit"
            disabled={loading}
            className="mt-2 bg-primary hover:bg-secondary hover:cursor-pointer text-white p-2 rounded transition w-70 disabled:opacity-50 disabled:cursor-not-allowed"
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
