import * as THREE from 'three';
import { ShardNodeData } from '../../types/governance';

// Procedural Radial Contact Shadow Texture
export function createContactShadowTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;

  const gradient = ctx.createRadialGradient(128, 128, 0, 128, 128, 120);
  gradient.addColorStop(0, 'rgba(0, 0, 0, 0.7)');
  gradient.addColorStop(0.3, 'rgba(0, 0, 0, 0.45)');
  gradient.addColorStop(0.7, 'rgba(0, 0, 0, 0.15)');
  gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 256, 256);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

// Procedural Circuit / Technical Foundation Grid Texture
export function createGridTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d')!;

  // Deep tech background
  ctx.fillStyle = '#060814';
  ctx.fillRect(0, 0, 1024, 1024);

  // Grid lines
  ctx.strokeStyle = 'rgba(30, 58, 110, 0.35)';
  ctx.lineWidth = 1.5;
  const step = 64;
  for (let x = 0; x <= 1024; x += step) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, 1024);
    ctx.stroke();
  }
  for (let y = 0; y <= 1024; y += step) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(1024, y);
    ctx.stroke();
  }

  // Major accent coordinates
  ctx.strokeStyle = 'rgba(56, 189, 248, 0.4)';
  ctx.lineWidth = 2.5;
  for (let x = 0; x <= 1024; x += step * 4) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, 1024);
    ctx.stroke();
  }
  for (let y = 0; y <= 1024; y += step * 4) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(1024, y);
    ctx.stroke();
  }

  // Micro circuit dots at intersections
  ctx.fillStyle = 'rgba(96, 165, 250, 0.6)';
  for (let x = 0; x <= 1024; x += step * 2) {
    for (let y = 0; y <= 1024; y += step * 2) {
      ctx.beginPath();
      ctx.arc(x, y, 2.5, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(8, 8);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

// 1. Procedural 10-Part Core Axiom Monolith
export interface AxiomCoreGroup extends THREE.Group {
  updateAnimation: (dt: number, isAuditing: boolean, explodedVal: number) => void;
  crystalMesh: THREE.Mesh;
  gimbal1: THREE.Mesh;
  gimbal2: THREE.Mesh;
  traceBeam: THREE.Line;
  explosionTargets: Array<{ mesh: THREE.Object3D; basePos: THREE.Vector3; explodeDir: THREE.Vector3 }>;
}

export function createAxiomCore(shadowTexture: THREE.CanvasTexture): AxiomCoreGroup {
  const group = new THREE.Group() as AxiomCoreGroup;
  const explosionTargets: Array<{ mesh: THREE.Object3D; basePos: THREE.Vector3; explodeDir: THREE.Vector3 }> = [];

  // 1. Base Pedestal (Beveled 8-sided base flush with ground)
  const baseGeo = new THREE.CylinderGeometry(4.2, 4.8, 0.7, 8);
  const baseMat = new THREE.MeshStandardMaterial({
    color: 0x11162b,
    metalness: 0.85,
    roughness: 0.28,
  });
  const base = new THREE.Mesh(baseGeo, baseMat);
  base.position.y = 0.35;
  base.castShadow = true;
  base.receiveShadow = true;
  group.add(base);
  explosionTargets.push({ mesh: base, basePos: base.position.clone(), explodeDir: new THREE.Vector3(0, -0.2, 0) });

  // 2. Lower Harmonic Channel Ring
  const ringGeo = new THREE.TorusGeometry(3.6, 0.16, 16, 64);
  const ringMat = new THREE.MeshStandardMaterial({
    color: 0x38bdf8,
    emissive: 0x0284c7,
    emissiveIntensity: 0.6,
    metalness: 0.9,
    roughness: 0.15,
  });
  const ring = new THREE.Mesh(ringGeo, ringMat);
  ring.rotation.x = Math.PI / 2;
  ring.position.y = 0.75;
  group.add(ring);
  explosionTargets.push({ mesh: ring, basePos: ring.position.clone(), explodeDir: new THREE.Vector3(0, -0.1, 0) });

  // 3. Four Magnetic Confinement Pillars
  const pillarGeo = new THREE.CylinderGeometry(0.3, 0.42, 5.8, 16);
  const pillarMat = new THREE.MeshStandardMaterial({
    color: 0x1e293b,
    metalness: 0.92,
    roughness: 0.18,
  });

  const pillarAngles = [0, Math.PI / 2, Math.PI, (3 * Math.PI) / 2];
  const radius = 2.8;
  pillarAngles.forEach((ang, idx) => {
    const pillar = new THREE.Mesh(pillarGeo, pillarMat);
    const px = Math.cos(ang) * radius;
    const pz = Math.sin(ang) * radius;
    pillar.position.set(px, 3.6, pz);
    pillar.castShadow = true;
    group.add(pillar);
    const outDir = new THREE.Vector3(Math.cos(ang) * 1.5, 0, Math.sin(ang) * 1.5);
    explosionTargets.push({ mesh: pillar, basePos: pillar.position.clone(), explodeDir: outDir });

    // 8. Glowing Energy Conduits alongside pillars
    const conduitGeo = new THREE.CylinderGeometry(0.08, 0.08, 5.4, 8);
    const conduitMat = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      emissive: 0x0ea5e9,
      emissiveIntensity: 0.8,
      metalness: 0.2,
      roughness: 0.1,
      transparent: true,
      opacity: 0.85,
    });
    const conduit = new THREE.Mesh(conduitGeo, conduitMat);
    conduit.position.set(px * 0.86, 3.6, pz * 0.86);
    group.add(conduit);
    explosionTargets.push({ mesh: conduit, basePos: conduit.position.clone(), explodeDir: outDir.clone().multiplyScalar(0.9) });
  });

  // 4. Central Axiom Crystal (Multi-faceted core with physical transmission)
  const crystalGeo = new THREE.OctahedronGeometry(1.65, 0);
  const crystalMat = new THREE.MeshPhysicalMaterial({
    color: 0x38bdf8,
    emissive: 0x0369a1,
    emissiveIntensity: 0.45,
    metalness: 0.1,
    roughness: 0.08,
    transmission: 0.75,
    ior: 1.6,
    thickness: 1.4,
    transparent: true,
    opacity: 0.92,
  });
  const crystal = new THREE.Mesh(crystalGeo, crystalMat);
  crystal.position.y = 3.6;
  crystal.castShadow = true;
  group.add(crystal);
  group.crystalMesh = crystal;
  explosionTargets.push({ mesh: crystal, basePos: crystal.position.clone(), explodeDir: new THREE.Vector3(0, 0.4, 0) });

  // 5. Nested Inner Logic Prism
  const innerPrismGeo = new THREE.IcosahedronGeometry(0.8, 0);
  const innerPrismMat = new THREE.MeshStandardMaterial({
    color: 0x67e8f9,
    emissive: 0x38bdf8,
    emissiveIntensity: 1.2,
    metalness: 0.6,
    roughness: 0.2,
  });
  const innerPrism = new THREE.Mesh(innerPrismGeo, innerPrismMat);
  innerPrism.position.y = 3.6;
  group.add(innerPrism);

  // 6. Double Orbital Telemetry Gimbal Rings (brushed titanium/gold)
  const gimbalGeo1 = new THREE.TorusGeometry(2.3, 0.07, 16, 64);
  const gimbalMat1 = new THREE.MeshStandardMaterial({
    color: 0xf59e0b,
    metalness: 0.95,
    roughness: 0.15,
  });
  const gimbal1 = new THREE.Mesh(gimbalGeo1, gimbalMat1);
  gimbal1.position.y = 3.6;
  group.add(gimbal1);
  group.gimbal1 = gimbal1;
  explosionTargets.push({ mesh: gimbal1, basePos: gimbal1.position.clone(), explodeDir: new THREE.Vector3(0, 0.8, 0) });

  const gimbalGeo2 = new THREE.TorusGeometry(2.7, 0.06, 16, 64);
  const gimbalMat2 = new THREE.MeshStandardMaterial({
    color: 0x94a3b8,
    metalness: 0.9,
    roughness: 0.2,
  });
  const gimbal2 = new THREE.Mesh(gimbalGeo2, gimbalMat2);
  gimbal2.position.y = 3.6;
  group.add(gimbal2);
  group.gimbal2 = gimbal2;
  explosionTargets.push({ mesh: gimbal2, basePos: gimbal2.position.clone(), explodeDir: new THREE.Vector3(0, 1.2, 0) });

  // 7. Collimator Fins (Upper assembly)
  const finGeo = new THREE.BoxGeometry(2.4, 0.08, 0.6);
  const finMat = new THREE.MeshStandardMaterial({
    color: 0x334155,
    metalness: 0.8,
    roughness: 0.35,
  });
  [0, Math.PI / 2].forEach((rot) => {
    const fin = new THREE.Mesh(finGeo, finMat);
    fin.position.y = 6.6;
    fin.rotation.y = rot;
    group.add(fin);
    explosionTargets.push({ mesh: fin, basePos: fin.position.clone(), explodeDir: new THREE.Vector3(0, 1.6, 0) });
  });

  // 9. Radial Contact Shadow Plane directly beneath
  const shadowGeo = new THREE.PlaneGeometry(11, 11);
  const shadowMat = new THREE.MeshBasicMaterial({
    map: shadowTexture,
    transparent: true,
    opacity: 0.55,
    depthWrite: false,
  });
  const shadowPlane = new THREE.Mesh(shadowGeo, shadowMat);
  shadowPlane.rotation.x = -Math.PI / 2;
  shadowPlane.position.y = 0.02; // Prevents Z-fighting
  group.add(shadowPlane);

  // 10. Emitter Apex Beacon (Diagnostic trace receiver)
  const beaconGeo = new THREE.ConeGeometry(0.4, 0.8, 16);
  const beaconMat = new THREE.MeshStandardMaterial({
    color: 0x38bdf8,
    emissive: 0x0284c7,
    emissiveIntensity: 1.0,
    metalness: 0.5,
    roughness: 0.2,
  });
  const beacon = new THREE.Mesh(beaconGeo, beaconMat);
  beacon.position.y = 7.1;
  beacon.rotation.x = Math.PI;
  group.add(beacon);
  explosionTargets.push({ mesh: beacon, basePos: beacon.position.clone(), explodeDir: new THREE.Vector3(0, 2.0, 0) });

  // Vertical trace diagnostic guide line
  const lineGeo = new THREE.BufferGeometry().setFromPoints([
    new THREE.Vector3(0, 7.1, 0),
    new THREE.Vector3(0, 18, 0),
  ]);
  const lineMat = new THREE.LineBasicMaterial({
    color: 0x38bdf8,
    transparent: true,
    opacity: 0.4,
  });
  const traceBeam = new THREE.Line(lineGeo, lineMat);
  group.add(traceBeam);
  group.traceBeam = traceBeam;

  group.explosionTargets = explosionTargets;

  group.updateAnimation = (dt: number, isAuditing: boolean, explodedVal: number) => {
    const spinMultiplier = isAuditing ? 3.0 : 1.0;
    crystal.rotation.y += 0.8 * dt * spinMultiplier;
    crystal.rotation.x += 0.4 * dt * spinMultiplier;
    innerPrism.rotation.y -= 1.2 * dt * spinMultiplier;

    gimbal1.rotation.x += 0.6 * dt * spinMultiplier;
    gimbal1.rotation.y += 0.4 * dt * spinMultiplier;

    gimbal2.rotation.y -= 0.5 * dt * spinMultiplier;
    gimbal2.rotation.z += 0.7 * dt * spinMultiplier;

    // Apply exploded view damping
    explosionTargets.forEach((target) => {
      target.mesh.position.lerp(
        target.basePos.clone().addScaledVector(target.explodeDir, explodedVal * 2.2),
        0.1
      );
    });
  };

  return group;
}

// 2. Procedural 5-Part Regional Shard Node
export interface ShardGroup extends THREE.Group {
  shardData: ShardNodeData;
  updateAnimation: (dt: number, isSelected: boolean) => void;
  vaultMesh: THREE.Mesh;
  haloRing: THREE.Mesh;
}

export function createRegionalShard(
  data: ShardNodeData,
  shadowTexture: THREE.CanvasTexture
): ShardGroup {
  const group = new THREE.Group() as ShardGroup;
  group.shardData = data;
  group.position.set(...data.position);

  // 1. Stepped Hexagonal Foundation Pad
  const padGeo = new THREE.CylinderGeometry(1.6, 1.9, 0.35, 6);
  const padMat = new THREE.MeshStandardMaterial({
    color: 0x1e293b,
    metalness: 0.8,
    roughness: 0.3,
  });
  const pad = new THREE.Mesh(padGeo, padMat);
  pad.position.y = 0.175;
  pad.castShadow = true;
  pad.receiveShadow = true;
  group.add(pad);

  // 2. Encrypted SQLite Vault Cylinder (AES-GCM Local Vault)
  const vaultGeo = new THREE.CylinderGeometry(0.9, 0.9, 1.8, 16);
  const vaultMat = new THREE.MeshStandardMaterial({
    color: 0x0f172a,
    metalness: 0.9,
    roughness: 0.15,
  });
  const vault = new THREE.Mesh(vaultGeo, vaultMat);
  vault.position.y = 1.25;
  vault.castShadow = true;
  group.add(vault);
  group.vaultMesh = vault;

  // 3. Cooling Radiator Fins (Topographical thermal balance)
  const radGeo = new THREE.BoxGeometry(2.1, 0.05, 0.4);
  const radMat = new THREE.MeshStandardMaterial({
    color: 0x3b82f6,
    emissive: 0x1d4ed8,
    emissiveIntensity: 0.4,
    metalness: 0.85,
    roughness: 0.2,
  });
  for (let i = 0; i < 3; i++) {
    const fin = new THREE.Mesh(radGeo, radMat);
    fin.position.y = 0.6 + i * 0.45;
    group.add(fin);
  }

  // 4. Delta Relay Spire / Antenna
  const spireGeo = new THREE.CylinderGeometry(0.04, 0.12, 1.6, 8);
  const spireMat = new THREE.MeshStandardMaterial({
    color: 0xe2e8f0,
    metalness: 0.95,
    roughness: 0.1,
  });
  const spire = new THREE.Mesh(spireGeo, spireMat);
  spire.position.y = 2.95;
  group.add(spire);

  // 5. Holographic Status Beacon Halo
  const haloGeo = new THREE.TorusGeometry(1.2, 0.04, 16, 32);
  const haloMat = new THREE.MeshStandardMaterial({
    color: 0x10b981,
    emissive: 0x059669,
    emissiveIntensity: 0.8,
    metalness: 0.3,
    roughness: 0.1,
  });
  const halo = new THREE.Mesh(haloGeo, haloMat);
  halo.rotation.x = Math.PI / 2;
  halo.position.y = 2.4;
  group.add(halo);
  group.haloRing = halo;

  // Contact Shadow Plane beneath shard
  const shadowGeo = new THREE.PlaneGeometry(4.5, 4.5);
  const shadowMat = new THREE.MeshBasicMaterial({
    map: shadowTexture,
    transparent: true,
    opacity: 0.5,
    depthWrite: false,
  });
  const shadowPlane = new THREE.Mesh(shadowGeo, shadowMat);
  shadowPlane.rotation.x = -Math.PI / 2;
  shadowPlane.position.y = 0.02;
  group.add(shadowPlane);

  group.updateAnimation = (dt: number, isSelected: boolean) => {
    halo.rotation.z += 1.5 * dt;
    halo.scale.setScalar(isSelected ? 1.25 : 1.0);
    // Tint based on alert or normal
    if (data.vaultStatus === 'divergence_alert') {
      (halo.material as THREE.MeshStandardMaterial).color.setHex(0xef4444);
      (halo.material as THREE.MeshStandardMaterial).emissive.setHex(0xdc2626);
    } else {
      (halo.material as THREE.MeshStandardMaterial).color.setHex(0x10b981);
      (halo.material as THREE.MeshStandardMaterial).emissive.setHex(0x059669);
    }
  };

  return group;
}

// 3. Instanced Edge SQLite Vault Nodes (Scattered throughout the grid)
export function createInstancedEdgeNodes(count: number): THREE.InstancedMesh {
  const geo = new THREE.BoxGeometry(0.3, 0.5, 0.3);
  const mat = new THREE.MeshStandardMaterial({
    color: 0x38bdf8,
    emissive: 0x0369a1,
    emissiveIntensity: 0.35,
    metalness: 0.8,
    roughness: 0.25,
  });

  const instancedMesh = new THREE.InstancedMesh(geo, mat, count);
  const dummy = new THREE.Object3D();
  const radiusRange = [9, 24];

  for (let i = 0; i < count; i++) {
    const angle = (i / count) * Math.PI * 2 + (Math.random() - 0.5) * 0.4;
    const dist = radiusRange[0] + Math.random() * (radiusRange[1] - radiusRange[0]);
    dummy.position.set(Math.cos(angle) * dist, 0.25, Math.sin(angle) * dist);
    dummy.rotation.y = Math.random() * Math.PI;
    const scale = 0.7 + Math.random() * 0.5;
    dummy.scale.set(scale, scale, scale);
    dummy.updateMatrix();
    instancedMesh.setMatrixAt(i, dummy.matrix);
  }

  instancedMesh.instanceMatrix.needsUpdate = true;
  instancedMesh.computeBoundingSphere();
  instancedMesh.castShadow = true;
  instancedMesh.receiveShadow = true;
  return instancedMesh;
}
