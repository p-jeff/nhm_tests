import React from "react";
import ReactDOM from "react-dom/client";

import CatchTheLeopard from "./bits/CatchTheLeopard";
import WheelApp from "./bits/WheelApp";
import DragTest from "./bits/DragTest";
import AnimState from "./bits/animState";
import PositionLock from "./bits/positionLock";
import AnimOncePosition from "./bits/animeOncePosition";
import MixamoOutline from "./prototypes/mixamo_outlines";
import DynamicOutline from "./WIP/dynamic_outlines";
import Scan from "./WIP/scan";
import LinesOrPLanes from "./WIP/lines_or_planes";
import AudioTest from "./WIP/audio_test";

import "./index.css";


const App = () => {
  const [selectedApp, setSelectedApp] = React.useState(null);

  return selectedApp === null ? (
    <div style={{margin: "10px"}}>
      <h1> Johannes Prototypes for NowHere Media </h1>
      <h2> Full interaction Prototypes </h2>
      <button onClick={() => setSelectedApp(<MixamoOutline />)}>
        Mixamo animation with Outline
      </button>
      <h2> WIP </h2>
      <button onClick={() => setSelectedApp(<LinesOrPLanes />)}> Lines or Planes </button>
      <button onClick={() => setSelectedApp(<Scan />)}> Scan </button>
      <button onClick={() => setSelectedApp(<DynamicOutline />)}>

        Dynamic Outline
      </button>
      <button onClick={() => setSelectedApp(<AudioTest />)}> Audio Test </button>
      <h2> Steps, small bits </h2>
      <button onClick={() => setSelectedApp(<CatchTheLeopard />)}>
        Move model on close to view center
      </button>
      <button onClick={() => setSelectedApp(<DragTest />)}>
        Large Wheel Drag Test
      </button>
      <button onClick={() => setSelectedApp(<AnimState />)}>Anim State</button>
      <button onClick={() => setSelectedApp(<PositionLock />)}>
        Position Lock
      </button>
      <button onClick={() => setSelectedApp(<AnimOncePosition />)}>
        Anim Once Position
      </button>
      <button onClick={() => setSelectedApp(<WheelApp />)}>Wheel App</button>

    </div>
  ) : (
    <div style={{ width: "100%", height: "100%" }}>{selectedApp}</div>
  );
};

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

