import { Canvas, useThree, useFrame } from "@react-three/fiber";
import { Image, OrbitControls, PositionalAudio } from "@react-three/drei";
import PoissonDiskSampling from "poisson-disk-sampling";
import * as THREE from "three";
import { useEffect, useState, useRef } from "react";
import { EffectComposer, Vignette } from '@react-three/postprocessing'

function ImageWithSound({ url, position, soundUrl, scale }) {
  const sound = useRef();

  useEffect(() => {
    if (sound.current) {
      sound.current.setRefDistance(0.2);
      sound.current.setLoop(true);
      sound.current.play();
    }
  }, []);

  return (
    <mesh position={position} rotation={[-Math.PI / 2, 0, 0]}>
      <Image url={url} opacity={1} transparent scale={scale} />
      {soundUrl ? (
        <PositionalAudio ref={sound} url={soundUrl} distance={0.2} />
      ) : null}
    </mesh>
  );
}

function ImageGrid() {
  const image1 = process.env.PUBLIC_URL + "/rock1.png";
  const image2 = process.env.PUBLIC_URL + "/rock2.png";
  const leopard = process.env.PUBLIC_URL + "/leopard.png";
  const goat = process.env.PUBLIC_URL + "/goat.png";
  const goatSound = process.env.PUBLIC_URL + "/goat.mp3";
  const leopardSound = process.env.PUBLIC_URL + "/cat.mp3";

  const gridSizeX = 20; // Size of the grid in the x direction
  const gridSizeY = 20; // Size of the grid in the y direction
  const minDistance = 1.1; // Minimum distance between points
  const zOffset = 0.1; // Z-offset range for parallax effect

  const pds = new PoissonDiskSampling({
    shape: [gridSizeX, gridSizeY],
    minDistance: minDistance,
    tries: 30,
  });

  const points = pds.fill();
  let planes = [];
  let specialPlanes = [];

  // Function to calculate distance between two points
  const calculateDistance = (point1, point2) => {
    return Math.sqrt(
      Math.pow(point1[0] - point2[0], 2) + Math.pow(point1[1] - point2[1], 2)
    );
  };

  // Randomly select positions for the goats and leopard ensuring they are far apart
  let randomIndices = [];
  while (randomIndices.length < 3) {
    const candidateIndices = points
      .map((_, index) => index)
      .sort(() => Math.random() - 0.5)
      .slice(0, 3);

    const [index1, index2, index3] = candidateIndices;
    const distance1 = calculateDistance(points[index1], points[index2]);
    const distance2 = calculateDistance(points[index1], points[index3]);
    const distance3 = calculateDistance(points[index2], points[index3]);

    if (
      distance1 > minDistance &&
      distance2 > minDistance &&
      distance3 > minDistance
    ) {
      randomIndices = candidateIndices;
    }
  }

  points.forEach(([x, y], index) => {
    const zRandomOffset = (Math.random() - 0.5) * 2 * zOffset;
    let texture;
    let soundUrl = null;
    let zPosition = zRandomOffset;

    if (index === randomIndices[0] || index === randomIndices[1]) {
      texture = goat;
      soundUrl = goatSound;
      zPosition = 0.5; // Ensure goats are in front
    } else if (index === randomIndices[2]) {
      texture = leopard;
      soundUrl = leopardSound;
      zPosition = 0.5; // Ensure leopard is in front
    } else {
      texture = Math.random() < 0.5 ? image1 : image2;
    }

    const position = [x - gridSizeX / 2, zPosition, y - gridSizeY / 2];
    const scale = 3 - zPosition * 3; // Adjust scale based on zPosition
    const imageComponent = (
      <ImageWithSound
        key={index}
        url={texture}
        position={position}
        soundUrl={soundUrl}
        scale={scale}
      />
    );

    if (
      index === randomIndices[0] ||
      index === randomIndices[1] ||
      index === randomIndices[2]
    ) {
      specialPlanes.push(imageComponent);
    } else {
      planes.push(imageComponent);
    }
  });

  // Render specialPlanes and planes separately
  return (
    <>
      {specialPlanes}
      {planes}
    </>
  );
}

function LimitedOrbitControls() {
  const { camera } = useThree();
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (event) => {
      setMousePosition({ x: event.clientX, y: event.clientY });
    };

    window.addEventListener("mousemove", handleMouseMove);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  useFrame(() => {
    const { innerWidth, innerHeight } = window;
    const threshold = 50; // distance from edge to start panning
    const panSpeed = 0.05;

    if (mousePosition.x < threshold) {
      camera.position.x -= panSpeed;
    } else if (mousePosition.x > innerWidth - threshold) {
      camera.position.x += panSpeed;
    }

    if (mousePosition.y < threshold) {
      camera.position.z -= panSpeed;
    } else if (mousePosition.y > innerHeight - threshold) {
      camera.position.z += panSpeed;
    }

    const maxPan = new THREE.Vector3(10, 10, 10);
    const minPan = new THREE.Vector3(-10, -10, -10);
    camera.position.clamp(minPan, maxPan);
  });

  return null;
}

export default function Scan() {
  return (
    <div id="scan">
      <Canvas camera={{ position: [0, 2, 0] }}>
        <ImageGrid />
        <LimitedOrbitControls />
        <EffectComposer>
          <Vignette eskil={false} offset={0.1} darkness={1.1} />
          </EffectComposer>
      </Canvas>
    </div>
  );
}
