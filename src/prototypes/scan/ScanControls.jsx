import { useEffect, useState } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

export default function ScanControls({ groupRef }) {
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  
    useEffect(() => {
      const handleMouseMove = (event) => {
        setMousePosition({ x: event.clientX, y: event.clientY });
      };
  
      window.addEventListener("mousemove", handleMouseMove);
      return () => window.removeEventListener("mousemove", handleMouseMove);
    }, []);
  
    useFrame(() => {
      if (!groupRef.current) return;
  
      const { innerWidth, innerHeight } = window;
      const threshold = 50; // distance from edge to start moving
      const moveSpeed = 0.1;
  
      // Move group in opposite direction of desired camera movement
      if (mousePosition.x < threshold) {
        groupRef.current.position.x += moveSpeed;
      } else if (mousePosition.x > innerWidth - threshold) {
        groupRef.current.position.x -= moveSpeed;
      }
  
      if (mousePosition.y < threshold) {
        groupRef.current.position.y -= moveSpeed;
      } else if (mousePosition.y > innerHeight - threshold) {
        groupRef.current.position.y += moveSpeed;
      }
  
      // Clamp group position
      const maxOffset = 10;
      groupRef.current.position.x = THREE.MathUtils.clamp(
        groupRef.current.position.x,
        -maxOffset,
        maxOffset
      );
      groupRef.current.position.y = THREE.MathUtils.clamp(
        groupRef.current.position.y,
        -maxOffset,
        maxOffset
      );
    });
  
    return null;
  }