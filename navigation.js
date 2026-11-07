let autopilotEnabled = false;
let cameraMode = 0;
const autopilotTarget = { altitude: 0, heading: 0, speed: 0 };

let currentFlight = null;
let currentWaypointIndex = 0;

function startFlight(departureICAO, arrivalICAO) {
  const dep = AIRPORTS[departureICAO];
  const arr = AIRPORTS[arrivalICAO];
  currentFlight = {
    departure: dep,
    arrival: arr,
    waypoints: [
      { pos: dep.position3D.clone(), alt: dep.elevation },
      { pos: arr.position3D.clone(), alt: arr.elevation },
    ],
  };
  currentWaypointIndex = 0;

  // ضع الطائرة عند المدرج
  state.position.copy(dep.position3D);
  state.position.y = dep.elevation;
  state.velocity.set(0, 0, 0);
  state.orientation.identity();
  const headingRad = -dep.runway.heading * Math.PI / 180;
  state.orientation.setFromEuler(new THREE.Euler(0, headingRad, 0));
  input.throttle = 0;
  input.gearDown = true;
  input.flaps = 0;

  currentPhase = 'parked';
}

function updateAutopilot() {
  // طيار آلي مبسط: يحافظ على الارتفاع والاتجاه
  const currentAlt = state.position.y;
  const altError = autopilotTarget.altitude - currentAlt;
  input.pitch = THREE.MathUtils.clamp(altError * 0.01, -0.5, 0.5);

  const currentHeading = getCurrentHeading();
  let headingError = autopilotTarget.heading - currentHeading;
  if (headingError > 180) headingError -= 360;
  if (headingError < -180) headingError += 360;
  input.roll = THREE.MathUtils.clamp(headingError * 0.02, -1, 1);
  input.yaw = 0;

  // الحفاظ على السرعة
  const speedError = autopilotTarget.speed - state.velocity.length();
  input.throttle = THREE.MathUtils.clamp(input.throttle + speedError * 0.0001, 0, 1);
}

function getDistanceToAirport(airport) {
  if (!airport.position3D) return Infinity;
  return state.position.distanceTo(airport.position3D);
}

function getActiveAirport() {
  if (!currentFlight) return null;
  if (currentPhase === 'cruise' || currentPhase === 'descent' || currentPhase === 'approach') {
    return currentFlight.arrival;
  }
  return currentFlight.departure;
}