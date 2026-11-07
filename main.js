let lastTime = performance.now();
let currentPhase = 'parked';

function startGame(departureICAO) {
  document.getElementById('menu').style.display = 'none';

  initWorld();
  initAircraft();

  const arrivalICAO = Object.keys(AIRPORTS).find(k => k !== departureICAO);
  startFlight(departureICAO, arrivalICAO);

  lastTime = performance.now();
  requestAnimationFrame(animate);
}

function animate(now) {
  requestAnimationFrame(animate);
  const dt = Math.min((now - lastTime) / 1000, 0.05);
  lastTime = now;

  readInput();
  updateFlightModel(dt);
  updatePhaseLogic(dt);
  updateHUD();
  updateCamera(dt);
  renderer.render(scene, camera);
}

function updatePhaseLogic(dt) {
  const speed = state.velocity.length();
  const altitudeAGL = state.position.y - (currentFlight ? currentFlight.departure.elevation : 0);

  switch (currentPhase) {
    case 'parked':
      if (input.throttle > 0.05) currentPhase = 'taxi';
      break;

    case 'taxi':
      if (speed > 20 && input.throttle > 0.7) {
        currentPhase = 'takeoff_roll';
      }
      break;

    case 'takeoff_roll':
      if (speed > 140 / 3.6) currentPhase = 'rotate';
      break;

    case 'rotate':
      input.pitch = Math.max(input.pitch, 0.4);
      if (altitudeAGL > 10) {
        currentPhase = 'climb';
        input.gearDown = false;
      }
      break;

    case 'climb':
      if (altitudeAGL > 3000) currentPhase = 'cruise';
      if (altitudeAGL < 5 && speed < 50) currentPhase = 'parked';
      break;

    case 'cruise':
      // الطيار الآلي اختياري
      const distToArrival = getDistanceToAirport(currentFlight.arrival);
      if (distToArrival < 20000) {
        currentPhase = 'descent';
        if (!autopilotEnabled) {
          autopilotEnabled = true;
          autopilotTarget.altitude = currentFlight.arrival.elevation + 3000;
          autopilotTarget.heading = getCurrentHeading();
          autopilotTarget.speed = 100;
        }
      }
      break;

    case 'descent':
      const dArr = getDistanceToAirport(currentFlight.arrival);
      if (dArr < 5000) {
        currentPhase = 'approach';
        input.gearDown = true;
        input.flaps = 3;
      }
      break;

    case 'approach':
      input.throttle = Math.max(0.2, input.throttle);
      if (altitudeAGL < 15) currentPhase = 'flare';
      break;

    case 'flare':
      input.throttle = 0;
      input.pitch = 0.2;
      if (altitudeAGL < 2) currentPhase = 'touchdown';
      break;

    case 'touchdown':
      input.brake = true;
      input.throttle = 0;
      if (speed < 5) currentPhase = 'parked';
      break;
  }
}