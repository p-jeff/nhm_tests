import React, { useRef, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, useGLTF } from "@react-three/drei";
import { LineGeometry } from "three/examples/jsm/lines/LineGeometry";
import { LineMaterial } from "three/examples/jsm/lines/LineMaterial";
import { Line2 } from "three/examples/jsm/lines/Line2";
import { EdgesGeometry } from 'three';
import { LineSegments } from 'three';
import { LineBasicMaterial } from 'three';


const Model = ({ url }) => {
  const { scene } = useGLTF(url);
 // const linesRef = useRef([]);

 console.log(scene);

  const edgesRef = useRef([]);

  useEffect(() => {
    // Find all objects with PlaneGeometry
    const edges = [];
    const planes = [];

    // First, collect all planes
    scene.traverse((child) => {
        if (child.isMesh && child.name.includes('Vert')) {
            planes.push(child);
        }
    });

    // Then, process each plane
    planes.forEach((plane) => {
        const edgesGeometry = new EdgesGeometry(plane.geometry);
        const positions = edgesGeometry.attributes.position.array;
        const lineGeometry = new LineGeometry();
        lineGeometry.setPositions(positions);

        const lineMaterial = new LineMaterial({ color: 0xffffff, linewidth: 1 });
        const edgesLine = new Line2(lineGeometry, lineMaterial);

        edgesLine.position.copy(plane.position);
        edgesLine.rotation.copy(plane.rotation);
        edgesLine.scale.copy(plane.scale);

        edges.push(edgesLine);
        scene.add(edgesLine);
        scene.remove(plane); // Remove the plane from the scene
    });

    edgesRef.current = edges;
}, [scene]);

useFrame(() => {
    if (edgesRef.current.length > 0) {
        // Animate the width of the edges
        edgesRef.current.forEach(edge => {
            edge.material.linewidth = Math.abs(Math.sin(Date.now() * 0.001)) * 5;
            edge.material.needsUpdate = true;
        });
    }
});

  /*
    useEffect(() => {
        // Find all objects with LineGeometry
        const lines = [];
        scene.traverse((child) => {
            if (child.isLine) {
                const positions = child.geometry.attributes.position.array;
                const lineGeometry = new LineGeometry();
                lineGeometry.setPositions(positions);

                const lineMaterial = new LineMaterial({
                    color: child.material.color,
                    linewidth: 1, // default width
                });

                const line = new Line2(lineGeometry, lineMaterial);
                line.position.copy(child.position);
                line.rotation.copy(child.rotation);
                line.scale.copy(child.scale);

                lines.push(line);
                scene.add(line);
                scene.remove(child);
            }
        });
        linesRef.current = lines;
    }, [scene]);

    useFrame(() => {
        if (linesRef.current.length > 0) {
            // Animate the width of the lines
            linesRef.current.forEach(line => {
                line.material.linewidth = Math.abs(Math.sin(Date.now() * 0.001)) * 5;
                line.material.needsUpdate = true;
            });
        }
    }); 
    */
  return <primitive object={scene} />;
};

const LinesOrPlanes = () => {
  const modelPath = process.env.PUBLIC_URL + "/chat_perspective.glb";

  return (
    <Canvas>
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 5]} intensity={1} />
      <Model url={modelPath} />
      <OrbitControls />
    </Canvas>
  );
};

export default LinesOrPlanes;
