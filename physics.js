const GRAVITY = 9.81;
const AIR_DENSITY = 1.225;

const state = {
  velocity: new THREE.Vector3(),
  position: new THREE.Vector3(),
  orientation: new THREE.Quaternion(),
  angularVelocity: new THREE.Vector3(),
};

const input = {
  pitch: 0, roll: 0, yaw: 0,
  throttle: 0, flaps: 0,
  gearDown: true, brake: false,
};

function updateFlightModel(dt) {
  const forward = new THREE.Vector3(0, 0, -1).applyQuaternion(state.orientation);
  const up = new THREE.Vector3(0, 1, 0).applyQuaternion(state.orientation);
  const speed = state.velocity.length();

  if (speed > 0.1) {
    // زاوية الهجوم
    const aoa = Math.atan2(-state.velocity.dot(up), state.velocity.dot(forward)) || 0;
    const cl = 0.2 + 5.0 * aoa;
    const liftMag = 0.5 * AIR_DENSITY * speed * speed * AIRCRAFT.wingArea * cl;
    const lift = up.clone().multiplyScalar(liftMag);

    const cd = 0.02 + 0.05 * cl * cl + (input.gearDown ? 0.02 : 0) + input.flaps * 0.01;
    const dragMag = 0.5 * AIR_DENSITY * speed * speed * AIRCRAFT.wingArea * cd;
    const drag = state.velocity.clone().normalize().multiplyScalar(-dragMag);

    const thrust = forward.clone().multiplyScalar(input.throttle * AIRCRAFT.maxThrust);
    const weight = new THREE.Vector3(0, -AIRCRAFT.mass * GRAVITY, 0);

    // قوة الرفع + السحب + الدفع + الوزن
    const totalForce = new THREE.Vector3()
      .add(lift).add(drag).add(thrust).add(weight);

    // فرامل على الأرض
    if (state.position.y <= 1 && input.brake) {
      totalForce.add(state.velocity.clone().multiplyScalar(-5000));
    }

    const accel = totalForce.divideScalar(AIRCRAFT.mass);
    state.velocity.addScaledVector(accel, dt);
  }

  // تحديث الموقع
  state.position.addScaledVector(state.velocity, dt);

  // منع النزول تحت الأرض
  if (state.position.y < 0) {
    state.position.y = 0;
    state.velocity.y = Math.max(0, state.velocity.y);
  }

  // عزم الدوران
  const pitchT = input.pitch * speed * speed * 0.0005;
  const rollT = input.roll * speed * speed * 0.001;
  const yawT = input.yaw * speed * speed * 0.0003;

  const inertia = { pitch: 1e6, roll: 5e5, yaw: 1e6 };
  state.angularVelocity.x += (pitchT / inertia.pitch) * dt;
  state.angularVelocity.z += (rollT / inertia.roll) * dt;
  state.angularVelocity.y += (yawT / inertia.yaw) * dt;

  // تخميد
  state.angularVelocity.multiplyScalar(1 - 1.5 * dt);

  // تحديث الاتجاه
  const dq = new THREE.Quaternion().setFromEuler(new THREE.Euler(
    state.angularVelocity.x * dt,
    state.angularVelocity.y * dt,
    state.angularVelocity.z * dt
  ));
  state.orientation.multiply(dq).normalize();

  // تطبيق على الطائرة
  aircraftRoot.position.copy(state.position);
  aircraftRoot.quaternion.copy(state.orientation);
}