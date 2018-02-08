(function() {
  let T = THREE, w = window, m = Math, matrix = new Map()
  , antPos = {
    x: 0,
    y: 0,
    z: 0,
  }
  , antDir = {
    x: 1,
    y: 0,
    z: 0,
  }
  , plane = 'xz', rules = [], colors, d = document, i = d.getElementById.bind(d),
  camera, scene, renderer, radius = 100, theta = 0,
  rotateUp = ({ x, y, z }) => {
    if (plane == 'xz') {
      plane = (x == 1 || x == -1) ? 'yz' : 'xy';
      return { x: 0, y: 1, z: 0 };
    } else if (plane == 'xy') {
      plane = (x == 1 || x == -1) ? 'yz' : 'xz';
      return { x: 0, y: 0, z: 1 };
    } else {
      plane = (y == 1 || y == -1) ? 'xz' : 'xy';
      return { x: 1, y: 0, z: 0 };
    }
  },
  rotateDown = ({ x, y, z }) => {
    let r = rotateUp({ x, y, z });
    return { x: -r.x, y: -r.y, z: -r.z };
  },
  rotateRight = ({ x, y, z }) =>
    plane == 'xz'
      ? { x: z, y: 0, z: -x }
      : plane == 'xy' ? { x: y, y: -x, z: 0 } : { x: 0, y: -z, z: y },
  rotateLeft = ({ x, y, z }) =>
    rotateRight({ x: -1 * x, y: -1 * y, z: -1 * z }),

  step = (antPos, antDir) => {
    antPos = {
      x: antPos.x + antDir.x,
      y: antPos.y + antDir.y,
      z: antPos.z + antDir.z,
    };
    let key = `${antPos.x}.${antPos.y}.${antPos.z}`,
    color = matrix.get(key) || 0;
    rule = rules[color];
    antDir = rule == 'l'
      ? rotateLeft(antDir)
      : rule == 'r'
        ? rotateRight(antDir)
        : rule == 'u'
          ? rotateUp(antDir)
          : rotateDown(antDir);
    matrix.set(key, color >= rules.length - 1 ? 0 : color + 1);
    return { antPos, antDir };
  },
  init = () => {
    let iw = w.innerWidth; ih = innerHeight;
    camera = new T.PerspectiveCamera(70, iw / ih);
    scene = new T.Scene();
    let light = new T.AmbientLight(0xffffff, 1);
    scene.add(light);
    renderer = new T.WebGLRenderer();
    renderer.setSize(iw, ih);
    document.body.appendChild(renderer.domElement);
  },
  animate = ()=>{
    w.s1 ? a.pause() : requestAnimationFrame(animate);
    addStepToScene();
    render();
  },
  addStepToScene = () => {
    let size = 2;
    let geometry = new T.BoxBufferGeometry(size, size, size);
    let color = colors[matrix.get(`${antPos.x}.${antPos.y}.${antPos.z}`) || 0];
    let object = new T.Mesh(geometry, new T.MeshLambertMaterial({ color }));
    let op = object.position;
    op.x = antPos.x * size + 10;
    op.y = antPos.y * size + 10;
    op.z = antPos.z * size + 10;
    let os = object.scale;
    os.x = 1;
    os.y = 1;
    os.z = 1;
    scene.add(object);
    let { antPos: newPos, antDir: newDir } = step(antPos, antDir);
    antPos = newPos;
    antDir = newDir;
  },
  render = () => {
    theta += 0.5;
    let angle = T.Math.degToRad(theta), MS = m.sin, cp = camera.position;
    cp.x = radius * MS(angle);
    cp.y = radius * MS(angle);
    cp.z = radius * m.cos(angle);
    camera.lookAt(scene.position);
    camera.updateMatrixWorld();
    renderer.render(scene, camera);
  },
  p = (r) => r != 'g' && rules.push(r),
  a = new Audio('vc.mp3');

  d.addEventListener('keypress', (e) => {
    let k=e.key;
    'ldrug'.match(k) && i('rs').appendChild(i(`r${k}`).cloneNode(1)) && p(k);
    k == 'g' && s();
    if (k == 's') w.s1 = 1;
  });

  w.s = () => {
    colors = rules.map(() => m.random() * 0xffffff);
    init();
    animate();
    a.play();
  };

})();
