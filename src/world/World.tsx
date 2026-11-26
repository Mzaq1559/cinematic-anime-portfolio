import { useEffect, useMemo, useRef } from "react";
import type { MutableRefObject } from "react";
import * as THREE from "three";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { skyAt } from "../lib/palette";
import {
  Z,
  Clouds,
  Stars,
  Comet,
  Mountains,
  City,
  Ribbon,
  Railway,
  Blossoms,
  Constellation3D,
  ProjectPanes,
} from "./elements";

type Props = {
  progressRef: MutableRefObject<number>;
  boostRef: MutableRefObject<number>;
};

/**
 * Drives the camera along the zone path from scroll progress, and keeps the
 * sky dome and fog colours in step with the palette.
 */
function Rig({ progressRef }: { progressRef: MutableRefObject<number> }) {
  const { camera, scene } = useThree();
  const dome = useRef<THREE.Mesh>(null);
  const uniforms = useMemo(
    () => ({
      uTop: { value: new THREE.Color("#65B9ED") },
      uBottom: { value: new THREE.Color("#F4F8FF") },
    }),
    [],
  );

  useEffect(() => {
    scene.fog = new THREE.Fog("#F4F8FF", 45, 260);
  }, [scene]);

  useFrame(() => {
    const p = progressRef.current;
    const e = p * p * (3 - 2 * p); // smoothstep easing
    const z = THREE.MathUtils.lerp(Z.start, Z.end, e);

    camera.position.set(Math.sin(p * Math.PI) * 1.2, 2.2 + Math.sin(p * 18) * 0.06, z);
    camera.lookAt(0, 1.2, z - 14);

    const { top, bottom } = skyAt(p);
    uniforms.uTop.value.copy(top);
    uniforms.uBottom.value.copy(bottom);
    if (scene.fog instanceof THREE.Fog) scene.fog.color.copy(bottom);
    if (dome.current) dome.current.position.copy(camera.position);
  });

  return (
    <mesh ref={dome}>
      <sphereGeometry args={[500, 32, 16]} />
      <shaderMaterial
        side={THREE.BackSide}
        depthWrite={false}
        uniforms={uniforms}
        vertexShader={`
          varying vec3 vPos;
          void main() {
            vPos = normalize(position);
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }`}
        fragmentShader={`
          uniform vec3 uTop;
          uniform vec3 uBottom;
          varying vec3 vPos;
          void main() {
            float h = clamp(vPos.y * 0.5 + 0.5, 0.0, 1.0);
            gl_FragColor = vec4(mix(uBottom, uTop, pow(h, 0.8)), 1.0);
          }`}
      />
    </mesh>
  );
}

/** The 3D world. Fixed behind the HTML sections; the camera travels through it on scroll. */
export default function World({ progressRef, boostRef }: Props) {
  const isMobile = typeof window !== "undefined" && window.innerWidth < 720;

  return (
    <Canvas
      className="world-canvas"
      dpr={[1, 1.75]}
      camera={{ position: [0, 2.2, Z.start], fov: 55, near: 0.1, far: 1000 }}
      gl={{ antialias: true, alpha: false }}
    >
      <ambientLight intensity={0.9} />
      <directionalLight position={[30, 40, -20]} intensity={1.1} color="#FFB36A" />

      <Rig progressRef={progressRef} />
      <Stars progressRef={progressRef} count={isMobile ? 600 : 1400} />
      <Clouds count={isMobile ? 14 : 26} />
      <Comet boostRef={boostRef} />

      <Mountains z={-150} height={26} color="#6E65A5" seed={1} />
      <Mountains z={-300} height={40} color="#183B70" seed={3} />
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2, -150]}>
        <planeGeometry args={[400, 500]} />
        <meshStandardMaterial color="#1d2a44" />
      </mesh>

      <Ribbon z={Z.ribbon} />
      <City z={Z.city} />
      <Railway z={Z.railway} />
      <Blossoms zFrom={Z.school + 20} zTo={Z.school - 40} count={isMobile ? 90 : 220} />
      <Constellation3D z={Z.constellation} />
      <ProjectPanes z={Z.gallery} />
    </Canvas>
  );
}
