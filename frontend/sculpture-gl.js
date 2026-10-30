// Original, dependency-free studio sculpture. Geometry and lighting are procedural;
// no remote assets, renderer globals, application data, or animation loop are used.
const VERTEX = `
attribute vec3 aPosition;
attribute vec3 aNormal;
uniform vec2 uRotation;
uniform vec2 uViewport;
uniform float uScale;
varying vec3 vPosition;
varying vec3 vNormal;

vec3 turn(vec3 p) {
  float cy = cos(uRotation.y), sy = sin(uRotation.y);
  float cx = cos(uRotation.x), sx = sin(uRotation.x);
  vec3 q = vec3(p.x * cy + p.z * sy, p.y, p.z * cy - p.x * sy);
  return vec3(q.x, q.y * cx - q.z * sx, q.y * sx + q.z * cx);
}
void main() {
  vec3 p = turn(aPosition);
  vPosition = p;
  vNormal = turn(aNormal);
  float depth = 3.8 - p.z;
  // The tiny offset agrees with the existing 2D sculpture's optical center.
  vec2 clipXY = vec2(.02, .02) * depth;
  clipXY += vec2(p.x, -p.y) * (7.6 * uScale / uViewport);
  float clipZ = (12.1 / 11.9) * depth - (2.4 / 11.9);
  gl_Position = vec4(clipXY, clipZ, depth);
}`;

const FRAGMENT = `
precision highp float;
varying vec3 vPosition;
varying vec3 vNormal;

// A seamless analytic reflection studio. Broad rectangular sources and their
// softer spill give smooth metal continuous gradients, not per-face lighting.
float panel(vec3 ray, vec3 facing, vec3 up, vec2 size, float softness) {
  vec3 normal = normalize(facing);
  vec3 side = normalize(cross(normal, up));
  vec3 vertical = cross(side, normal);
  float forward = dot(ray, normal);
  vec2 uv = vec2(dot(ray, side), dot(ray, vertical)) / max(forward, .001);
  vec2 edge = abs(uv) - size;
  float distanceToBox = length(max(edge, 0.0)) + min(max(edge.x, edge.y), 0.0);
  return (1.0 - smoothstep(-softness, softness, distanceToBox)) * smoothstep(.0, .15, forward);
}

vec3 studio(vec3 ray) {
  float upper = 1.0 - smoothstep(-.9, .55, ray.y);
  vec3 environment = mix(vec3(.008, .014, .026), vec3(.12, .16, .20), upper);
  environment += vec3(.11, .17, .22) * pow(max(0.0, dot(ray, normalize(vec3(-.2, -.5, 1.0)))), 3.0);
  // Tall left key, a broad top silk, and restrained cool fill.
  environment += vec3(2.55, 2.70, 2.67) * panel(ray, vec3(-1.0, -.55, 1.1), vec3(0., 1., 0.), vec2(.20, .95), .13);
  environment += vec3(1.55, 1.67, 1.79) * panel(ray, vec3(.1, -1.2, .6), vec3(0., 0., 1.), vec2(.85, .18), .15);
  environment += vec3(.55, .76, 1.30) * panel(ray, vec3(1.0, .1, .65), vec3(0., 1., 0.), vec2(.24, .75), .28);
  // Small mint and violet cards reflect around the polished perimeter.
  environment += vec3(.32, 1.05, .84) * panel(ray, vec3(-.95, .40, -.15), vec3(0., 1., 0.), vec2(.18, .85), .22);
  environment += vec3(.65, .30, 1.05) * panel(ray, vec3(.65, .95, -.35), vec3(0., 0., 1.), vec2(.65, .23), .27);
  environment += vec3(1.35, 1.48, 1.60) * panel(ray, vec3(.65, -.25, -.85), vec3(0., 1., 0.), vec2(.10, .80), .08);
  return environment;
}

vec3 film(float phase) {
  return .65 + .35 * cos(6.2831853 * (vec3(.04, .35, .64) + phase));
}

vec3 toneMap(vec3 color) {
  return clamp((color * (2.51 * color + .03)) / (color * (2.43 * color + .59) + .14), 0.0, 1.0);
}

void main() {
  vec3 normal = normalize(vNormal);
  vec3 view = normalize(vec3(0., 0., 3.8) - vPosition);
  float nv = max(dot(normal, view), 0.0);
  vec3 reflected = reflect(-view, normal);
  float fresnel = pow(1.0 - nv, 5.0);
  // Platinum carries a subtle thin-film tint; broad highlights remain neutral.
  vec3 spectral = film(.16 + .20 * (1.0 - nv) + reflected.y * .13 + reflected.x * .10);
  vec3 metal = mix(vec3(.79, .84, .88), spectral, .18 + .23 * fresnel);
  vec3 reflectance = metal + (1.0 - metal) * fresnel;
  vec3 color = studio(reflected) * reflectance;
  // Low diffuse fill keeps the dark side dimensional between reflective cards.
  float fill = .035 + .065 * max(dot(normal, normalize(vec3(-.5, -.8, 1.))), 0.0);
  color += vec3(.32, .44, .52) * fill;
  color += vec3(.18, .24, .30) * pow(1.0 - nv, 3.0) * .19;
  // Gentle recess attenuation, continuous in object space and never faceted.
  float centerShade = mix(.78, 1.0, smoothstep(.55, 1.20, length(vPosition.xy)));
  color *= centerShade;
  color = pow(toneMap(color * 1.06), vec3(1.0 / 2.2));
  gl_FragColor = vec4(color, 1.0);
}`;

function makeMesh() {
  const rows = 128, columns = 64;
  const vertices = new Float32Array((rows + 1) * (columns + 1) * 6);
  const indices = new Uint16Array(rows * columns * 6);
  let cursor = 0;
  for (let i = 0; i <= rows; i++) {
    const u = i / rows * Math.PI * 2;
    const cu = Math.cos(u), su = Math.sin(u);
    const tube = .31 + .025 * Math.cos(3 * u);
    const tubeDerivative = -.075 * Math.sin(3 * u);
    for (let j = 0; j <= columns; j++) {
      const v = j / columns * Math.PI * 2;
      const cv = Math.cos(v), sv = Math.sin(v);
      const radius = 1.12 + tube * cv;
      const x = radius * cu, y = radius * su, z = .31 * Math.sin(2 * u) + tube * sv;
      const du = [tubeDerivative * cv * cu - radius * su, tubeDerivative * cv * su + radius * cu, .62 * Math.cos(2 * u) + tubeDerivative * sv];
      const dv = [-tube * sv * cu, -tube * sv * su, tube * cv];
      const nx = du[1] * dv[2] - du[2] * dv[1];
      const ny = du[2] * dv[0] - du[0] * dv[2];
      const nz = du[0] * dv[1] - du[1] * dv[0];
      const length = Math.hypot(nx, ny, nz);
      vertices.set([x, y, z, nx / length, ny / length, nz / length], cursor); cursor += 6;
    }
  }
  cursor = 0;
  for (let i = 0; i < rows; i++) for (let j = 0; j < columns; j++) {
    const a = i * (columns + 1) + j, b = a + columns + 1;
    indices.set([a, b, b + 1, a, b + 1, a + 1], cursor); cursor += 6;
  }
  return { vertices, indices };
}

export function createSculptureRenderer(canvas) {
  const gl = canvas.getContext('webgl', { alpha: true, antialias: true, premultipliedAlpha: true, depth: true, stencil: false, preserveDrawingBuffer: false, powerPreference: 'low-power' });
  if (!gl) return null;
  const shaders = [], buffers = [];
  let program, destroyed = false, width = 1, height = 1;
  function cleanup() {
    for (const buffer of buffers) gl.deleteBuffer(buffer);
    if (program) gl.deleteProgram(program);
    for (const shader of shaders) gl.deleteShader(shader);
  }
  function shader(type, source) {
    const compiled = gl.createShader(type); shaders.push(compiled);
    gl.shaderSource(compiled, source); gl.compileShader(compiled);
    if (!gl.getShaderParameter(compiled, gl.COMPILE_STATUS)) throw new Error(`Sculpture shader: ${gl.getShaderInfoLog(compiled) || 'compilation failed'}`);
    return compiled;
  }
  try {
    program = gl.createProgram();
    gl.attachShader(program, shader(gl.VERTEX_SHADER, VERTEX));
    const precision = gl.getShaderPrecisionFormat(gl.FRAGMENT_SHADER, gl.HIGH_FLOAT);
    gl.attachShader(program, shader(gl.FRAGMENT_SHADER, precision?.precision ? FRAGMENT : FRAGMENT.replace('precision highp float;', 'precision mediump float;')));
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw new Error(`Sculpture program: ${gl.getProgramInfoLog(program) || 'link failed'}`);
    const mesh = makeMesh();
    const vertexBuffer = gl.createBuffer(), indexBuffer = gl.createBuffer(); buffers.push(vertexBuffer, indexBuffer);
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer); gl.bufferData(gl.ARRAY_BUFFER, mesh.vertices, gl.STATIC_DRAW);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer); gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, mesh.indices, gl.STATIC_DRAW);
    const position = gl.getAttribLocation(program, 'aPosition'), normal = gl.getAttribLocation(program, 'aNormal');
    const rotation = gl.getUniformLocation(program, 'uRotation'), viewport = gl.getUniformLocation(program, 'uViewport'), scale = gl.getUniformLocation(program, 'uScale');
    gl.enable(gl.DEPTH_TEST); gl.depthFunc(gl.LEQUAL);
    // Opaque surface over a transparent clear; MSAA coverage is premultiplied by
    // the browser compositor. No manual blending or incorrect alpha tinting.
    gl.disable(gl.BLEND); gl.disable(gl.CULL_FACE); gl.clearColor(0, 0, 0, 0);
    return {
      resize(w, h, dpr = 1) {
        if (destroyed) return;
        width = Math.max(1, w); height = Math.max(1, h);
        const ratio = Math.max(1, Math.min(dpr || 1, 2));
        const pixelWidth = Math.max(1, Math.round(width * ratio)), pixelHeight = Math.max(1, Math.round(height * ratio));
        if (canvas.width !== pixelWidth) canvas.width = pixelWidth;
        if (canvas.height !== pixelHeight) canvas.height = pixelHeight;
        gl.viewport(0, 0, canvas.width, canvas.height);
      },
      draw({ time = 0, pointer = { x: 0, y: 0 }, scroll = 0, width: w = width, height: h = height } = {}) {
        if (destroyed || gl.isContextLost()) return;
        const progress = Math.max(0, Math.min(1, scroll));
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT); gl.useProgram(program);
        gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer); gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
        gl.enableVertexAttribArray(position); gl.vertexAttribPointer(position, 3, gl.FLOAT, false, 24, 0);
        gl.enableVertexAttribArray(normal); gl.vertexAttribPointer(normal, 3, gl.FLOAT, false, 24, 12);
        gl.uniform2f(rotation, -.65 + (pointer.y || 0) * .24 + progress * .3, -.32 + time * .075 + (pointer.x || 0) * .42);
        gl.uniform2f(viewport, Math.max(1, w), Math.max(1, h));
        gl.uniform1f(scale, Math.min(w, h) * (.24 + progress * .05));
        gl.drawElements(gl.TRIANGLES, mesh.indices.length, gl.UNSIGNED_SHORT, 0);
      },
      destroy() { if (!destroyed) { destroyed = true; cleanup(); } }
    };
  } catch (error) { cleanup(); throw error; }
}
