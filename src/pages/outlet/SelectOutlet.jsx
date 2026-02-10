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
import { useOutletStore } from "../../store/useOutletStore";
import { useAuthStore } from "../../store/useAuthStore";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

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

const SelectOutlet = () => {
    const { outlets, hydrate } = useOutletStore();
    const setOutlet = useAuthStore((s) => s.setOutlet);
    const navigate = useNavigate();

    useEffect(() => {
        hydrate();
    }, [hydrate]);
    console.log(outlets);


    const handleSelectOutlet = async (outletId) => {
    await setOutlet(outletId);   // save to IndexedDB + Zustand
    navigate("/pos/dashboard");  // normal navigation
  };

    return (
        <div className="login relative overflow-hidden bg-linear-to-b from-primary to-secondary min-h-screen flex items-center justify-center">
            {/* Floating items behind the card — edit FLOATING_ITEMS_CONFIG to use type: "image" + src for food/butchery/bottle */}
            <div className="absolute inset-0 z-0 pointer-events-none">
                {FLOATING_ITEMS_CONFIG.map((item, index) => (
                    <FloatingItem key={index} item={item} index={index} />
                ))}
            </div>
            <div className="card relative z-10 text-[#555555] bg-white shadow-lg py-16 px-20">
                <h1 className="mb-10 text-3xl font-bold text-center">
                    Select Outlet
                </h1>
                <div className="">
                    {outlets.map((outlet) => (
                        <div
                            key={outlet.id}
                            className="text-sm cursor-pointer border-b border-primary hover:bg-gradient-to-b from-secondary to-primary hover:text-white transition-colors"
                            onClick={() => handleSelectOutlet(outlet.id)}
                        >
                            <p className="p-3">
                                {outlet.outlet_name} - ({outlet.city})
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default SelectOutlet;
