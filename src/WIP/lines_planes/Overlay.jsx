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
                backgroundColor: "rgba(0, 0, 0, 0.5)",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                color: "white",
                flexDirection: "column",
            }}
        >
            <h2>Lines or Planes Prototype</h2>
            <p>
                Lines will change thickness based on camera distance from target point.
                <br />
                <br />
                In AR/VR, the model will be positioned at origin.
                <br />
                <br />
                In browser, use Orbit Controls to move the camera.
            </p>
            <button onClick={handleAR}>Enter AR</button>
            <button onClick={handleVR}>Enter VR</button>
            <button onClick={handleScreen}>Stay in Browser</button>
            <button 
                onClick={handleReset}
                style={{
                    marginTop: "10px",
                    backgroundColor: "#ff4444"
                }}
            >
                Reset Scene
            </button>
        </div>
    ) : null;
};