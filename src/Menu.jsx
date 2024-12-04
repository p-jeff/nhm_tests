import React, { useState } from "react";

const Menu = ({ handleButtonClick }) => {
  const [showOldVersions, setShowOldVersions] = useState(false);
  const [showBits, setShowBits] = useState(false);

  const currentPrototypes = [
    { path: "/scan", label: "Scan Prototype" },
    {
      path: "/leopard-lines",
      label: "Outline Interaction Prototype 2, Visual Feedback",
    },
  ];

  const oldVersions = [
    { path: "/scan_old", label: "Scan Prototype 1 (depreciated)" },
    { path: "/mixamo-outline", label: "Outline Interaction Prototype 1" },
    { path: "/catch-the-leopard", label: "Catch the Leopard" },
    { path: "/drag-test", label: "Drag Test" },
  ];

  const bits = [
    { path: "/dynamic-outline", label: "Dynamic Outline" },
    { path: "/audio-test", label: "Audio Test" },
    { path: "/anim-state", label: "Animation State" },
  ];

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "1fr",
        gap: "20px",
        padding: "40px",
        maxWidth: "1200px",
        margin: "0 auto",
      }}
    >
      <h1>Johannes' Prototypes for NowHere Media</h1>
      <div>
        <h2>Current Prototypes</h2>
        {currentPrototypes.map((item) => (
          <button
            className="button-54 button-large"
            key={item.path}
            onClick={() => handleButtonClick(item.path)}
          >
            {item.label}
          </button>
        ))}
      </div>
      <div>
        <h2>Old Versions, Depreciated</h2>
        {oldVersions.map((item) => (
          <button
            className="button-54"
            key={item.path}
            onClick={() => handleButtonClick(item.path)}
          >
            {item.label}
          </button>
        ))}
      </div>
      <div>
        <h2>Bits</h2>
        {bits.map((item) => (
          <button
            className="button-54"
            key={item.path}
            onClick={() => handleButtonClick(item.path)}
          >
            {item.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default Menu;
