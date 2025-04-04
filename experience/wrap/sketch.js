let poseNet;
let poses = [];
let video;
let sentence = "I remember days of good childhood. Running bare upper body in the street was must, accompanied by buddy group in the low line areas where Water could be splashed. Those were the carefree days, I still reminisce.";
let words = [];
let fontSize = 14;
let wrapRadius = 150;
let rotationSpeed = 0.01;
let currentAngle = 0;
let torsoHeight = 0;
let torsoCenter = { x: 0, y: 0 };

// Wrap text effect
// maybe not just hip and shoulder? 
// more dynamic wrapping
// shake-off effect

function setup() {
  createCanvas(640, 480);
  video = createCapture(VIDEO);
  video.size(width, height);
  
  // Split sentence into words and clean them
  words = sentence.split(/\s+/).map(word => 
    word.replace(/[.,]/g, '')
  );
  
  // Initialize PoseNet
  poseNet = ml5.poseNet(video, modelReady);
  poseNet.on('pose', gotPoses);
  
  video.hide();
}

function modelReady() {
  console.log("PoseNet ready!");
}

function gotPoses(results) {
  poses = results;
}

function draw() {
  background(0);
  image(video, 0, 0, width, height);
  
  if (poses.length > 0) {
    let pose = poses[0].pose["keypoints"];
    // console.log(pose)
    // Calculate torso dimensions
    let leftShoulder = pose[5];
    let rightShoulder = pose[6];
    let leftHip = pose[11];
    let rightHip = pose[12];
    // console.log(leftShoulder.position.x)
    if (leftShoulder.score > 0.3 && rightShoulder.score > 0.3 &&
        leftHip.score > 0.3 && rightHip.score > 0.3) {
      // Calculate torso center and height
      torsoCenter = {
        x: (leftShoulder.position.x + rightShoulder.position.x + leftHip.position.x + rightHip.position.x) / 4,
        y: (leftShoulder.position.y + rightShoulder.position.y + leftHip.position.y + rightHip.position.y) / 4
      };
      // console.log("torsoHeight", torsoHeight)

      
      torsoHeight = dist(
        (leftShoulder.position.x + rightShoulder.position.x) / 2,
        (leftShoulder.position.y + rightShoulder.position.y) / 2,
        (leftHip.position.x + rightHip.position.y) / 2,
        (leftHip.position.y + rightHip.position.y) / 2
      );
      // console.log("torsoHeight", torsoHeight)

      
      wrapRadius = torsoHeight * 0.6;
      console.log("wrapRadius", wrapRadius)

      // Draw debug points
      fill(255, 0, 0);
      noStroke();
      ellipse(leftShoulder.position.y, leftShoulder.position.y, 10, 10);
      ellipse(rightShoulder.position.y, rightShoulder.position.y, 10, 10);
      ellipse(leftHip.position.y, leftHip.position.y, 10, 10);
      ellipse(rightHip.position.y, rightHip.position.y, 10, 10);
      ellipse(torsoCenter.y, torsoCenter.y, 15, 15);
      
      // Wrap text around the torso
      wrapTextAroundTorso();
      
      // Rotate over time
      currentAngle += rotationSpeed;
    }
  }
}

function wrapTextAroundTorso() {
  if (words.length === 0) return;
  
  push();
  translate(torsoCenter.x, torsoCenter.y);
  
  // Calculate how many words we need to fill the cylinder
  const circumference = 2 * PI * wrapRadius;
  const wordsPerCircle = floor(circumference / (fontSize * 1.2)); // Adjusted spacing
  
  // Create extended word array by repeating the sentence
  let extendedWords = [];
  const neededRepetitions = ceil(wordsPerCircle / words.length) + 1;
  for (let i = 0; i < neededRepetitions; i++) {
    extendedWords = extendedWords.concat(words);
  }
  
  // Calculate vertical distribution
  const verticalLevels = 20;
  const verticalStep = torsoHeight / (verticalLevels - 1);
  const verticalOffset = -torsoHeight/2;
  
  // Draw words in cylindrical pattern
  for (let level = 0; level < verticalLevels; level++) {
    const yPos = verticalOffset + level * verticalStep;
    
    const wordsAtLevel = min(extendedWords.length, wordsPerCircle);
    const angleStep = TWO_PI / wordsAtLevel;
    
    for (let i = 0; i < wordsAtLevel; i++) {
      const angle = currentAngle + i * angleStep;
      const x = cos(angle) * wrapRadius;
      const z = sin(angle) * wrapRadius;
      
      // Apply perspective
      const scale = map(z, -wrapRadius, wrapRadius, 0.7, 1.3);
      const alpha = map(z, -wrapRadius, wrapRadius, 100, 255);
      
      push();
      translate(x, yPos);
      rotate(-angle);
      
      fill(255, 255, 255, alpha);
      noStroke();
      textSize(fontSize);
      text(extendedWords[i], 0, 0);
      pop();
    }
  }
  pop();
}

function keyPressed() {
  // Adjust rotation speed with arrow keys
  if (keyCode === LEFT_ARROW) {
    rotationSpeed -= 0.005;
  } else if (keyCode === RIGHT_ARROW) {
    rotationSpeed += 0.005;
  } else if (keyCode === UP_ARROW) {
    fontSize = min(fontSize + 2, 36);
  } else if (keyCode === DOWN_ARROW) {
    fontSize = max(fontSize - 2, 12);
  }
}