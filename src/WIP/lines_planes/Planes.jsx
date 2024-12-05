import React, { useEffect, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useControls } from "leva";

const vertexShader = `
  uniform float time;
  uniform float intensity;
  void main() {
    vec3 pos = position;
    pos.z += sin(pos.y * 10.0 + time) * intensity;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
  }
`;

const fragmentShader = `
  void main() {
    gl_FragColor = vec4(0.82, 0.71, 0.55, 1.0); // Color: #d2b48c
  }
`;

const Planes = ({ objects, scene }) => {
  const materialsRef = useRef([]);
  const groupRef = useRef();

  const { intensity, showOutline } = useControls(
    "Plane Controls", // This creates a folder/group
    {
      intensity: {
        value: 0.03,
        min: 0,
        max: 0.1,
        step: 0.001,
      },
      showOutline: {
        value: false,
      },
    },
    { collapsed: true }
  );

  useEffect(() => {
    if (groupRef.current) {
      while (groupRef.current.children.length > 0) {
        const child = groupRef.current.children[0];
        groupRef.current.remove(child);
        if (child.geometry) child.geometry.dispose();
        if (child.material) child.material.dispose();
      }
    }
    objects.forEach((object, index) => {
      if (object.geometry) {
        const positionAttribute = object.geometry.attributes.position;
        console.log(positionAttribute);
        const vertices = [];

        for (let i = 0; i < positionAttribute.count; i++) {
          const vertex = new THREE.Vector3();
          vertex.fromBufferAttribute(positionAttribute, i);
          vertex.applyMatrix4(object.matrixWorld); // Transform to world space
          vertices.push(vertex);
        }

        console.log(vertices);

        const shape = new THREE.Shape();
        shape.autoClose = true; // Ensure the shape is closed

        shape.moveTo(vertices[0].y, vertices[0].z);

        for (let i = 1; i < vertices.length; i++) {
          shape.lineTo(vertices[i].y, vertices[i].z);
        }

        // Create a geometry from the shape
        const geometry = new THREE.ShapeGeometry(shape);

        const material = new THREE.ShaderMaterial({
          vertexShader,
          fragmentShader,
          uniforms: {
            time: { value: 0 },
            intensity: { value: intensity },
          },
          side: THREE.DoubleSide,
        });

        materialsRef.current[index] = material;

        const plane = new THREE.Mesh(geometry, material);

        plane.rotation.set(Math.PI / 2, Math.PI / 2, 0);
        plane.position.x = vertices[0].x;

        if (showOutline) {
          const edgesGeometry = new THREE.EdgesGeometry(geometry);
          const edgesMaterial = new THREE.LineBasicMaterial({
            color: 0x000000,
          });
          const edges = new THREE.LineSegments(edgesGeometry, edgesMaterial);

          edges.rotation.set(Math.PI / 2, Math.PI / 2, 0);
          edges.position.x = vertices[0].x;

          groupRef.current.add(edges);
        }

        groupRef.current.add(plane);
      }
    });
  }, [objects, scene, intensity, showOutline]);

  useFrame(() => {
    materialsRef.current.forEach((material) => {
      if (material) {
        material.uniforms.time.value += 0.05;
      }
    });
  });

  return <group ref={groupRef} />;
};

export default Planes;
