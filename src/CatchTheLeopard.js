import React, { useRef, useState } from 'react';
import { Canvas, useFrame, useLoader } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import { createXRStore, XR } from '@react-three/xr';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader';

const store = createXRStore();

function randomPosition() {
  const x = Math.random() * 10 - 5;
  const y = Math.random() * 10 - 5;
  const z = Math.random() * 10 - 5;
  return [x, y, z];
}

function CustomModel() {
  const modelRef = useRef();
  const [position, setPosition] = useState(randomPosition());
  const audio = useRef(new Audio('ding.mp3'));
  const obj = useLoader(OBJLoader, 'chat.obj');

  useFrame(({ camera }) => {
    const [x, y, z] = position;
    const vector = new THREE.Vector3(x, y, z);
    vector.project(camera);

    const distanceFromCenter = Math.sqrt(vector.x * vector.x + vector.y * vector.y);
    const threshold = 0.3; // Increase this value to enlarge the trigger area
    if (distanceFromCenter < threshold) {
      setPosition(randomPosition());
      audio.current.play();
    }
  });

  return (
    <primitive
      ref={modelRef}
      object={obj}
      position={position}
      scale={[0.01, 0.01, 0.01]} // Adjust the scale as needed
    />
  );
}


function CatchTheLeopard() {
  return (
    <>
    <button onClick={() => store.enterVR()}>Enter VR</button>
    <button onClick={() => store.enterAR()}>Enter AR</button>

    <Canvas>
      <XR store={store} >
      <ambientLight />
      <pointLight position={[10, 10, 10]} />
      <CustomModel />
      <OrbitControls enableRotate={false} />
      </XR>
    </Canvas> 
    </>
  );
}

export default CatchTheLeopard;