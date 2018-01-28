(function() {
  let T = THREE;
  let w = window;
  let m = Math;
  let matrix = new Map();
  let antPos = {
    x: 0,
    y: 0,
    z: 0,
  };
  let antDir = {
    x: 1,
    y: 0,
    z: 0,
  };
  let plane = 'xz';

  let rotateUp = ({ x, y, z }) => {
    if (plane === 'xz') {
      plane = x > 0 ? 'yz' : 'xy';
      return { x: 0, y: 1, z: 0 };
    } else if (plane === 'xy') {
      plane = x > 0 ? 'yz' : 'xz';
      return { x: 0, y: 0, z: 1 };
    } else {
      plane = y > 0 ? 'xz' : 'xy';
      return { x: 1, y: 0, z: 0 };
    }
  };
  let rotateDown = ({ x, y, z }) => {
    let r = rotateUp({ x, y, z });
    return { x: -r.x, y: -r.y, z: -r.z };
  };
  let rotateRight = ({ x, y, z }) =>
    plane === 'xz'
      ? { x: z, y: 0, z: -x }
      : plane === 'xy' ? { x: y, y: -x, z: 0 } : { x: 0, y: -z, z: y };
  let rotateLeft = ({ x, y, z }) =>
    rotateRight({ x: -1 * x, y: -1 * y, z: -1 * z });

  let rules, colors;

  let step = (antPos, antDir) => {
    antPos = {
      x: antPos.x + antDir.x,
      y: antPos.y + antDir.y,
      z: antPos.z + antDir.z,
    };
    let key = `${antPos.x}.${antPos.y}.${antPos.z}`;
    let color = matrix.get(key) || 0;
    rule = rules[color];
    switch (rule) {
      case 'L':
        antDir = rotateLeft(antDir);
        break;
      case 'R':
        antDir = rotateRight(antDir);
        break;
      case 'U':
        antDir = rotateUp(antDir);
        break;
      case 'D':
        antDir = rotateDown(antDir);
    }
    matrix.set(key, color >= rules.length - 1 ? 0 : color + 1);
    return { antPos, antDir };
  };

  let camera, scene, renderer;
  let radius = 100, theta = 0;

  w.s = () => {
    rules = document.getElementById('r').value;
    colors = rules.split('').map(() => m.random() * 0xffffff);
    init();
    animate();
  }

  function init() {
    camera = new T.PerspectiveCamera(
      70,
      w.innerWidth / w.innerHeight,
      //1,
      //10000,
    );
    scene = new T.Scene();
    let light = new T.AmbientLight(0xfffff, 1);
    scene.add(light);
    renderer = new T.WebGLRenderer();
    renderer.setPixelRatio(w.devicePixelRatio);
    renderer.setSize(w.innerWidth, w.innerHeight);
    document.body.appendChild(renderer.domElement);
  }
  function animate() {
    w.s1 || requestAnimationFrame(animate);
    addStepToScene();
    render();
  }
  function addStepToScene() {
    let size = 2;
    let geometry = new T.BoxBufferGeometry(size, size, size);
    let color = colors[matrix.get(`${antPos.x}.${antPos.y}.${antPos.z}`) || 0];
    let object = new T.Mesh(geometry, new T.MeshLambertMaterial({ color }));
    object.position.x = antPos.x * size + 10;
    object.position.y = antPos.y * size + 10;
    object.position.z = antPos.z * size + 10;
    object.scale.x = 1;
    object.scale.y = 1;
    object.scale.z = 1;
    scene.add(object);
    let { antPos: newPos, antDir: newDir } = step(antPos, antDir);
    antPos = newPos;
    antDir = newDir;
  }
  function render() {
    theta += 0.5;
    let angle = T.Math.degToRad(theta);
    let MS = m.sin
    camera.position.x = radius * MS(angle);
    camera.position.y = radius * MS(angle);
    camera.position.z = radius * m.cos(angle);
    camera.lookAt(scene.position);
    camera.updateMatrixWorld();
    renderer.render(scene, camera);
  }
})();
