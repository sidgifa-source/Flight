function updateHUD() {
  const speedKmh = state.velocity.length() * 3.6;
  const altitudeFt = state.position.y * 3.28;
  const heading = getCurrentHeading();

  document.getElementById('speed').textContent = speedKmh.toFixed(0);
  document.getElementById('altitude').textContent = altitudeFt.toFixed(0);
  document.getElementById('heading').textContent = heading.toFixed(0);
  document.getElementById('throttle').textContent = (input.throttle * 100).toFixed(0);
  document.getElementById('phase').textContent = phaseLabels[currentPhase] || currentPhase;

  const active = getActiveAirport();
  if (active) {
    document.getElementById('airport').textContent = active.icao;
    const dist = getDistanceToAirport(active) / 1000;
    document.getElementById('distance').textContent = dist.toFixed(1);
  }
}

const phaseLabels = {
  parked: 'متوقف',
  taxi: 'تاكسي',
  takeoff_roll: 'جري الإقلاع',
  rotate: 'رفع الأنف',
  climb: 'صعود',
  cruise: 'طيران مستوي',
  descent: 'هبوط تدريجي',
  approach: 'اقتراب',
  flare: 'رفع نهائي',
  touchdown: 'ملامسة',
  rollout: 'تباطؤ',
};

function updateCamera(dt) {
  if (!aircraftRoot) return;
  const forward = new THREE.Vector3(0, 0, -1).applyQuaternion(state.orientation);
  const up = new THREE.Vector3(0, 1, 0).applyQuaternion(state.orientation);

  let offset;
  if (cameraMode === 0) {
    offset = forward.clone().multiplyScalar(-40).add(up.clone().multiplyScalar(12));
  } else if (cameraMode === 1) {
    offset = forward.clone().multiplyScalar(-100).add(up.clone().multiplyScalar(30));
  } else {
    offset = new THREE.Vector3(0, 3, -8).applyQuaternion(state.orientation);
  }

  const targetPos = state.position.clone().add(offset);
  camera.position.lerp(targetPos, 1 - Math.pow(0.001, dt));
  camera.lookAt(state.position.clone().add(forward.clone().multiplyScalar(50)));
}