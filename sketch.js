const stars = [];
const num_Stars = 1500;
const noise_Scale = 0.5;
const time_scale = 0.01;
const speed = 0.3;
const angle_change_rate = 0.02;
const angle_noise_speed = 0.06

let halfW, halfH;
const halfD = 1500;

let cameraZStart = 1500;
let cameraZEnd = 500;

let cloudModel;
let modelRotation;
let fpsDiv;
let showFPS = true;

let fpsHistory = [];
const fpsSampleSize = 100;


class Star {
  constructor(seed) 
  {

    this.seed = seed;
    
    this.noiseOffsetSize = seed * 1000 + 10000;
    this.noiseOffsetTwinkle = seed * 1000 + 15000;
    this.noiseOffsetAngle = seed * 1000 + 20000;
    this.noiseOffSetTheta = seed * 1000 + 25000;
    this.noiseOffsetPhi = seed * 1000 + 30000;

    this.x = random(-halfW, halfW);
    this.y = random(-halfH, halfH);
    this.z = random(-halfD, halfD);

    this.baseSize = map(noise(this.noiseOffsetSize), 0, 1, 1, 4);
    this.speedMultipler = map(noise(this.noiseOffsetSize + 500), 0, 1, 0.5, 1.5);

    this.theta = random(TWO_PI);
    this.phi = random(PI);
  }

  update(t) 
  {
    let turnTheta = (noise(this.noiseOffSetTheta + t * angle_noise_speed) - 0.5) * angle_change_rate;
    let turnPhi = (noise(this.noiseOffsetPhi + t * angle_noise_speed) - 0.5) * angle_change_rate;
    
    this.theta += turnTheta;
    this.phi += turnPhi;

    let vx = sin(this.phi) * cos(this.theta) * speed * this.speedMultipler;
    let vy = sin(this.phi) * sin(this.theta) * speed * this.speedMultipler;
    let vz = cos(this.phi) * speed * this.speedMultipler;

    this.x += vx;
    this.y += vy;
    this.z += vz;

    if (this.x < -halfW) { this.x = halfW; }
    if (this.x > halfW) { this.x = -halfW; }
    if (this.y < -halfH) { this.y = halfH; }
    if (this.y > halfH) { this.y = -halfH; }
    if (this.z < -halfD) { this.z = halfD; }
    if (this.z > halfD) { this.z = -halfD; }


  }


  display()
  {
    noStroke();
    push();
    translate(this.x, this.y, this.z);
    fill(255, 255, 255, 255);
    circle(0, 0, this.baseSize*1.5);
    pop();
  }
  
}

async function setup() 
{
  createCanvas(windowWidth, windowHeight, WEBGL);

  setCameraTarget();

  //set up the canvas and the measurements for the windows
  halfW = windowWidth / 2;
  halfH = windowHeight / 2;
  noiseSeed(1);
  modelRotation = HALF_PI;
  
  //draw the stars
  for(let i = 0; i < num_Stars; i++)
  {
    stars.push(new Star(i));
  }

  //load in the model from blender
  cloudModel = await loadModel('MidasCloud.obj', true);
  cloudModel.computeNormals('smooth');

  //DEBUG: set up div for displaying fps
  fpsDiv = createDiv('');
  fpsDiv.style('position', 'absolute');
  fpsDiv.style('top', '10px');
  fpsDiv.style('left', '10px');
  fpsDiv.style('color', '#0f0');
  fpsDiv.style('font-family', 'monospace');
  fpsDiv.style('font-size', '16px');
  fpsDiv.style('background', 'rgba(0,0,0,0.5)');
  fpsDiv.style('padding', '6px 10px');
  fpsDiv.style('z-index', '10');
  fpsDiv.style('pointer-events', 'none');
}

function draw() 
{

  //draw the model and set the movement and background
  background("#0b0c1b");
  orbitControl(0, 0, 0.5);
  fill(0, 150, 255);

  ambientLight(150, 150, 150);
  directionalLight(255, 250, 230, 0.5, 1, -0.3);
  specularMaterial(180, 180, 190);
  shininess(5);

  //drawing and setting up the cloud model
  push();
  scale(2);
  strokeWeight(2);
  fill("#D59D21")
  rotateY(modelRotation);
  model(cloudModel);
  pop();



  //do the camera zoom at the beginning
  if(cameraZStart > cameraZEnd)
  {
    cameraZStart -= 15;
  
  }
  camera(0, 0, cameraZStart, 0, 0, 0, 0, 1, 0);


  // Update and display each star
  let t = frameCount;
  for (let star of stars) {
    star.update(t);
    star.display();
  }


  //DEBUG: draw the frame 
  if(showFPS)
  {
    updateFpsDisplay();
  }
}

function windowResized() 
{
  resizeCanvas(windowWidth, windowHeight);
}

function updateFpsDisplay() 
{
  fpsHistory.push(frameRate());
  if (fpsHistory.length > fpsSampleSize) fpsHistory.shift();

  const avg = fpsHistory.reduce((a, b) => a + b, 0) / fpsHistory.length;
  const min = Math.min(...fpsHistory);

  fpsDiv.html(
    `FPS: ${avg.toFixed(1)} (min ${min.toFixed(0)})<br>` +
    `Stars: ${num_Stars}<br>` +
    `DPR: ${window.devicePixelRatio}`
  );
}

function keyPressed()
{
  if(key === 'f' || key === 'F')
  {
    showFPS = !showFPS;
  }
}

function calcCameraDistance(targetWorldSize)
{
  let fovY = PI / 3;
  let aspect = windowWidth / windowHeight;

  let distV = (targetWorldSize / 2) / tan(fovY / 2);

  let fovX = 2 * atan(tan(fovY / 2) * aspect);
  let distH = (targetWorldSize / 2) / tan(fovX / 2);

  return max(distV, distH);
}

function setCameraTarget()
{
  cameraZStart = calcCameraDistance(1800);
  cameraZEnd = calcCameraDistance(700);
}