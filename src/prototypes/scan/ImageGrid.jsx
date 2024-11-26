import PoissonDiskSampling from "poisson-disk-sampling";
import React, { useEffect, useRef } from "react";
import { Image, PositionalAudio } from "@react-three/drei";

function ImageWithSound({ url, position, soundUrl, scale, blur }) {
    const sound = useRef();
  
    useEffect(() => {
      if (sound.current) {
        sound.current.setRefDistance(0.2);
        sound.current.setLoop(true);
        sound.current.play();
      }
    }, []);
  
    return (
      <mesh position={position} rotation={[0, 0, 0]}>
        <Image
          url={url}
          opacity={1}
          transparent
          scale={scale}
          style={{ filter: blur ? "blur(30px)" : "none" }}
        />
        {soundUrl ? (
          <PositionalAudio ref={sound} url={soundUrl} distance={0.2} />
        ) : null}
      </mesh>
    );
  }

export default function ImageGrid() {
    const groupRef = useRef();
  
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
      const yRandomOffset = (Math.random() - 0.5) * 2 * zOffset;
      let texture;
      let soundUrl = null;
      let yPosition = yRandomOffset;
      let blur = true;
  
      if (index === randomIndices[0] || index === randomIndices[1]) {
        texture = goat;
        soundUrl = goatSound;
        yPosition = 0; // Place goats at center height
        blur = false;
      } else if (index === randomIndices[2]) {
        texture = leopard;
        soundUrl = leopardSound;
        yPosition = 0; // Place leopard at center height
        blur = false;
      } else {
        texture = Math.random() < 0.5 ? image1 : image2;
      }
  
      // Changed position array to use Y as up axis
      const position = [x - gridSizeX / 2, y - gridSizeY / 2, yPosition];
      const scale = 3 - Math.abs(yPosition) * 3; // Adjust scale based on Y position
  
      // Calculate distance from the center
      const distanceFromCenter = calculateDistance(
        [x, y],
        [gridSizeX / 2, gridSizeY / 2]
      );
      if (distanceFromCenter < 5) {
        blur = false;
      }
  
      const imageComponent = (
        <ImageWithSound
          key={index}
          url={texture}
          position={position}
          soundUrl={soundUrl}
          scale={scale}
          blur={blur}
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
  
    return (
      <group ref={groupRef}>
        {specialPlanes}
        {planes}
      </group>
    );
  }

