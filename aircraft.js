// مواصفات طائرة A320 مبسطة
const AIRCRAFT = {
  length: 37.6, wingspan: 35.8, height: 11.8,
  mass: 78000,          // كجم
  wingArea: 122.6,      // م²
  maxThrust: 2 * 120000, // 2 محرك × 120 كيلونيوتن
  maxSpeed: 870 / 3.6,  // م/ث
};

let aircraftRoot, visualModel;

function initAircraft() {
  aircraftRoot = new THREE.Group();

  visualModel = new THREE.Group();

  // جسم الطائرة
  const fuselageGeo = new THREE.CylinderGeometry(2, 2, AIRCRAFT.length, 16);
  const fuselageMat = new THREE.MeshStandardMaterial({ color: 0xffffff });
  const fuselage = new THREE.Mesh(fuselageGeo, fuselageMat);
  fuselage.rotation.x = Math.PI / 2;
  fuselage.castShadow = true;
  visualModel.add(fuselage);

  // الأجنحة
  const wingGeo = new THREE.BoxGeometry(AIRCRAFT.wingspan, 0.5, 8);
  const wingMat = new THREE.MeshStandardMaterial({ color: 0xdddddd });
  const wing = new THREE.Mesh(wingGeo, wingMat);
  wing.position.y = -0.5;
  wing.castShadow = true;
  visualModel.add(wing);

  // الذيل الأفقي
  const tailHGeo = new THREE.BoxGeometry(12, 0.4, 4);
  const tailH = new THREE.Mesh(tailHGeo, wingMat);
  tailH.position.set(0, 0, AIRCRAFT.length / 2 - 2);
  visualModel.add(tailH);

  // الذيل العمودي
  const tailVGeo = new THREE.BoxGeometry(0.4, 6, 5);
  const tailV = new THREE.Mesh(tailVGeo, wingMat);
  tailV.position.set(0, 3, AIRCRAFT.length / 2 - 2);
  visualModel.add(tailV);

  // المحركات
  const engineGeo = new THREE.CylinderGeometry(1.5, 1.5, 4, 12);
  const engineMat = new THREE.MeshStandardMaterial({ color: 0x444444 });
  [-8, 8].forEach(x => {
    const engine = new THREE.Mesh(engineGeo, engineMat);
    engine.rotation.x = Math.PI / 2;
    engine.position.set(x, -1.5, 0);
    visualModel.add(engine);
  });

  aircraftRoot.add(visualModel);
  scene.add(aircraftRoot);
}