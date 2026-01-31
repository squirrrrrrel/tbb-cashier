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

/**
 * Config for floating items behind the login card.
 * - quantity: number of floating items to show
 * - images: array of image sources (imported or URL strings); items cycle through these
 */
const FLOATING_CONFIG = {
  quantity: 60,
  images: [jdImage, habikiImage, absoluteImage, zoyaImage, jbImage, bottegaImage, portofinoImage, londonImage, henikenImage, bombayImage, tullemoreImage, smrinoffImage],
};

/** Generates floating item entries from config. Spreads left %, bottom %, size, duration, delay, rotate across the whole screen. */
function generateFloatingItems({ quantity, images }) {
  if (!quantity || !images?.length) return [];
  const items = [];
  const sizeMin = 60;
  const sizeRange = 100;
  const durationMin = 10;
  const durationRange = 15;
  const rotateMin = -25;
  const rotateRange = 51;

  const leftMin = 2;
  const leftMax = 92;
  const bottomMin = 5;
  const bottomMax = 90;
  const spreadLeft = leftMax - leftMin;
  const spreadBottom = bottomMax - bottomMin;
  const leftStep = quantity > 1 ? spreadLeft / (quantity - 1) : 0;
  const bottomStep = quantity > 1 ? spreadBottom / (quantity - 1) : 0;

  for (let i = 0; i < quantity; i++) {
    // Spread evenly across full width and height; varied duration/delay/rotate for randomness
    const left = leftMin + leftStep * i;
    const bottom = bottomMin + bottomStep * i;
    const size = sizeMin + (i * 7) % sizeRange;
    const duration = durationMin + (i * 5) % durationRange;
    const delay = i % 9;
    const rotate = rotateMin + (i * 11) % rotateRange;
    const src = images[i % images.length];

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
    animation: `float-up ${item.duration}s ease-in infinite`,
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
