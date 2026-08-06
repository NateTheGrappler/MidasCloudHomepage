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
let showFPS = false;

let fpsHistory = [];
const fpsSampleSize = 100;

//------------panel related information-------------//
let drawPanels = false;
let informationPanels = []; //stores actual panels
let informationPanelBools = [] //bools for if a panel is flipped
let overlayDiv;
let isListMode = false;

//settings for how the panels are rotated around the cloud
const panelRingSettings = {
  radiusRatioX: 0.46,
  minRadiusX: 220,
  maxRadiusX: 460,

  radiusRatioY: 0.34,
  minRadiusY: 180,
  maxRadiusY: 290,

  bobAmount: 3,
  bobSpeed: 0.1,
  margin: 12,
  mobileBreakpoint: 620
};

let informationPanelData = [
  { title: 'Obsidian Vault(s)', detail: "Stores your notes", image: 'images/ObsidianLogo.png', link: null},
  { title: 'Nextcloud', detail: "Stores your files", image: 'images/nextCloud.png', link: 'https://files.midascloud.net'},
  { title: 'Plex Server', detail: "Streams your media", image: 'images/plex.png', link: 'https://plex.midascloud.net' },
  { title: 'Study Material Site (Coming Later)', detail: "Share study materials to organize them", image: 'images/bookstack.png', link: null },
  { title: 'Minecraft Server (Coming Later)', detail: "A minecraft server IP to join", image: 'images/Minecraft_logo.svg', link: null },
  { title: 'Check Out More Of My Stuff!', detail: "A link to github and other projects", image: 'images/github.jpeg', link: 'https://github.com/NateTheGrappler?tab=repositories' },
  { title: 'Calibre Library', detail: "Store your books", image: 'images/bookReading.png', link: 'https://books.midascloud.net' }

] //TODO: swap in real content for each panel


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
  addScreenPositionFunction();
  setCameraTarget();

  //set up the canvas and the measurements for the windows
  halfW = windowWidth;
  halfH = windowHeight;

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

  //set up the information needed for panels clickable panels
  createInformationPanels();
  createPanelStyle();
}

function draw() 
{

  //draw the model and set the movement and background
  background("#0b0c1b");
  orbitControl(0, 0, 0.5);
  //orbitControl();
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
    cameraZStart -= 30;
  }
  else
  {
    drawPanels = true;
  }
  camera(0, 0, cameraZStart, 0, 0, 0, 0, 1, 0);


  // Update and display each star
  let t = frameCount;
  for (let star of stars) {
    star.update(t);
    star.display();
  }

  //check to see if animation is done, then draw in the panels
  if(drawPanels)
  {
    drawInformationPanels();
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


//the extra stuff needed for the rotating panels around the actual cloud

function createPanelStyle()
{
  const styleTag = createElement('style', `
    .info-panel {
      width: clamp(130px, 34vmin, 240px);
      min-height: clamp(120px, 30vmin, 240px);
      height: auto;
 
      padding: 14px;
      box-sizing: border-box;
      border: 1px solid #00398e63;
      background: #00193f63;
      color: #e8e8f0;
      font-family: monospace;
      border-radius: 6px;
      cursor: pointer;

      overflow: hidden;

      display: flex;
      flex-direction: column;
 
      transition: opacity 0.4s, left 0.2s ease-out, top 0.2s ease-out,
                  transform 0.2s ease-out, border-color 0.2s ease-out;
    }
 
    .info-panel:hover {
      border: 4px solid #B67B00;
      transform: scale(1.04);
    }

    .info-panel.not-clickable {
      cursor: default;
      opacity: 0.75;
    }

    .info-panel.not-clickable:hover {
      border: 1px solid #00398e63;
      transform: none;
    }

    .info-panel .panel-image-wrap {
      width: 100%;
      aspect-ratio: 16 / 9;
      background: rgba(255, 255, 255, 0.05);
      border-radius: 4px;
      margin-bottom: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
      flex-shrink: 0;
    }
 
    .info-panel .panel-image-wrap img {
      max-width: 72%;
      max-height: 72%;
      width: auto;
      height: auto;
      object-fit: contain;
      display: block;
    }
 
    .info-panel h3 {
      margin: 0 0 6px 0;
      font-size: clamp(13px, 1.1vw, 16px);
      color: #ffffff;
    }
 
    .info-panel p {
      margin: 0;
      font-size: clamp(11px, 0.9vw, 13px);
      line-height: 1.4;
      color: #b8bcd6;
    }

    .panel-overlay {
      pointer-events: none;
      overflow: hidden;
      box-sizing: border-box;
    }

    /*if you can't render the circle without collision, make it a list instead*/
    .panel-overlay.list-mode {
      pointer-events: auto;
      overflow-y: auto;
      overflow-x: hidden;
      -webkit-overflow-scrolling: touch;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 14px;
      padding: 90px 16px 60px;
      scrollbar-width: none;
      -ms-overflow-style: none;
    }

    .panel-overlay.list-mode::-webkit-scrollbar {
      display: none;
    }
 
    .list-mode .info-panel {
      position: relative;
      opacity: 1;
      width: min(88vw, 340px);
      flex-shrink: 0;
    }
 
    .list-mode .info-panel:hover {
      transform: none; /* no hover-scale in a scrolling touch list */
    }
  `);

  styleTag.parent(document.head);
}

function createInformationPanels()
{
  const overlay = createDiv('')
  .id('panel-overlay')
  .class('panel-overlay')
  .style('position', 'absolute')
  .style('top', '0').style('left', '0')
  .style('width', '100%').style('height', '100dvh')

  informationPanelData.forEach((data, i) =>
  {
    const actualPanel = createDiv('InformationPanel')
      .parent(overlay)
      .class(data.link ? 'info-panel' : 'info-panel not-clickable')
      .style('position', 'absolute')
      .style('opacity', '0')
      .style('will-change', 'transform, opacity')
      .style('pointer-events', 'auto');

        if (data.link) { actualPanel.mousePressed(() => { window.location.href = data.link; });}

      //build the inner content for the panel, including the images and stuff
      const imageHTML = data.image
        ? `<div class="panel-image-wrap"><img src="${data.image}" alt="${data.title}"></div>`
        : '';
        actualPanel.html(`${imageHTML}<h3>${data.title}</h3><p>${data.detail}</p>`);

      //store panel info
      informationPanels.push(actualPanel);
      informationPanelBools.push(false);
  });

  overlayDiv = overlay;

}

function setListMode(enable)
{
  isListMode = enable;

  //if list mode, remove circle stuff and make list, else make back to circle
  if(enable)
  {
    overlayDiv.addClass('list-mode');
    for (const panel of informationPanels)
    {
      panel.elt.style.removeProperty('left');
      panel.elt.style.removeProperty('top');
      panel.elt.style.removeProperty('position');
    }
  }
  else
  {
    overlayDiv.removeClass('list-mode');
  }
}

//Computes a panel's target position purely in 2D screen space
function getPanelRingPosition(i, total, panelWidth, panelHeight)
{
  const centerX = windowWidth / 2;
  const centerY = windowHeight / 2;
  const margin = panelRingSettings.margin;
  const s = panelRingSettings;

  //calculate the max radius for now the x and y directions
  const availableRadiusX = max(0, (windowWidth - panelWidth) / 2 - margin);
  const availableRadiusY = max(0, (windowHeight - panelHeight) / 2 - margin);

  let radiusX = constrain(windowWidth * s.radiusRatioX, s.minRadiusX, s.maxRadiusX);
  let radiusY = constrain(windowHeight * s.radiusRatioY, s.minRadiusY, s.maxRadiusY);
 
  radiusX = min(radiusX, availableRadiusX);
  radiusY = min(radiusY, availableRadiusY);

  //do the rotation and slight movement up and down too
  const angle = -HALF_PI + (TWO_PI / total) * i; //start at top, go clockwise
  const bob = sin(frameCount * panelRingSettings.bobSpeed + i * 1.7) * panelRingSettings.bobAmount;

  return {
    x: centerX + cos(angle) * radiusX,
    y: centerY + sin(angle) * radiusY + bob
  };
}

function drawInformationPanels()
{
  const total = informationPanels.length;
  const margin = panelRingSettings.margin;

  //check to see if listMode should be used
  const shouldUseListMode = windowWidth < panelRingSettings.mobileBreakpoint
  if(shouldUseListMode !== isListMode)
  {
    setListMode(shouldUseListMode);
  }

  if(isListMode)
  {
    for(const panel of informationPanels)
    {
      panel.style('opacity', '1');
    }
    return;
  }


  for(let i = 0; i < total; i++)
  {
    const panel = informationPanels[i];
    const rect = panel.elt.getBoundingClientRect();
    const target = getPanelRingPosition(i, total, rect.width, rect.height);

    //calc the position of a panel
    let left = target.x - rect.width / 2;
    let top = target.y - rect.height / 2;

    //safety for overlapping/clipping
    left = constrain(left, margin, windowWidth - rect.width - margin);
    top = constrain(top, margin, windowHeight - rect.height - margin);

    //center the panel on its ring point using its actual rendered size
    panel.position(left, top);
    panel.style('opacity', '1');
  }
}