let scene, camera, renderer;
const REF_LAT = 30.1219, REF_LON = 31.4056; // القاهرة كمرجع

function initWorld() {
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x87ceeb);
  scene.fog = new THREE.Fog(0x87ceeb, 5000, 50000);

  camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 100000);

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.shadowMap.enabled = true;
  document.body.appendChild(renderer.domElement);

  // إضاءة
  const sun = new THREE.DirectionalLight(0xffffff, 1);
  sun.position.set(1000, 2000, 1000);
  sun.castShadow = true;
  scene.add(sun);
  scene.add(new THREE.AmbientLight(0xffffff, 0.5));

  // أرضية (صحراء)
  const groundGeo = new THREE.PlaneGeometry(200000, 200000, 100, 100);
  const groundMat = new THREE.MeshStandardMaterial({ color: 0xc2b280 });
  const ground = new THREE.Mesh(groundGeo, groundMat);
  ground.rotation.x = -Math.PI / 2;
  ground.receiveShadow = true;
  scene.add(ground);

  // بناء المطارات
  Object.values(AIRPORTS).forEach(airport => buildAirport(airport));

  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });
}

function buildAirport(airport) {
  const pos = latLonTo3D(airport.lat, airport.lon, REF_LAT, REF_LON);
  const group = new THREE.Group();
  group.position.copy(pos);
  group.position.y = airport.elevation;
  group.rotation.y = -airport.runway.heading * Math.PI / 180;

  // المدرج
  const runwayGeo = new THREE.PlaneGeometry(airport.runway.width, airport.runway.length);
  const runwayMat = new THREE.MeshStandardMaterial({ color: 0x333333 });
  const runway = new THREE.Mesh(runwayGeo, runwayMat);
  runway.rotation.x = -Math.PI / 2;
  runway.receiveShadow = true;
  group.add(runway);

  // علامات المدرج (خطوط بيضاء)
  for (let i = -airport.runway.length / 2; i < airport.runway.length / 2; i += 50) {
    const markGeo = new THREE.PlaneGeometry(3, 20);
    const markMat = new THREE.MeshStandardMaterial({ color: 0xffffff });
    const mark = new THREE.Mesh(markGeo, markMat);
    mark.rotation.x = -Math.PI / 2;
    mark.position.set(0, 0.1, i);
    group.add(mark);
  }

  // برج المراقبة
  const towerGeo = new THREE.BoxGeometry(15, 40, 15);
  const towerMat = new THREE.MeshStandardMaterial({ color: 0x888888 });
  const tower = new THREE.Mesh(towerGeo, towerMat);
  tower.position.set(100, 20, 0);
  tower.castShadow = true;
  group.add(tower);

  scene.add(group);
  airport.position3D = pos;
}