const stars = [];
const num_Stars = 1500;
const noise_Scale = 0.5;
const time_scale = 0.01;
const speed = 0.3;
const angle_change_rate = 0.20;
const angle_noise_speed = 0.06

let halfW, halfH;
const halfD = 1500;

let cameraZStart = 1500;
let cameraZEnd = 500;

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

    this.theta += turnTheta;
    this.phi += turnPhi;

    let flowVX = sin(this.phi) * cos(this.theta) * speed * this.speedMultipler;
    let flowVY = sin(this.phi) * sin(this.theta) * speed * this.speedMultipler;
    let flowVZ = cos(this.phi) * speed * this.speedMultipler;

    let vx = flowVX
    let vy = flowVY 
    let vz = flowVZ

    this.x += vx;
    this.y += vy;
    this.z += vz;

    if (this.x < -halfW) { this.x = halfW; this.trail = []; }
    if (this.x > halfW) { this.x = -halfW; this.trail = []; }
    if (this.y < -halfH) { this.y = halfH; this.trail = []; }
    if (this.y > halfH) { this.y = -halfH; this.trail = []; }
    if (this.z < -halfD) { this.z = halfD; this.trail = []; }
    if (this.z > halfD) { this.z = -halfD; this.trail = []; }


    this.brightness = map(noise(this.noiseOffsetTwinkle + t * time_scale), 0, 1, 60, 255);
  }


  display()
  {
    noStroke();

    push();
    translate(this.x, this.y, this.z);
    fill(255, 255, 255, this.brightness);
    sphere(this.baseSize / 2, 6, 6);

    if(this.baseSize > 2.5)
    {
      fill(255, 255, 255, this.brightness * 0.15);
      sphere(this.baseSize / 2, 6, 6);
    }
    pop();
  }
  
}

let cloudModel;
let modelRotation;

async function setup() 
{
  createCanvas(windowWidth, windowHeight, WEBGL);

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
  let fps = frameRate();
  textSize(32);
  text(fps.toFixed(1), 50, 100);
}


function windowResized() 
{
  resizeCanvas(windowWidth, windowHeight);


}