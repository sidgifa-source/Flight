const keys = {};

window.addEventListener('keydown', e => {
  keys[e.code] = true;
  if (e.code === 'KeyG') toggleGear();
  if (e.code === 'KeyF') toggleFlaps();
  if (e.code === 'KeyP') toggleAutopilot();
  if (e.code === 'KeyC') cycleCamera();
  if (e.code === 'Space') e.preventDefault();
});
window.addEventListener('keyup', e => keys[e.code] = false);

function toggleGear() {
  input.gearDown = !input.gearDown;
}
function toggleFlaps() {
  input.flaps = (input.flaps + 1) % 4;
}
function toggleAutopilot() {
  autopilotEnabled = !autopilotEnabled;
  if (autopilotEnabled) {
    autopilotTarget.altitude = state.position.y;
    autopilotTarget.heading = getCurrentHeading();
    autopilotTarget.speed = state.velocity.length();
  }
}
function cycleCamera() {
  cameraMode = (cameraMode + 1) % 3;
}

function readInput() {
  if (autopilotEnabled) {
    updateAutopilot();
    return;
  }
  input.pitch = (keys['KeyW'] ? 1 : 0) - (keys['KeyS'] ? 1 : 0);
  input.roll = (keys['KeyD'] ? 1 : 0) - (keys['KeyA'] ? 1 : 0);
  input.yaw = (keys['KeyE'] ? 1 : 0) - (keys['KeyQ'] ? 1 : 0);
  if (keys['ShiftLeft']) input.throttle = Math.min(1, input.throttle + 0.005);
  if (keys['ControlLeft']) input.throttle = Math.max(0, input.throttle - 0.005);
  input.brake = keys['Space'] || false;
}

function getCurrentHeading() {
  const forward = new THREE.Vector3(0, 0, -1).applyQuaternion(state.orientation);
  let h = Math.atan2(forward.x, -forward.z) * 180 / Math.PI;
  if (h < 0) h += 360;
  return h;
}