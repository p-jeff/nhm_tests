import React, { useRef, useEffect, useState } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";

const uniforms = {
  uPixelRatio: { value: Math.min(window.devicePixelRatio, 2) },
  uSize: { value: 50 },
  time: { value: 0 },
  mousePos: { value: new THREE.Vector3() },
};

const vertexShader = `
  uniform float uPixelRatio;
  uniform float uSize;
  uniform float time;
  uniform vec3 mousePos;

  attribute float vScale;

  void main() {
    vec3 tempPos = vec3(position.xyz);
    vec3 seg = position - mousePos;
    vec3 dir = normalize(seg);
    float dist = length(seg);
    if (dist < 30.){
      float force = clamp(1. / (dist * dist), 0., 1.);
      tempPos += dir * force * 1.1;
    }

    vec4 modelPosition = modelMatrix * vec4(tempPos, 1.);
    vec4 viewPosition = viewMatrix * modelPosition;
    vec4 projectionPosition = projectionMatrix * viewPosition;

    gl_Position = projectionPosition;
    gl_PointSize = uSize * vScale * uPixelRatio;
    gl_PointSize *= (1.0 / -viewPosition.z);
  }
`;

const fragmentShader = `
  void main() {
    float _radius = 0.4;
    vec2 dist = gl_PointCoord - vec2(0.5);
    float strength = 1. - smoothstep(
      _radius - (_radius * 0.4),
      _radius + (_radius * 0.3),
      dot(dist, dist) * 4.0
    );

    gl_FragColor = vec4(0.2, 0.2, 6., strength);
  }
`;

const Particles = ({ lineRef, particleSize, particleSpeed }) => {
  const pointsRef = useRef();
  const shaderMaterial = useRef();
  const progresses = useRef([]);
  const [curve, setCurve] = useState(null);
  const [numPoints, setNumPoints] = useState(0);

  console.log(lineRef);
  useEffect(() => {
    if (lineRef) {
      console.log("lineRef:", lineRef);
      const curvePoints = lineRef.geometry.attributes.position.array;
      const vertices = [];
      for (let i = 0; i < curvePoints.length; i += 3) {
        vertices.push(
          new THREE.Vector3(
            curvePoints[i],
            curvePoints[i + 1],
            curvePoints[i + 2]
          )
        );
      }
      const newCurve = new THREE.CatmullRomCurve3(
        vertices,
        true,
        "centripetal"
      );
      setCurve(newCurve);
      setNumPoints(vertices.length * 10);
    }
  }, [lineRef]);

  useEffect(() => {
    progresses.current = new Array(numPoints).fill(0).map(() => Math.random());
  }, [numPoints]);

  useEffect(() => {
    console.log("numPoints:", numPoints);
    console.log("curve:", curve);
  }, [numPoints, curve]);

  useEffect(() => {
    console.log("pointsRef:", pointsRef.current);
    console.log("shaderMaterial:", shaderMaterial.current);
  }, []);

  const offset = new Float32Array(numPoints * 3);

  for (let i = 0; i < numPoints; i++) {
    const xOffset = Math.random() * 0.1;
    const yOffset = Math.random() * 0.1;
    offset[i * 3] = xOffset;
    offset[i * 3 + 1] = yOffset;
    offset[i * 3 + 2] = 0;
  }

  useFrame(({ clock }) => {
    if (!curve) return;

    const updatedPositions = new Float32Array(numPoints * 3);
    const vScale = new Float32Array(numPoints);
    const pointOnCurve = new THREE.Vector3();

    for (let i = 0; i < numPoints; i++) {
      progresses.current[i] += particleSpeed;

      if (progresses.current[i] >= 1) {
        progresses.current[i] = 0;
      }

      const progress = progresses.current[i];
      if (progress !== undefined && curve) {
        curve.getPointAt(progress, pointOnCurve);

        updatedPositions[i * 3] = pointOnCurve.x + offset[i * 3];
        updatedPositions[i * 3 + 1] = pointOnCurve.y + offset[i * 3 + 1];
        updatedPositions[i * 3 + 2] = pointOnCurve.z + offset[i * 3 + 2];

        vScale[i] = Math.random() * 1.1;
      }
    }

    if (
      pointsRef.current &&
      pointsRef.current.geometry.attributes &&
      pointsRef.current.geometry.attributes.position
    ) {
      pointsRef.current.geometry.attributes.position.array = updatedPositions;
      pointsRef.current.geometry.attributes.vScale.array = vScale;
      pointsRef.current.geometry.attributes.position.needsUpdate = true;

      shaderMaterial.current.uniforms.time.value = clock.elapsedTime;
    }
  });
  return (
    <group scale={0.7}>
      <points ref={pointsRef}>
        <bufferGeometry attach="geometry">
          <bufferAttribute
            attachObject={["attributes", "position"]}
            array={new Float32Array(numPoints * 3)}
            itemSize={3}
            onUpdate={(self) => (self.needsUpdate = true)}
          />
          <bufferAttribute
            attachObject={["attributes", "vScale"]}
            array={new Float32Array(numPoints)}
            itemSize={1}
            onUpdate={(self) => (self.needsUpdate = true)}
          />
        </bufferGeometry>
        <shaderMaterial
          ref={shaderMaterial}
          uniforms={{
            uPixelRatio: { value: Math.min(window.devicePixelRatio, 2) },
            uSize: { value: particleSize },
            time: { value: 0 },
            mousePos: { value: new THREE.Vector3() },
          }}
          vertexShader={vertexShader}
          fragmentShader={fragmentShader}
        />
      </points>
    </group>
  );
};

export default Particles;
