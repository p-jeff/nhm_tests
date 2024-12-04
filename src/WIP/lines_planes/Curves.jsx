import React, { useEffect, useState, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

const Curves = ({
  objects,
  scene,
  offset,
  speed,
  sizeCenter,
  sizeVariable,
}) => {
  const [curves, setCurves] = useState([]);
  const particlesArrayRef = useRef([]);

  class CustomCurve extends THREE.Curve {
    constructor(points) {
      super();
      this.points = points;
    }

    getPoint(t) {
      const points = this.points;
      const point = new THREE.Vector3();
      const p = (points.length - 1) * t;
      const intPoint = Math.floor(p);
      const weight = p - intPoint;

      const p0 = points[intPoint === 0 ? intPoint : intPoint - 1];
      const p1 = points[intPoint];
      const p2 =
        points[intPoint > points.length - 2 ? points.length - 1 : intPoint + 1];
      const p3 =
        points[intPoint > points.length - 3 ? points.length - 1 : intPoint + 2];

      point.set(
        catmullRom(p0.x, p1.x, p2.x, p3.x, weight),
        catmullRom(p0.y, p1.y, p2.y, p3.y, weight),
        catmullRom(p0.z, p1.z, p2.z, p3.z, weight)
      );

      return point;
    }
  }

  function catmullRom(p0, p1, p2, p3, t) {
    const v0 = (p2 - p0) * 0.5;
    const v1 = (p3 - p1) * 0.5;
    const t2 = t * t;
    const t3 = t * t2;
    return (
      (2 * p1 - 2 * p2 + v0 + v1) * t3 +
      (-3 * p1 + 3 * p2 - 2 * v0 - v1) * t2 +
      v0 * t +
      p1
    );
  }

  useEffect(() => {
    const generatedCurves = [];
    const particlesArray = [];

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

        // Add the first point to the end to close the curve
        curvePoints.push(curvePoints[0]);

        const curve = new CustomCurve(curvePoints);
        generatedCurves.push(curve);

        const curveGeometry = new THREE.BufferGeometry().setFromPoints(
          curve.getPoints(50)
        );
        const curveMaterial = new THREE.LineBasicMaterial({
          color: object.material.color,
        });

        const curveObject = new THREE.Line(curveGeometry, curveMaterial);
        //scene.add(curveObject);

        // Create white dot particles along the curve with varying sizes
        const particleCount = 200; // Increase the number of particles for smoother animation
        const particlePositions = new Float32Array(particleCount * 3);
        const particleSizes = new Float32Array(particleCount);

        for (let i = 0; i < particleCount; i++) {
          const t = i / particleCount;
          const point = curve.getPoint(t);
          const offsetX = (Math.random() - 0.5) * offset;
          const offsetY = (Math.random() - 0.5) * offset;
          const offsetZ = (Math.random() - 0.5) * offset;
          particlePositions[i * 3] = point.x + offsetX;
          particlePositions[i * 3 + 1] = point.y + offsetY;
          particlePositions[i * 3 + 2] = point.z + offsetZ;
          particleSizes[i] = Math.random() * 0.1 + 0.01; // Varying sizes
        }

        const particlesGeometry = new THREE.BufferGeometry();
        particlesGeometry.setAttribute(
          "position",
          new THREE.BufferAttribute(particlePositions, 3)
        );
        particlesGeometry.setAttribute(
          "size",
          new THREE.BufferAttribute(particleSizes, 1)
        );

        const particlesMaterial = new THREE.ShaderMaterial({
          uniforms: {
            color: { value: new THREE.Color(0xffffff) },
            time: { value: 0 },
            minSize: { value: sizeCenter - sizeVariable },
            maxSize: { value: sizeCenter + sizeVariable },
          },
          vertexShader: `
            attribute float size;
            uniform float time;
            uniform float minSize;
            uniform float maxSize;
            varying float vSize;
            void main() {
              vSize = size * (sin(time + position.x * 10.0) * 0.5 + 0.5);
              vSize = clamp(vSize, minSize, maxSize);
              vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
              gl_PointSize = vSize * (300.0 / -mvPosition.z);
              gl_Position = projectionMatrix * mvPosition;
            }
          `,
          fragmentShader: `
            uniform vec3 color;
            void main() {
              gl_FragColor = vec4(color, 1.0);
            }
          `,
          transparent: true,
        });

        const particles = new THREE.Points(
          particlesGeometry,
          particlesMaterial
        );
        scene.add(particles);
        particlesArray.push({ particles, curve });
      }
    });

    particlesArrayRef.current = particlesArray;
    setCurves(generatedCurves);
  }, [scene, objects]);

  const offsets = useRef([]);

  useFrame(() => {
    particlesArrayRef.current.forEach(({ particles, curve }) => {
      const positions = particles.geometry.attributes.position.array;
      const numPoints = positions.length / 3;
      const time = Date.now() * (speed * 0.00001);

      // Reset offsets when offset prop changes
      if (
        offsets.current.length !== numPoints ||
        Math.abs(offsets.current[0]?.x) > offset
      ) {
        // Check if current offsets exceed new offset value
        offsets.current = new Array(numPoints).fill().map(() => ({
          x: (Math.random() - 0.5) * offset,
          y: (Math.random() - 0.5) * offset,
          z: (Math.random() - 0.5) * offset,
        }));
      }

      particles.material.uniforms.time.value = Date.now() * 0.001;
      particles.material.uniforms.minSize.value = sizeCenter - sizeVariable;
      particles.material.uniforms.maxSize.value = sizeCenter + sizeVariable;

      for (let i = 0; i < numPoints; i++) {
        const t = (i / numPoints + (time % 1)) % 1;
        const point = curve.getPoint(t);
        const { x: offsetX, y: offsetY, z: offsetZ } = offsets.current[i];
        positions[i * 3] = point.x + offsetX;
        positions[i * 3 + 1] = point.y + offsetY;
        positions[i * 3 + 2] = point.z + offsetZ;
      }

      particles.geometry.attributes.position.needsUpdate = true;
    });
  });
  return null;
};

export default Curves;
