let scene, camera, renderer;
let bullets = [], enemies = [];
let lon = 0, lat = 0, phi = 0, theta = 0;
let onPointerDownPointerX = 0, onPointerDownPointerY = 0, onPointerDownLon = 0, onPointerDownLat = 0;

init();
animate();

function init() {
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x050505);

    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 1.6, 5);

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    document.body.appendChild(renderer.domElement);

    // Light
    const light = new THREE.HemisphereLight(0xffffff, 0x444444, 1.5);
    scene.add(light);

    // Floor
    const grid = new THREE.GridHelper(100, 20, 0x00ff00, 0x222222);
    scene.add(grid);

    // Enemies
    for (let i = 0; i < 15; i++) {
        const enemy = new THREE.Mesh(
            new THREE.BoxGeometry(1, 2, 1),
            new THREE.MeshStandardMaterial({ color: 0xff00ff })
        );
        enemy.position.set(Math.random() * 30 - 15, 1, Math.random() * -30);
        scene.add(enemy);
        enemies.push(enemy);
    }

    // Touch Controls Logic
    document.addEventListener('touchstart', onTouchStart, false);
    document.addEventListener('touchmove', onTouchMove, false);
    document.addEventListener('touchend', shoot, false); // Tap to shoot

    window.addEventListener('resize', onWindowResize);
}

function onTouchStart(event) {
    const touch = event.touches[0];
    onPointerDownPointerX = touch.clientX;
    onPointerDownPointerY = touch.clientY;
    onPointerDownLon = lon;
    onPointerDownLat = lat;
}

function onTouchMove(event) {
    const touch = event.touches[0];
    lon = (onPointerDownPointerX - touch.clientX) * 0.1 + onPointerDownLon;
    lat = (touch.clientY - onPointerDownPointerY) * 0.1 + onPointerDownLat;
    lat = Math.max(-85, Math.min(85, lat));
}

function shoot(event) {
    // Only shoot if it was a quick tap
    const b = new THREE.Mesh(new THREE.SphereGeometry(0.2), new THREE.MeshBasicMaterial({ color: 0xffff00 }));
    b.position.copy(camera.position);
    const dir = new THREE.Vector3(0, 0, -1).applyQuaternion(camera.quaternion);
    b.userData.v = dir.multiplyScalar(1);
    scene.add(b);
    bullets.push(b);
}

function animate() {
    requestAnimationFrame(animate);

    // Convert Lon/Lat to Camera Rotation
    phi = THREE.MathUtils.degToRad(90 - lat);
    theta = THREE.MathUtils.degToRad(lon);

    const target = new THREE.Vector3();
    target.x = Math.sin(phi) * Math.cos(theta);
    target.y = Math.cos(phi);
    target.z = Math.sin(phi) * Math.sin(theta);
    camera.lookAt(camera.position.clone().add(target));

    // Simple Auto-Forward (So you don't need a keyboard)
    // camera.translateZ(-0.02); 

    bullets.forEach((b, i) => {
        b.position.add(b.userData.v);
        enemies.forEach((e, j) => {
            if (b.position.distanceTo(e.position) < 1.5) {
                e.position.y = -10;
                scene.remove(b);
            }
        });
    });

    renderer.render(scene, camera);
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}
