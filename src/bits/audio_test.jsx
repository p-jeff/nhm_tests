import { Canvas, useThree, useFrame } from "@react-three/fiber";
import { PositionalAudio } from "@react-three/drei";
import { useEffect, useRef } from "react";

function TestAudio({ soundUrl }) {
  const sound = useRef();

  useEffect(() => {
    if (sound.current) {
      sound.current.setRefDistance(1);
      sound.current.setLoop(true);
      sound.current.play()
    }
  }, []);

  return (
    <mesh position={[0, 0, 0]}>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color="orange" />
      <PositionalAudio ref={sound} url={soundUrl} distance={1} />
    </mesh>
  );
}

export default function AudioTest() {
  return (
    <Canvas>
      <ambientLight />
      <pointLight position={[10, 10, 10]} />
      <TestAudio soundUrl={process.env.PUBLIC_URL + "/goat.mp3"} />
      <TestAudio soundUrl={process.env.PUBLIC_URL + "/cat.mp3"} position={[2, 0, 0]} />
    </Canvas>
  );
}