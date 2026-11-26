import { useEffect, useMemo, useRef, useState } from "react";
import type { MutableRefObject } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { owner, experience, skills, projects } from "../data/content";
import { emit, EVENTS } from "../lib/events";

/** Z positions of each zone along the camera's travel path (camera moves toward -z). */
export const Z = {
  start: 8,
  ribbon: -20,
  city: -60,
  railway: -120,
  school: -170,
  constellation: -220,
  gallery: -270,
  end: -330,
};

const rand = (a: number, b: number) => a + Math.random() * (b - a);
type ProgressRef = MutableRefObject<number>;

function softTexture() {
  const c = document.createElement("canvas");
  c.width = c.height = 128;
  const g = c.getContext("2d")!;
  const grad = g.createRadialGradient(64, 64, 0, 64, 64, 64);
  grad.addColorStop(0, "rgba(255,255,255,1)");
  grad.addColorStop(0.5, "rgba(255,255,255,0.4)");
  grad.addColorStop(1, "rgba(255,255,255,0)");
  g.fillStyle = grad;
  g.fillRect(0, 0, 128, 128);
  return new THREE.CanvasTexture(c);
}

/* ---------- Sky ---------- */

export function Clouds({ count }: { count: number }) {
  const tex = useMemo(softTexture, []);
  const data = useMemo(
    () =>
      Array.from({ length: count }, () => ({
        x: rand(-70, 70),
        y: rand(7, 24),
        z: rand(-340, 20),
        s: rand(16, 36),
        v: rand(0.6, 2),
      })),
    [count],
  );
  const refs = useRef<(THREE.Sprite | null)[]>([]);

  useFrame((_, dt) => {
    refs.current.forEach((s, i) => {
      if (!s) return;
      s.position.x += data[i].v * dt;
      if (s.position.x > 80) s.position.x = -80;
    });
  });

  return (
    <>
      {data.map((c, i) => (
        <sprite
          key={i}
          ref={(el: THREE.Sprite | null) => {
            refs.current[i] = el;
          }}
          position={[c.x, c.y, c.z]}
          scale={[c.s * 1.8, c.s, 1]}
        >
          <spriteMaterial map={tex} transparent depthWrite={false} opacity={0.8} />
        </sprite>
      ))}
    </>
  );
}

export function Stars({ progressRef, count }: { progressRef: ProgressRef; count: number }) {
  const geom = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const u = Math.random() * 2 - 1;
      const th = Math.random() * Math.PI * 2;
      const r = Math.sqrt(1 - u * u);
      const R = 380;
      pos[i * 3] = R * r * Math.cos(th);
      pos[i * 3 + 1] = Math.abs(R * u) * 0.6 + 20;
      pos[i * 3 + 2] = R * r * Math.sin(th);
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    return g;
  }, [count]);

  const group = useRef<THREE.Group>(null);
  const mat = useRef<THREE.PointsMaterial>(null);

  useFrame((state) => {
    if (group.current) group.current.position.copy(state.camera.position);
    if (mat.current) mat.current.opacity = THREE.MathUtils.clamp((progressRef.current - 0.3) * 1.6, 0, 1);
  });

  return (
    <group ref={group}>
      <points geometry={geom}>
        <pointsMaterial ref={mat} color="#F4F8FF" size={1.4} sizeAttenuation={false} transparent opacity={0} />
      </points>
    </group>
  );
}

export function Comet({ boostRef }: { boostRef: MutableRefObject<number> }) {
  const head = useRef<THREE.Mesh>(null);
  const t = useRef(0.2);
  const HIST = 36;

  const trailPos = useMemo(() => new Float32Array(HIST * 3), []);
  const trailGeom = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(trailPos, 3));
    return g;
  }, [trailPos]);
  const trail = useMemo(
    () =>
      new THREE.Line(
        trailGeom,
        new THREE.LineBasicMaterial({ color: "#c5e8ff", transparent: true, opacity: 0.85 }),
      ),
    [trailGeom],
  );

  // The "Begin the Journey" button boosts the comet.
  useEffect(() => {
    const on = () => {
      boostRef.current = 1;
    };
    window.addEventListener(EVENTS.comet, on);
    return () => window.removeEventListener(EVENTS.comet, on);
  }, [boostRef]);

  useFrame((state, dt) => {
    const speed = 0.05 + boostRef.current * 0.5;
    boostRef.current = Math.max(0, boostRef.current - dt * 0.6);
    t.current = (t.current + dt * speed) % 1;
    const u = t.current;
    const x = THREE.MathUtils.lerp(-90, 90, u);
    const y = THREE.MathUtils.lerp(55, 18, u);
    const z = state.camera.position.z - 170;

    if (head.current) head.current.position.set(x, y, z);

    trailPos.copyWithin(3, 0, (HIST - 1) * 3);
    trailPos[0] = x;
    trailPos[1] = y;
    trailPos[2] = z;
    trailGeom.attributes.position.needsUpdate = true;
  });

  return (
    <>
      <mesh
        ref={head}
        onClick={(e) => {
          e.stopPropagation();
          boostRef.current = 1;
          emit(EVENTS.toast, { text: "The comet answers. Every journey has a beginning." });
        }}
      >
        <sphereGeometry args={[0.9, 16, 16]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>
      <primitive object={trail} />
    </>
  );
}

/* ---------- Landscape ---------- */

export function Mountains({
  z,
  height,
  color,
  seed,
}: {
  z: number;
  height: number;
  color: string;
  seed: number;
}) {
  const geom = useMemo(() => {
    const N = 160;
    const pos: number[] = [];
    const idx: number[] = [];
    for (let i = 0; i <= N; i++) {
      const x = -220 + (440 * i) / N;
      const top =
        height +
        Math.sin(x * 0.045 + seed) * height * 0.35 +
        Math.sin(x * 0.13 + seed * 2) * height * 0.12 +
        Math.abs(Math.sin(x * 0.02 + seed)) * height * 0.4;
      pos.push(x, top, 0, x, -60, 0);
    }
    for (let i = 0; i < N; i++) {
      const a = i * 2;
      idx.push(a, a + 1, a + 2, a + 1, a + 3, a + 2);
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
    g.setIndex(idx);
    g.computeVertexNormals();
    return g;
  }, [height, seed]);

  return (
    <mesh geometry={geom} position={[0, -2, z]}>
      <meshBasicMaterial color={color} side={THREE.DoubleSide} />
    </mesh>
  );
}

export function City({ z }: { z: number }) {
  const ref = useRef<THREE.InstancedMesh>(null);
  const N = 110;
  const palette = ["#183B70", "#6E65A5", "#2a3b5c", "#F49BC0", "#FFB36A"];

  useEffect(() => {
    const mesh = ref.current;
    if (!mesh) return;
    const m = new THREE.Object3D();
    for (let i = 0; i < N; i++) {
      const side = i % 2 ? 1 : -1;
      const x = side * rand(9, 70);
      const h = rand(4, 34);
      const w = rand(2.5, 6);
      const d = rand(2.5, 6);
      m.position.set(x, h / 2 - 2, z + rand(-28, 28));
      m.scale.set(w, h, d);
      m.updateMatrix();
      mesh.setMatrixAt(i, m.matrix);
      mesh.setColorAt(i, new THREE.Color(palette[i % palette.length]));
    }
    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
    // palette is constant; only z matters for placement
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [z]);

  return (
    <instancedMesh
      ref={ref}
      args={[undefined, undefined, N]}
      onClick={(e) => {
        e.stopPropagation();
        const idx = e.instanceId ?? 0;
        emit(EVENTS.toast, { text: `Tokyo-inspired skyline. ${owner.interests[idx % owner.interests.length]}` });
      }}
    >
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial roughness={0.7} metalness={0.05} emissive="#1b2a4a" emissiveIntensity={0.4} />
    </instancedMesh>
  );
}

export function Ribbon({ z }: { z: number }) {
  const group = useRef<THREE.Group>(null);
  const geom = useMemo(() => {
    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-14, 6, z + 10),
      new THREE.Vector3(-4, 9, z + 4),
      new THREE.Vector3(6, 4, z - 2),
      new THREE.Vector3(14, 8, z - 8),
      new THREE.Vector3(20, 3, z - 16),
    ]);
    return new THREE.TubeGeometry(curve, 120, 0.22, 10, false);
  }, [z]);

  useFrame((state) => {
    if (group.current) group.current.position.y = Math.sin(state.clock.elapsedTime * 0.7) * 0.4;
  });

  return (
    <group
      ref={group}
      onClick={(e) => {
        e.stopPropagation();
        emit(EVENTS.toast, { text: "Some connections don't need a reason." });
      }}
    >
      <mesh geometry={geom}>
        <meshStandardMaterial color="#c0263a" roughness={0.35} emissive="#5a0f1a" emissiveIntensity={0.4} />
      </mesh>
    </group>
  );
}

/* ---------- Railway ---------- */

export function Railway({ z }: { z: number }) {
  const sleepers = useRef<THREE.InstancedMesh>(null);
  const train = useRef<THREE.Group>(null);
  const SL = 150;

  useEffect(() => {
    const mesh = sleepers.current;
    if (!mesh) return;
    const m = new THREE.Object3D();
    for (let i = 0; i < SL; i++) {
      m.position.set(0, -1.9, z + 150 - i * 2);
      m.scale.set(4, 0.2, 0.5);
      m.updateMatrix();
      mesh.setMatrixAt(i, m.matrix);
    }
    mesh.instanceMatrix.needsUpdate = true;
  }, [z]);

  useFrame((state) => {
    if (train.current) {
      train.current.position.z = z + 100 - ((state.clock.elapsedTime * 12) % 240);
    }
  });

  const poles = [0, 1, 2, 3, 4, 5, 6, 7].map((i) => z + 110 - i * 36);

  return (
    <group>
      {/* rails */}
      <mesh position={[-1.1, -1.7, z]}>
        <boxGeometry args={[0.15, 0.15, 300]} />
        <meshStandardMaterial color="#c5d2e6" metalness={0.6} roughness={0.4} />
      </mesh>
      <mesh position={[1.1, -1.7, z]}>
        <boxGeometry args={[0.15, 0.15, 300]} />
        <meshStandardMaterial color="#c5d2e6" metalness={0.6} roughness={0.4} />
      </mesh>
      <instancedMesh ref={sleepers} args={[undefined, undefined, SL]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="#4a3b33" />
      </instancedMesh>

      {/* poles and overhead wires */}
      {poles.map((pz, i) => (
        <group key={i}>
          <mesh position={[-6.5, 4, pz]}>
            <boxGeometry args={[0.3, 8, 0.3]} />
            <meshStandardMaterial color="#2b2f3a" />
          </mesh>
          <mesh position={[6.5, 4, pz]}>
            <boxGeometry args={[0.3, 8, 0.3]} />
            <meshStandardMaterial color="#2b2f3a" />
          </mesh>
          <mesh position={[0, 7.6, pz]}>
            <boxGeometry args={[13, 0.03, 0.03]} />
            <meshBasicMaterial color="#0d1220" />
          </mesh>
        </group>
      ))}

      {/* stations: each one selects a career entry in the Experience section */}
      {experience.map((_, i) => (
        <mesh
          key={i}
          position={[4.5, 1, z + 40 - i * 60]}
          onClick={(e) => {
            e.stopPropagation();
            emit(EVENTS.station, { index: i });
          }}
        >
          <sphereGeometry args={[0.6, 16, 16]} />
          <meshStandardMaterial color="#FFB36A" emissive="#FFB36A" emissiveIntensity={1.2} />
        </mesh>
      ))}

      {/* the train */}
      <group
        ref={train}
        position={[0, 0.2, z]}
        onClick={(e) => {
          e.stopPropagation();
          emit(EVENTS.toast, { text: "The train never really stops. It just waits for you." });
        }}
      >
        <mesh position={[0, 1, 0]}>
          <boxGeometry args={[2.6, 2.4, 12]} />
          <meshStandardMaterial color="#F4F8FF" emissive="#C5E8FF" emissiveIntensity={0.25} />
        </mesh>
        <mesh position={[0, 1.3, 6.02]}>
          <boxGeometry args={[2, 0.8, 0.05]} />
          <meshBasicMaterial color="#183B70" />
        </mesh>
      </group>
    </group>
  );
}

/* ---------- School / blossoms ---------- */

export function Blossoms({ zFrom, zTo, count }: { zFrom: number; zTo: number; count: number }) {
  const geom = useMemo(() => {
    const p = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      p[i * 3] = rand(-16, 16);
      p[i * 3 + 1] = rand(0, 14);
      p[i * 3 + 2] = rand(zTo, zFrom);
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(p, 3));
    return g;
  }, [count, zFrom, zTo]);

  useFrame((state, dt) => {
    const attr = geom.attributes.position as THREE.BufferAttribute;
    const arr = attr.array as Float32Array;
    for (let i = 0; i < count; i++) {
      arr[i * 3 + 1] -= dt * 0.7;
      arr[i * 3] += Math.sin(state.clock.elapsedTime * 0.8 + i) * dt * 0.5;
      if (arr[i * 3 + 1] < -1) arr[i * 3 + 1] = rand(10, 15);
    }
    attr.needsUpdate = true;
  });

  return (
    <points geometry={geom}>
      <pointsMaterial color="#F49BC0" size={0.32} transparent opacity={0.9} depthWrite={false} />
    </points>
  );
}

/* ---------- Constellation ---------- */

export function Constellation3D({ z }: { z: number }) {
  const toV = (s: (typeof skills)[number]) =>
    new THREE.Vector3((s.x / 100 - 0.5) * 30, (0.5 - s.y / 100) * 16 + 4, z - 6);

  const linePts = useMemo(() => {
    const pts: number[] = [];
    skills.forEach((s, i) =>
      s.links.forEach((j) => {
        if (j > i) {
          const a = toV(s);
          const b = toV(skills[j]);
          pts.push(a.x, a.y, a.z, b.x, b.y, b.z);
        }
      }),
    );
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(pts, 3));
    return g;
    // toV depends only on z
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [z]);

  return (
    <>
      <lineSegments geometry={linePts}>
        <lineBasicMaterial color="#c5e8ff" transparent opacity={0.5} />
      </lineSegments>
      {skills.map((s, i) => (
        <mesh
          key={s.name}
          position={toV(s)}
          onClick={(e) => {
            e.stopPropagation();
            emit(EVENTS.skill, { index: i });
          }}
        >
          <sphereGeometry args={[0.45, 16, 16]} />
          <meshBasicMaterial color="#F4F8FF" />
        </mesh>
      ))}
    </>
  );
}

/* ---------- Gallery ---------- */

function titleTexture(title: string, category: string) {
  const c = document.createElement("canvas");
  c.width = 512;
  c.height = 320;
  const g = c.getContext("2d")!;
  const grad = g.createLinearGradient(0, 0, 512, 320);
  grad.addColorStop(0, "rgba(16,22,47,0.92)");
  grad.addColorStop(1, "rgba(24,59,112,0.75)");
  g.fillStyle = grad;
  g.fillRect(0, 0, 512, 320);
  g.strokeStyle = "rgba(244,248,255,0.35)";
  g.lineWidth = 3;
  g.strokeRect(6, 6, 500, 308);
  g.fillStyle = "#FFB36A";
  g.font = "22px sans-serif";
  g.fillText(category.toUpperCase(), 32, 70);
  g.fillStyle = "#F4F8FF";
  g.font = "44px Georgia, serif";
  g.fillText(title.slice(0, 26), 32, 150);
  return new THREE.CanvasTexture(c);
}

function ProjectPane({
  index,
  x,
  z,
  title,
  category,
}: {
  index: number;
  x: number;
  z: number;
  title: string;
  category: string;
}) {
  const tex = useMemo(() => titleTexture(title, category), [title, category]);
  const [hover, setHover] = useState(false);
  return (
    <mesh
      position={[x, 3, z]}
      scale={hover ? 1.08 : 1}
      onPointerOver={() => setHover(true)}
      onPointerOut={() => setHover(false)}
      onClick={(e) => {
        e.stopPropagation();
        emit(EVENTS.project, { index });
      }}
    >
      <planeGeometry args={[6, 3.75]} />
      <meshBasicMaterial map={tex} transparent opacity={hover ? 1 : 0.85} />
    </mesh>
  );
}

export function ProjectPanes({ z }: { z: number }) {
  const n = projects.length;
  return (
    <>
      {projects.map((p, i) => (
        <ProjectPane
          key={p.title}
          index={i}
          x={(i - (n - 1) / 2) * 7.5}
          z={z - 10 - (i % 2) * 3}
          title={p.title}
          category={p.category}
        />
      ))}
    </>
  );
}
