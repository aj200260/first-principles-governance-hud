import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import {
  createAxiomCore,
  createRegionalShard,
  createInstancedEdgeNodes,
  createContactShadowTexture,
  createGridTexture,
  AxiomCoreGroup,
  ShardGroup,
} from './proceduralModels';
import { ShardNodeData } from '../../types/governance';

// Module-scope scratch variables for zero GC in render loop
const _vec3 = new THREE.Vector3();
const _targetCamPos = new THREE.Vector3();
const _targetLookAt = new THREE.Vector3();
const _mouse = new THREE.Vector2();
const _raycaster = new THREE.Raycaster();

interface GovernanceSceneProps {
  shards: ShardNodeData[];
  selectedShardId: string | null;
  onSelectShard: (shard: ShardNodeData | null) => void;
  isAuditing: boolean;
  explodedValue: number;
  activeCameraTarget: 'core' | 'all' | 'shard';
  divergenceAlertNode: string | null;
  showHeatmap?: boolean;
  thermalMode?: 'sharded-optimal' | 'centralized-bottleneck' | 'grid-curtailment';
  zkSyncActive?: boolean;
}

export const GovernanceScene: React.FC<GovernanceSceneProps> = ({
  shards,
  selectedShardId,
  onSelectShard,
  isAuditing,
  explodedValue,
  activeCameraTarget,
  divergenceAlertNode,
  showHeatmap = false,
  thermalMode = 'sharded-optimal',
  zkSyncActive = false,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);

  // Store mutable refs to avoid recreating the Three.js scene
  const sceneStateRef = useRef<{
    scene: THREE.Scene;
    camera: THREE.PerspectiveCamera;
    renderer: THREE.WebGLRenderer;
    controls: OrbitControls;
    axiomCore: AxiomCoreGroup;
    shardGroups: ShardGroup[];
    deltaParticles: THREE.Points;
    traceSplineMesh: THREE.Line | null;
    activeBeamPoints: THREE.Vector3[];
    isAuditing: boolean;
    explodedValue: number;
    selectedShardId: string | null;
    cameraTarget: 'core' | 'all' | 'shard';
    showHeatmap: boolean;
    thermalMode: string;
    zkSyncActive: boolean;
  }>({} as any);

  // Update refs when props change
  useEffect(() => {
    sceneStateRef.current.isAuditing = isAuditing;
    sceneStateRef.current.explodedValue = explodedValue;
    sceneStateRef.current.selectedShardId = selectedShardId;
    sceneStateRef.current.cameraTarget = activeCameraTarget;
    sceneStateRef.current.showHeatmap = showHeatmap;
    sceneStateRef.current.thermalMode = thermalMode;
    sceneStateRef.current.zkSyncActive = zkSyncActive;
  }, [isAuditing, explodedValue, selectedShardId, activeCameraTarget, showHeatmap, thermalMode, zkSyncActive]);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // 1. Scene Setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x060814);
    scene.fog = new THREE.FogExp2(0x060814, 0.016);

    // 2. Camera Setup
    const camera = new THREE.PerspectiveCamera(
      45,
      container.clientWidth / container.clientHeight,
      0.1,
      1000
    );
    camera.position.set(0, 18, 34);

    // 3. Renderer Setup (Three.js skill mandates)
    const isHeadless = navigator.webdriver || /HeadlessChrome/i.test(navigator.userAgent);
    const renderer = new THREE.WebGLRenderer({
      antialias: !isHeadless,
      powerPreference: 'high-performance',
      alpha: false,
    });
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    renderer.setPixelRatio(isHeadless ? 1 : Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = !isHeadless;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.setSize(container.clientWidth, container.clientHeight);
    container.appendChild(renderer.domElement);

    // 4. Studio Environment Reflection (RoomEnvironment + PMREMGenerator)
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
    pmremGenerator.dispose();

    // 5. OrbitControls with Damping
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxPolarAngle = Math.PI / 2 - 0.04; // Don't dip below floor
    controls.minDistance = 6;
    controls.maxDistance = 75;
    controls.target.set(0, 3.2, 0);
    let isUserInteracting = false;
    controls.addEventListener('start', () => {
      isUserInteracting = true;
    });
    controls.addEventListener('end', () => {
      isUserInteracting = false;
    });
    const keyLight = new THREE.DirectionalLight(0xffe8d6, 2.6);
    keyLight.position.set(16, 28, 18);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 2048;
    keyLight.shadow.mapSize.height = 2048;
    keyLight.shadow.camera.near = 0.5;
    keyLight.shadow.camera.far = 70;
    const d = 26;
    keyLight.shadow.camera.left = -d;
    keyLight.shadow.camera.right = d;
    keyLight.shadow.camera.top = d;
    keyLight.shadow.camera.bottom = -d;
    keyLight.shadow.bias = -0.0004;
    keyLight.shadow.normalBias = 0.02;
    scene.add(keyLight);

    const fillLight = new THREE.HemisphereLight(0x60a5fa, 0x0f172a, 1.4);
    scene.add(fillLight);

    const rimLight = new THREE.DirectionalLight(0x38bdf8, 1.8);
    rimLight.position.set(-18, 14, -18);
    scene.add(rimLight);

    // 7. Ground Foundation with Procedural Grid Texture
    const shadowTexture = createContactShadowTexture();
    const gridTexture = createGridTexture();
    const floorGeo = new THREE.PlaneGeometry(160, 160);
    const floorMat = new THREE.MeshStandardMaterial({
      map: gridTexture,
      roughness: 0.85,
      metalness: 0.25,
    });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = 0;
    floor.receiveShadow = true;
    scene.add(floor);

    // 8. Central 10-Part Core Axiom Monolith
    const axiomCore = createAxiomCore(shadowTexture);
    scene.add(axiomCore);

    // 9. Regional Shards
    const shardGroups: ShardGroup[] = [];
    shards.forEach((s) => {
      const shardGroup = createRegionalShard(s, shadowTexture);
      scene.add(shardGroup);
      shardGroups.push(shardGroup);
    });

    // 10. Instanced Edge SQLite Vaults
    const edgeVaults = createInstancedEdgeNodes(48);
    scene.add(edgeVaults);

    // 11. Cryptographic Delta Conduits (Bezier curves connecting Shards to Core)
    const deltaCount = 180;
    const deltaGeo = new THREE.BufferGeometry();
    const deltaPositions = new Float32Array(deltaCount * 3);
    const deltaSpeeds = new Float32Array(deltaCount);
    const deltaProgress = new Float32Array(deltaCount);
    const deltaShardIndices = new Int32Array(deltaCount);

    for (let i = 0; i < deltaCount; i++) {
      deltaProgress[i] = Math.random();
      deltaSpeeds[i] = 0.2 + Math.random() * 0.4;
      deltaShardIndices[i] = Math.floor(Math.random() * shards.length);
    }

    deltaGeo.setAttribute('position', new THREE.BufferAttribute(deltaPositions, 3));
    const deltaMat = new THREE.PointsMaterial({
      color: 0x38bdf8,
      size: 0.28,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending,
    });
    const deltaParticles = new THREE.Points(deltaGeo, deltaMat);
    scene.add(deltaParticles);

    // 12. Dynamic Traceback Beam (reverse diagnostic loop from shard to core)
    const traceSplineGeo = new THREE.BufferGeometry();
    const traceSplineMat = new THREE.LineBasicMaterial({
      color: 0x38bdf8,
      linewidth: 3,
      transparent: true,
      opacity: 0.0, // hidden until active
    });
    const traceSplineMesh = new THREE.Line(traceSplineGeo, traceSplineMat);
    scene.add(traceSplineMesh);

    // 13. Pre-compile Shaders
    renderer.compile(scene, camera);

    // Store state in ref
    sceneStateRef.current = {
      scene,
      camera,
      renderer,
      controls,
      axiomCore,
      shardGroups,
      deltaParticles,
      traceSplineMesh,
      activeBeamPoints: [],
      isAuditing,
      explodedValue,
      selectedShardId,
      cameraTarget: activeCameraTarget,
      showHeatmap,
      thermalMode,
      zkSyncActive,
    };

    // 14. Raycasting Interaction
    let hoveredMesh: THREE.Object3D | null = null;
    const handlePointerMove = (e: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      _mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      _mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
    };

    const handleClick = (e: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      _mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      _mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      _raycaster.setFromCamera(_mouse, camera);
      const intersects = _raycaster.intersectObjects(shardGroups, true);

      if (intersects.length > 0) {
        // Find parent ShardGroup
        let curr: THREE.Object3D | null = intersects[0].object;
        while (curr && !(curr as ShardGroup).shardData) {
          curr = curr.parent;
        }
        if (curr && (curr as ShardGroup).shardData) {
          onSelectShard((curr as ShardGroup).shardData);
          return;
        }
      }

      // If clicked on Core Axiom
      const coreIntersects = _raycaster.intersectObjects([axiomCore], true);
      if (coreIntersects.length > 0) {
        onSelectShard(null);
      }
    };

    window.addEventListener('pointermove', handlePointerMove);
    renderer.domElement.addEventListener('click', handleClick);

    // Resize Handler
    const handleResize = () => {
      if (!container) return;
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    };
    window.addEventListener('resize', handleResize);

    // 15. Animation Loop
    let clock = new THREE.Clock();
    let animationFrameId: number;

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const dt = clock.getDelta();
      const state = sceneStateRef.current;

      // Update Core Axiom animation
      axiomCore.updateAnimation(dt, state.isAuditing, state.explodedValue);

      // Update Regional Shard animations with thermal heatmap controls
      shardGroups.forEach((sg) => {
        const isSelected = sg.shardData.id === state.selectedShardId;
        sg.updateAnimation(dt, isSelected, state.showHeatmap, state.thermalMode);
      });

      // Update particle conduit color based on ZK sync or regular
      if (state.zkSyncActive) {
        (deltaParticles.material as THREE.PointsMaterial).color.setHex(0xf59e0b);
      } else {
        (deltaParticles.material as THREE.PointsMaterial).color.setHex(0x38bdf8);
      }

      // Update Delta Conduit particle streams
      const posAttr = deltaGeo.attributes.position as THREE.BufferAttribute;
      const speedMult = state.zkSyncActive ? 3.5 : state.isAuditing ? 2.5 : 1.0;
      for (let i = 0; i < deltaCount; i++) {
        deltaProgress[i] = (deltaProgress[i] + deltaSpeeds[i] * dt * speedMult) % 1;
        const shardIdx = deltaShardIndices[i];
        const shard = shards[shardIdx];
        if (!shard) continue;

        // Quadratic Bezier interpolation from shard -> core apex
        const t = deltaProgress[i];
        const sx = shard.position[0];
        const sz = shard.position[2];
        const cx = sx * 0.4;
        const cz = sz * 0.4;
        const cy = 6.5;

        // B(t) = (1-t)^2 P0 + 2(1-t)t P1 + t^2 P2
        const invT = 1 - t;
        const px = invT * invT * sx + 2 * invT * t * cx + t * t * 0;
        const py = invT * invT * 1.5 + 2 * invT * t * cy + t * t * 3.6;
        const pz = invT * invT * sz + 2 * invT * t * cz + t * t * 0;

        posAttr.setXYZ(i, px, py, pz);
      }
      posAttr.needsUpdate = true;

      // Update Traceback Diagnostic Beam when auditing
      if (state.isAuditing || state.selectedShardId) {
        const targetShard = shards.find((s) => s.id === (state.selectedShardId || shards[0].id));
        if (targetShard) {
          const curve = new THREE.CatmullRomCurve3([
            new THREE.Vector3(targetShard.position[0], 2.8, targetShard.position[2]),
            new THREE.Vector3(targetShard.position[0] * 0.4, 7.5, targetShard.position[2] * 0.4),
            new THREE.Vector3(0, 7.1, 0),
          ]);
          const pts = curve.getPoints(36);
          traceSplineMesh.geometry.setFromPoints(pts);
          (traceSplineMesh.material as THREE.LineBasicMaterial).opacity = state.isAuditing ? 0.9 : 0.45;
          (traceSplineMesh.material as THREE.LineBasicMaterial).color.setHex(state.isAuditing ? 0xf59e0b : 0x38bdf8);
        }
      } else {
        (traceSplineMesh.material as THREE.LineBasicMaterial).opacity = 0;
      }

      // Smooth camera presets interpolation
      if (state.cameraTarget === 'core') {
        _targetCamPos.set(0, 9, 16);
        _targetLookAt.set(0, 3.6, 0);
      } else if (state.cameraTarget === 'shard') {
        const activeShard = shards.find((s) => s.id === state.selectedShardId) || shards[0];
        _targetCamPos.set(activeShard.position[0] + 6, 6, activeShard.position[2] + 8);
        _targetLookAt.set(activeShard.position[0], 2.0, activeShard.position[2]);
      } else {
        _targetCamPos.set(0, 20, 36);
        _targetLookAt.set(0, 3.2, 0);
      }

      // Smooth camera movement towards targets if user isn't actively dragging
      if (!isUserInteracting) {
        camera.position.lerp(_targetCamPos, 0.04);
        controls.target.lerp(_targetLookAt, 0.04);
      }

      controls.update();
      renderer.render(scene, camera);
    };

    animate();

    // Cleanup on unmount
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('pointermove', handlePointerMove);
      renderer.domElement.removeEventListener('click', handleClick);
      window.removeEventListener('resize', handleResize);
      controls.dispose();
      renderer.dispose();
      container.innerHTML = '';
    };
  }, [shards]);

  return (
    <div className="relative w-full h-full select-none overflow-hidden bg-slate-950">
      {/* 3D WebGL Canvas container */}
      <div ref={mountRef} className="absolute inset-0 w-full h-full cursor-grab active:cursor-grabbing" />
    </div>
  );
};
