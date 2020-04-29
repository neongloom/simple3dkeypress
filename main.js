import * as THREE from './build/three.module.js';

import Stats from './jsm/stats.module.js';

import { OrbitControls } from './jsm/OrbitControls.js';
import { GLTFLoader } from './jsm/GLTFLoader.js';
import { DRACOLoader } from './jsm/DRACOLoader.js';

let stats, controls;
let renderer, scene, camera;
let clock = new THREE.Clock();

let mouse = new THREE.Vector2(),
  INTERSECTED;
let raycaster;
let model;

let mixer;

init();
animate();

function init() {
  const container = document.querySelector('#container');
  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.physicallyCorrectLights = true;
  renderer.renderReverseSided = true;

  renderer.outputEncoding = THREE.sRGBEncoding;
  container.appendChild(renderer.domElement);

  stats = new Stats();
  container.appendChild(stats.dom);

  // camera
  camera = new THREE.PerspectiveCamera(
    45,
    window.innerWidth / window.innerHeight,
    0.1,
    90
  );
  camera.position.set(0, 7, 0);
  camera.lookAt(new THREE.Vector3(0, 0, 0));

  scene = new THREE.Scene();
  scene.background = new THREE.Color(0xffffff);
  // scene.fog = new THREE.Fog(0xffffff, 15, 52);
  // scene.fog = new THREE.FogExp2(0xffffff, 0.03);

  let light = new THREE.HemisphereLight(0xafafaf, 0x101010, 1.0); // sky color, ground color, intensity
  light.position.set(0, 8, 0);
  scene.add(light);

  light = new THREE.DirectionalLight(0xb59fa0);
  light.intensity = 2;
  light.position.set(-3, 8, 2);
  light.target.position.set(0, 0, 0);
  light.castShadow = true;

  // light.shadow.bias = -0.001;
  light.shadow.mapSize.width = 2048;
  light.shadow.mapSize.height = 2048;
  light.shadow.camera.near = 0.1;
  light.shadow.camera.far = 20;
  light.shadow.radius = 5;
  light.decay = 2;

  // light.shadow.camera.top = 10;
  // light.shadow.camera.bottom = -10;
  // light.shadow.camera.left = -10;
  // light.shadow.camera.right = 10;

  scene.add(light);
  // scene.add(light.target);

  let keyMat = new THREE.MeshStandardMaterial({
    color: 0x1a342a,
    metalness: 0,
    roughness: 1
  });

  // ground
  let ground = new THREE.Mesh(new THREE.PlaneBufferGeometry(20, 20), keyMat);
  ground.rotation.x = -Math.PI / 2;
  scene.add(ground);
  ground.receiveShadow = true;

  let gltfLoader = new GLTFLoader();

  gltfLoader.load('sa_keycap-7deg.glb', gltf => {
    model = gltf.scene;
    model.rotation.y = Math.PI;
    scene.add(model);

    model.scale.set(1, 1, 1);
    model.traverse(obj => {
      if (obj.castShadow !== undefined) {
        obj.castShadow = true;
        obj.receiveShadow = true;
        // obj.material = keyMat;
        // obj.material.color = 0xffff00;
        // obj.material = new THREE.MeshNormalMaterial();
      }
      // if (obj.isMesh) {
      //   roughnessMipmapper.generateMipmaps(obj.material);
      // }
    });
    // roughnessMipmapper.dispose();
  });

  renderer.shadowMap.enabled = true;
  // renderer.shadowMap.type = THREE.VSMShadowMap;
  renderer.shadowMap.type = THREE.PCFShadowMap;
  // renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.shadowMapSoft = true;

  // for accurate colors
  renderer.gammaFactor = 2.2;
  renderer.gammaOutput = true;

  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.0;

  controls = new OrbitControls(camera, renderer.domElement);
  controls.target.set(0, 0, 0);
  controls.update();

  raycaster = new THREE.Raycaster();

  window.addEventListener('resize', onWindowResize, false);
  window.addEventListener('keydown', keyDown, false);
  window.addEventListener('keyup', keyUp, false);
  // window.addEventListener('mousemove', onDocumentMouseMove, false);
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

function keyDown(e) {
  const key = e.key;
  if (key == 'Enter') {
    model.traverse(obj => {
      if (obj.name == 'sa_low') obj.position.y -= 0.1;
    });
  }
  console.log(key);
}
function keyUp(e) {
  const key = e.key;
  if (key == 'Enter') {
    model.traverse(obj => {
      if (obj.name == 'sa_low') obj.position.y += 0.1;
    });
  }
  console.log(key);
}

function animate() {
  requestAnimationFrame(animate);

  let delta = clock.getDelta();

  // controls.update(delta);
  stats.update();

  renderer.render(scene, camera);
  // render();
}

// let selectedObject = null;

function onDocumentMouseMove(event) {
  event.preventDefault();

  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
}

function onMouseDown(e) {
  e.preventDefault();
}

function onMouseUp(e) {
  e.preventDefault();
}

// function render() {
//   camera.updateMatrixWorld();
//   raycaster.setFromCamera(mouse, camera);

//   let intersects = raycaster.intersectObjects(scene.children, true);
//   // let intersects = raycaster.intersectObject('case', true);

//   if (intersects.length > 0) {
//     console.log(intersects[0]);
//     if (
//       INTERSECTED != intersects[0].object &&
//       intersects[0].object.name[0] == 'k'
//     ) {
//       if (INTERSECTED) {
//         // INTERSECTED.material.emissive.setHex(INTERSECTED.currentHex);
//         INTERSECTED.rotation.x -= 0.1;
//       }

//       INTERSECTED = intersects[0].object;
//       INTERSECTED.currentHex = INTERSECTED.material.emissive.getHex();
//       // INTERSECTED.material.emissive.setHex(0xff0000);

//       INTERSECTED.rotation.x += 0.1;
//     }
//   } else {
//     if (INTERSECTED) {
//       // INTERSECTED.material.emissive.setHex(INTERSECTED.currentHex);
//       INTERSECTED.rotation.x -= 0.1;
//     }

//     INTERSECTED = null;
//   }
//   renderer.render(scene, camera);
// }

// function getIntersects(x, y) {
//   x = (x / window.innerWidth) * 2 - 1;
//   y = -(y / window.innerHeight) * 2 + 1;

//   mouseVector.set(x, y, 0.5);
//   raycaster.setFromCamera(mouseVector, camera);

//   return raycaster.intersectObject(group, true);
// }
