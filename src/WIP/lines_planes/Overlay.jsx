import React from "react";

export default function Overlay({ isVisible, setIsVisible, store }) {
  const handleAR = () => {
    setIsVisible(false);
    store.enterAR();
  };

  const handleVR = () => {
    setIsVisible(false);
    store.enterVR();
  };

  const handleScreen = () => {
    setIsVisible(false);
  };

  const handleReset = () => {
    window.location.reload();
  };

  return isVisible ? (
    <div
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        backgroundColor: "#121212",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        color: "#fefefe",
        flexDirection: "column",
      }}
    >
      <h2>Lines or Planes Prototype</h2>
      <p style={{ maxWidth: "80%", fontSize: "1.2em" }}>
        Lines will change thickness based on camera distance from target point.
        Once target point is reached, a sound will play. There are some scaling
        issues in AR/VR, make sure to press reset button before entering AR/VR.
        Model should be about knee height.
        <br />
        <br />
        In AR/VR, the model will be positioned at origin.
        <br />
        <br />
        In browser, use Orbit Controls to move the camera.
      </p>
      <button className="button-54 button-large" onClick={handleAR}>
        Enter AR
      </button>
      <button onClick={handleVR} className="button-54 button-large ">
        Enter VR
      </button>
      <button onClick={handleScreen} className="button-54 button-large">
        {" "}
        Stay in Browser
      </button>
      <button
        className="button-54 button-large"
        onClick={handleReset}
        style={{
          marginTop: "10px",
          backgroundColor: "#ff4444",
        }}
      >
        Reset Scene
      </button>
    </div>
  ) : null;
}