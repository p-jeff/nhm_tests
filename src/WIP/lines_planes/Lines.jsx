import React, { useEffect } from 'react';
import * as THREE from 'three';
import { Line2 } from 'three/examples/jsm/lines/Line2';
import { LineMaterial } from 'three/examples/jsm/lines/LineMaterial';
import { LineGeometry } from 'three/examples/jsm/lines/LineGeometry';


const Lines = ({ objects, scene, materialRef, lineRefs }) => {
    useEffect(() => {
      // Convert planar objects to Line2 with LineMaterial
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
  
          // Close the loop
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
          scene.add(line);
        }
      });
    }, [scene, objects]);
  };

export default Lines;