import { useEffect, useState } from "react";
import { useThree, useFrame } from "@react-three/fiber";
import * as THREE from "three";

export default function ScanControls() {
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
      const panSpeed = 0.1;
  
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