import React, { useEffect, useState, useRef } from "react";
import * as THREE from "three";
import { Line2 } from "three/examples/jsm/lines/Line2";
import { LineMaterial } from "three/examples/jsm/lines/LineMaterial";
import { LineGeometry } from "three/examples/jsm/lines/LineGeometry";
import LineThicknessController from "./LineThicknessController";

const Lines = ({ objects, target }) => {
  const groupRef = useRef();
  const [bloomIntensity, setBloomIntensity] = useState(0);
  const materialRef = useRef([]);
  const lineRefs = useRef([]);

  useEffect(() => {
    objects.forEach((object) => {
      if (object.geometry) {
        const geometry = new LineGeometry();
        const worldPositions = [];
        const positionAttribute = object.geometry.attributes.position;
        const vertex = new THREE.Vector3();
        const lineVertices = [];

        let firstX, firstY, firstZ;

        for (let i = 0; i < positionAttribute.count; i++) {
          vertex.fromBufferAttribute(positionAttribute, i);
          vertex.applyMatrix4(object.matrixWorld);
          worldPositions.push(vertex.x, vertex.y, vertex.z);

          lineVertices.push(new THREE.Vector3(vertex.x, vertex.y, vertex.z));

          if (i === 0) {
            firstX = vertex.x;
            firstY = vertex.y;
            firstZ = vertex.z;
          }
        }

        worldPositions.push(firstX, firstY, firstZ);

        geometry.setPositions(worldPositions);

        const material = new LineMaterial({
          color: object.material.color,
          linewidth: 1,
          resolution: new THREE.Vector2(window.innerWidth, window.innerHeight),
        });

        materialRef.current.push(material);

        const line = new Line2(geometry, material);
        line.computeLineDistances();
        line.position.set(0, 0, 0);
        line.rotation.set(0, 0, 0);
        line.scale.set(1, 1, 1);
        line.name = object.name;

        lineRefs.current.push(line);
        groupRef.current.add(line);
      }
    });
  }, [objects]);

  return (
    <group ref={groupRef}>
      <LineThicknessController lineRefs={lineRefs} materialRef={materialRef} setBloomIntensity={setBloomIntensity} target={target} />
    </group>
  );
};

export default Lines;
