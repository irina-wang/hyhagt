let poseNet;
let poses = [];
let words = ['hope', 'you', 'have', 'a', 'good', 'time', 'hope', 'you', 'have', 'a', 'good', 'time', 'hope', 'you', 'have', 'a', 'good', 'time', 'hope', 'you', 'have', 'a', 'good', 'time', 'hope', 'you', 'have', 'a', 'good', 'time', 'hope', 'you', 'have', 'a', 'good', 'time', 'hope', 'you', 'have', 'a', 'good', 'time','hope', 'you', 'have', 'a', 'good', 'time', 'hope', 'you', 'have', 'a', 'good', 'time', 'hope', 'you', 'have', 'a', 'good', 'time'];
let positionedWords = [];
let initWidth = 600;
let initHeight = 450;
let font;

function preload() {  
  font = loadFont("../../fonts/Orbitron-VariableFont_wght.ttf");
}

function setup() {

  let canvas = createCanvas(initWidth, initHeight);
  canvas.position(windowWidth/2-initWidth/2, windowHeight/2-initHeight/2);
  
  video = createCapture(VIDEO);
  video.size(width, height);
  video.hide();
  
  // Initialize PoseNet
  poseNet = ml5.poseNet(video, modelReady);
  poseNet.on('pose', function(results) {
    poses = results;
  });
  
  video.hide();
  
  // Initialize words with random positions (will be repositioned when pose is detected)
  for (let word of words) {
    positionedWords.push({
      word: word,
      x: random(width),
      y: random(height),
      size: random(12, 24)
    });
  }
}

function modelReady() {
  select('#status').html('Model Loaded');
}

function draw() {
  background(220);
  
  // Draw video feed
  image(video, 0, 0, width, height);
  
  // If a pose is detected, update word positions
  if (poses.length > 0) {
    updateWordPositions();
  }
  
  // Draw all words
  for (let w of positionedWords) {
    textSize(w.size);
    text(w.word, w.x, w.y);
    textFont(font);
  }
  
  // Optional: Draw pose keypoints
  // drawKeypoints();
}

function updateWordPositions() {
  let pose = poses[0].pose;
  
  // Get bounding area of the pose
  let minX = width, maxX = 0, minY = height, maxY = 0;
  for (let keypoint of pose.keypoints) {
    if (keypoint.position.x < minX) minX = keypoint.position.x;
    if (keypoint.position.x > maxX) maxX = keypoint.position.x;
    if (keypoint.position.y < minY) minY = keypoint.position.y;
    if (keypoint.position.y > maxY) maxY = keypoint.position.y;
  }
  
  // Add some padding
  let padding = 50;
  minX -= padding;
  maxX += padding;
  minY -= padding;
  maxY += padding;
  
  // Reposition words around the pose
  for (let i = 0; i < positionedWords.length; i++) {
    // Either position randomly in bounding box or near specific keypoints
    if (random() > 0.5) {
      // Random position in bounding box
      positionedWords[i].x = random(minX, maxX);
      positionedWords[i].y = random(minY, maxY);
    } else {
      // Position near a random keypoint
      let kp = random(pose.keypoints);
      positionedWords[i].x = kp.position.x + random(-1, 1);
      positionedWords[i].y = kp.position.y + random(-1, 1);
    }
    
    // Keep words on canvas
    positionedWords[i].x = constrain(positionedWords[i].x, 0, width);
    positionedWords[i].y = constrain(positionedWords[i].y, 0, height);
  }
}

// Optional: function to draw keypoints
function drawKeypoints() {
  for (let pose of poses) {
    for (let keypoint of pose.pose.keypoints) {
      if (keypoint.score > 0.2) {
        fill(255, 0, 0);
        noStroke();
        ellipse(keypoint.position.x, keypoint.position.y, 10, 10);
      }
    }
  }
}