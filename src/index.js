import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom/client";
import {
  HashRouter as Router,
  Route,
  Routes,
  useNavigate,
} from "react-router-dom";

import CatchTheLeopard from "./bits/CatchTheLeopard";
import WheelApp from "./bits/WheelApp";
import DragTest from "./bits/DragTest";
import AnimState from "./bits/animState";
import PositionLock from "./bits/positionLock";
import AnimOncePosition from "./bits/animeOncePosition";
import MixamoOutline from "./prototypes/mixamo_outlines";
import DynamicOutline from "./WIP/dynamic_outlines";
import Scan_old from "./prototypes/scan_old/scan_old";
import LinesOrPLanes from "./WIP/lines_or_planes";
import AudioTest from "./bits/audio_test";
import Menu from "./Menu";
import "./index.css";
import BackButton from "./backButton";
import Scan from "./prototypes/scan/scan";


// Updated index.js
const App = () => {
  const [menuVisible, setMenuVisible] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if we're on the root path
    const isRoot = window.location.hash === "#/" || window.location.hash === "";
    setMenuVisible(isRoot);

    const handleRouteChange = () => {
      const isRoot =
        window.location.hash === "#/" || window.location.hash === "";
      setMenuVisible(isRoot);
    };

    window.addEventListener("popstate", handleRouteChange);
    return () => window.removeEventListener("popstate", handleRouteChange);
  }, []);

  const handleButtonClick = (path) => {
    setMenuVisible(false);
    navigate(path);
  };

  const handleBack = () => {
    setMenuVisible(true);
    navigate("/");
  };

  return (
    <>
      {menuVisible ? (
        <Menu handleButtonClick={handleButtonClick} />
      ) : (
        <BackButton onClick={handleBack} />
      )}
      <Routes>
        <Route path="/mixamo-outline" element={<MixamoOutline />} />
        <Route path="/scan" element={<Scan />} />
        <Route path="/leopard-lines" element={<LinesOrPLanes />} />
        <Route path="/dynamic-outline" element={<DynamicOutline />} />
        <Route path="/audio-test" element={<AudioTest />} />
        <Route path="/catch-the-leopard" element={<CatchTheLeopard />} />
        <Route path="/drag-test" element={<DragTest />} />
        <Route path="/anim-state" element={<AnimState />} />
        <Route path="/position-lock" element={<PositionLock />} />
        <Route path="/anim-once-position" element={<AnimOncePosition />} />
        <Route path="/wheel-app" element={<WheelApp />} />
        <Route path="/scan-old" element={<Scan_old />} />
      </Routes>
    </>
  );
};

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <Router>
      <App />
    </Router>
  </React.StrictMode>
);
