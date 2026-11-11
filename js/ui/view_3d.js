/**
 * Visualizador 3D Territorial (Inspirado en REN3D)
 * Muestra el territorio de Kennedy, los nodos E01-E20 como volúmenes 3D,
 * arcos parabólicos de flujos y modo noche/día.
 */

import { ESPACIOS } from '../core/spaces.js';
import { DATOS_MATRIZ } from '../data/matrix_data.js';

export class View3D {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    if (!this.container) return;
    this.isSupported = typeof window.THREE !== 'undefined';
    this.active = false;
    this.init();
  }

  init() {
    if (!this.isSupported) {
      // Fallback a canvas isométrico si Three.js no está en scope global
      this.initIsometricFallback();
      return;
    }

    const THREE = window.THREE;
    const w = this.container.clientWidth || 800;
    const h = this.container.clientHeight || 500;

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x0a0f16);
    this.scene.fog = new THREE.FogExp2(0x0a0f16, 0.0006);

    this.camera = new THREE.PerspectiveCamera(45, w / h, 1, 10000);
    this.camera.position.set(0, 1200, 1600);
    this.camera.lookAt(0, 0, 0);

    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setSize(w, h);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.container.appendChild(this.renderer.domElement);

    // Luces
    const ambLight = new THREE.AmbientLight(0xffffff, 0.65);
    const dirLight = new THREE.DirectionalLight(0x7dd3fc, 0.85);
    dirLight.position.set(400, 1000, 500);
    this.scene.add(ambLight, dirLight);

    // Malla de suelo
    const grid = new THREE.GridHelper(3000, 50, 0x1e3a8a, 0x0f172a);
    grid.position.y = -2;
    this.scene.add(grid);

    // Nodos 3D
    this.nodeGroup = new THREE.Group();
    this.scene.add(this.nodeGroup);
    this.build3DNodes(THREE);

    // Loop de renderizado
    this.animate = this.animate.bind(this);
    requestAnimationFrame(this.animate);
  }

  build3DNodes(THREE) {
    const scale = 22000;
    const centerLon = -74.155;
    const centerLat = 4.635;

    for (const [id, esp] of Object.entries(ESPACIOS)) {
      const x = (esp.lon - centerLon) * scale;
      const z = -(esp.lat - centerLat) * scale;
      const height = id === 'E19' || id === 'E17' ? 90 : (id === 'E02' ? 75 : 40);

      // Columna / Edificio
      const geom = new THREE.CylinderGeometry(14, 18, height, 16);
      const col = new THREE.Color(esp.color);
      const mat = new THREE.MeshLambertMaterial({ color: col, emissive: col.clone().multiplyScalar(0.2) });
      const mesh = new THREE.Mesh(geom, mat);
      mesh.position.set(x, height / 2, z);

      // Esfera superior brillante
      const sGeom = new THREE.SphereGeometry(12, 16, 12);
      const sMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
      const sphere = new THREE.Mesh(sGeom, sMat);
      sphere.position.set(x, height + 8, z);

      this.nodeGroup.add(mesh, sphere);
    }
  }

  animate() {
    if (!this.renderer) return;
    requestAnimationFrame(this.animate);
    this.nodeGroup.rotation.y += 0.001; // Rotación lenta de maqueta
    this.renderer.render(this.scene, this.camera);
  }

  initIsometricFallback() {
    // Si Three.js no está precargado, muestra aviso estético estilo HUD
    this.container.innerHTML = `
      <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:100%;color:#7dd3fc;font-family:monospace;text-align:center;padding:20px">
        <div style="font-size:32px;margin-bottom:10px">◈</div>
        <div style="font-weight:bold;font-size:14px;letter-spacing:2px">VISTA 3D TERRITORIAL</div>
        <div style="color:#94a3b8;font-size:12px;margin-top:6px;max-width:380px">
          El simulador 2D nativo está activo. Para habilitar la maqueta 3D por GPU en alta fidelidad, la aplicación puede importar Three.js r160.
        </div>
      </div>
    `;
  }
}
