export default function LoadingOverlay({ onClick, xrStore, setIsLoaded, setVersion }) {
  return (
    <div
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "#808080",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 10,
      }}
    >
      <h2 style={{ color: "white", margin: "30px" }}>
        First Binocular Prototype. <br /> Uses positional audio - works better
        with headphones. <br /> Pan by moving the mouse close to the edge.
        <br /> In VR pan by looking around.
      </h2>
      <button
        onClick={onClick}
        style={{ padding: "10px 20px", fontSize: "16px" }}
      >
        Prototype in Browser
      </button>
      <button
        onClick={() => {
          setIsLoaded(true);
          xrStore.enterVR();
          setVersion('old')
        }}
        style={{ padding: "10px 20px", fontSize: "16px", marginLeft: "10px" }}
      >
     Prototype in VR, Scan Controls
      </button>
      <button
        onClick={() => {
          setIsLoaded(true);
          xrStore.enterVR();
          setVersion('new')
        }}
        style={{ padding: "10px 20px", fontSize: "16px", marginLeft: "10px" }}
      >
        Prototype in VR, Zoom
      </button>

    </div>
  );
}