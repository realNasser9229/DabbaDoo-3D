let scene, camera, renderer, controls;
let bullets = [];
let enemies = [];

init();
animate();

function init() {
    // Scene
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x111111);

    // Camera
    camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000);
    camera.position.y = 1.6;

    // Renderer
    renderer = new THREE.WebGLRenderer({antialias:true});
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    // Controls
    controls = new THREE.PointerLockControls(camera, document.body);
    document.body.addEventListener('click', () => controls.lock());

    // Lighting
    const light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.set(5, 10, 7);
    scene.add(light);

    // Floor
    const floor = new THREE.Mesh(
        new THREE.PlaneGeometry(100, 100),
        new THREE.MeshStandardMaterial({color:0x222222})
    );
    floor.rotation.x = -Math.PI / 2;
    scene.add(floor);

    // Spawn dummy enemy
    spawnEnemy();

    // Shoot
    window.addEventListener('click', shoot);

    // Resize
    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth/window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });
}

// Bullet
function shoot() {
    const bullet = new THREE.Mesh(
        new THREE.SphereGeometry(0.05, 8, 8),
        new THREE.MeshBasicMaterial({color:0xff0000})
    );
    bullet.position.copy(camera.position);
    bullet.velocity = new THREE.Vector3(0,0,-1).applyQuaternion(camera.quaternion).multiplyScalar(1);
    scene.add(bullet);
    bullets.push(bullet);
}

// Enemy
function spawnEnemy() {
    const enemy = new THREE.Mesh(
        new THREE.BoxGeometry(1,1,1),
        new THREE.MeshStandardMaterial({color:0x00ff00})
    );
    enemy.position.set(0,0.5,-10);
    scene.add(enemy);
    enemies.push(enemy);
}

// Animate
function animate() {
    requestAnimationFrame(animate);

    bullets.forEach((b, i) => {
        b.position.add(b.velocity);
        if (b.position.length() > 100) {
            scene.remove(b);
            bullets.splice(i,1);
        }

        // Check collision with enemies
        enemies.forEach((e, j) => {
            if (b.position.distanceTo(e.position) < 0.5) {
                scene.remove(e);
                enemies.splice(j,1);
                scene.remove(b);
                bullets.splice(i,1);
            }
        });
    });

    renderer.render(scene, camera);
}
