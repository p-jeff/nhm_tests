import React, { useEffect, useState, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";


const Curves = ({ objects, scene }) => {
  const [curves, setCurves] = useState([]);
  const [done, setDone] = useState(false);

  class CustomCurve extends THREE.Curve {
    constructor(points) {
      super();
      this.points = points;
    }

    getPoint(t) {
      const point = this.points[Math.floor(t * (this.points.length - 1))];
      return point;
    }
  }

  useEffect(() => {
    const generatedCurves = [];
    const lines = [];
    objects.forEach((object) => {
      if (object.geometry) {
        const positionAttribute = object.geometry.attributes.position;
        const vertex = new THREE.Vector3();
        const curvePoints = [];

        for (let i = 0; i < positionAttribute.count; i++) {
          vertex.fromBufferAttribute(positionAttribute, i);
          vertex.applyMatrix4(object.matrixWorld);
          curvePoints.push(new THREE.Vector3(vertex.x, vertex.y, vertex.z));
        }

        const curve = new CustomCurve(curvePoints);
        generatedCurves.push(curve);

        const curveGeometry = new THREE.BufferGeometry().setFromPoints(
          curve.getPoints(50)
        );
        const curveMaterial = new THREE.LineBasicMaterial({
          color: object.material.color,
        });

        const curveObject = new THREE.Line(curveGeometry, curveMaterial);
        scene.add(curveObject);
      }
    });

    console.log(lines[0]);
    setCurves(generatedCurves);
  }, [scene, objects]);

  useEffect(() => {
    if (curves.length > 0) {
      setDone(true);
      console.log("pong");
    }
  }, [curves]);

  if (done) {
    return null
  } else {
    return null;
  }
};

export default Curves;
