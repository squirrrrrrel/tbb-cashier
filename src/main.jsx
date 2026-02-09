import { StrictMode, useEffect } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import "./App.css";
import { BrowserRouter } from "react-router-dom";
import { SocketProvider } from "./socket/SocketProvider.jsx";
import { registerSW } from "virtual:pwa-register";

// 👇 Register Service Worker safely
const updateSW = registerSW({
  immediate: false, // ✅ VERY IMPORTANT
  onRegistered(r) {
    console.log("✅ Service Worker registered", r);
  },
  onOfflineReady() {
    console.log("📦 App is ready to work offline");
  },
});

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <SocketProvider>
        <App />
      </SocketProvider>
    </BrowserRouter>
  </StrictMode>
);
