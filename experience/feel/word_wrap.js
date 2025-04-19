let poseNet;
let video;
let poses = [];
// This will use the global variable we set in the HTML
let memoryText = window.memory_text || "Default text if not set";
let memoryColor = window.memory_color || "rgba(255, 245, 220, 0.9)";

let memory_text = memoryText;
let words = [];
// let words = ['hope', 'you', 'have', 'a', 'good', 'time', 'hope', 'you', 'have', 'a', 'good', 'time', 'hope', 'you', 'have', 'a', 'good', 'time', 'hope', 'you', 'have', 'a', 'good', 'time', 'hope', 'you', 'have', 'a', 'good', 'time', 'hope', 'you', 'have', 'a', 'good', 'time', 'hope', 'you', 'have', 'a', 'good', 'time','hope', 'you', 'have', 'a', 'good', 'time', 'hope', 'you', 'have', 'a', 'good', 'time', 'hope', 'you', 'have', 'a', 'good', 'time'];
let positionedWords = [];
let textVisible = true;
let initWidth = 600;
let initHeight = 450;

function preload() {  
    font = loadFont("../../fonts/Orbitron-VariableFont_wght.ttf");
}

function setup() {
//   let canvas = createCanvas(initWidth, initHeight);
//   canvas.position(windowWidth/2-initWidth/2, windowHeight/2-initHeight/2);
  
  let canvas = createCanvas(591*1.5, 399*1.5);
  canvas.parent('canvas-container'); // Put canvas in a div

  video = createCapture(VIDEO);
  video.size(width, height);
  video.hide();
  
  // Initialize PoseNet
  poseNet = ml5.poseNet(video, modelReady);
  poseNet.on('pose', function(results) {
    poses = results;
  });

  let words = parseParagraphToWords(memory_text);

  
  // Initialize words with random positions
  for (let word of words) {
    positionedWords.push({
      word: word,
      x: random(width),
      y: random(height),
      size: random(12, 24)
    });
  }
}

function parseParagraphToWords(paragraph) {
    // Convert to lowercase and clean the text
    const cleanedText = paragraph.toLowerCase()
      .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, ' ')
      .replace(/\s{2,}/g, ' ');
    
    // Split into words and filter out empty strings
    let words = cleanedText.split(' ').filter(word => word.length > 0);
    
    // If we have fewer than 50 words, expand the array
    if (words.length < 100) {
      const originalLength = words.length;
      const neededWords = 100 - originalLength;
      
      // Calculate how many times we need to cycle through the original words
      const fullCycles = Math.floor(neededWords / originalLength);
      const remainderWords = neededWords % originalLength;
      
      // Add complete cycles of the original words
      for (let i = 0; i < fullCycles; i++) {
        words = words.concat(words.slice(0, originalLength));
      }
      
      // Add remaining words if needed
      if (remainderWords > 0) {
        words = words.concat(words.slice(0, remainderWords));
      }
    }
    
    return words.slice(0, 100); // Ensure exactly 50 words
  }
  


function modelReady() {
  select('#status').html('Model Loaded - Raise one arm to top to hide text');
}

function draw() {
  background(220);
  
  // Draw video feed
  image(video, 0, 0, width, height);
  
  // If a pose is detected
  if (poses.length > 0) {
    updateWordPositions();
    checkArmPosition();
  }
  
  // Draw all words if visible
  if (textVisible) {
    for (let w of positionedWords) {
      textSize(w.size);
      text(w.word, w.x, w.y);
      textFont(font)
      //green
      fill(0,255,0)
    }
  }
  
  // Display status
  fill(255);
  noStroke();
  rect(10, 10, 200, 30);
  fill(0);
  textSize(14);
  textAlign(LEFT, TOP);
  text(textVisible ? "TEXT VISIBLE" : "TEXT HIDDEN", 20, 20);

  // drawKeypoints();
}

function checkArmPosition() {
  let pose = poses[0].pose;
  
//   console.log("pose +")
//   console.log(pose)

  // Get wrist positions (PoseNet 0.2.2 keypoint numbering)
  let leftWrist = pose.keypoints[9];
  let rightWrist = pose.keypoints[10];
  let nose = pose.keypoints[0];
  let leftEye = pose.keypoints[1];
  let rightEye = pose.keypoints[2];

  // Check if either wrist is at top of screen (with some threshold)
  const topThreshold = 50; // pixels from top
  const confidenceThreshold = 0.5;
  
//   const armCrossed = leftWrist.position.x < rightWrist.position.x && leftWrist.score > confidenceThreshold && rightWrist.score > confidenceThreshold
  const eyesCovered = Math.abs(rightEye.position.x - rightWrist.position.x) < topThreshold && Math.abs(leftEye.position.x - leftWrist.position.x) < topThreshold
&& rightEye.position.y < rightWrist.position.y && leftEye.position.y < leftWrist.position.y
  //   && 5* Math.abs(nose.position.y -rightEye.position.y) >  Math.abs(rightWrist.position.y - rightEye.position.y)
// 
// 
//  && rightEye > confidenceThreshold && 
  console.log(rightEye.position.x - rightWrist.position.x < 50)

  if (eyesCovered){
    textVisible = false;
  } else{
    textVisible = true;
  }
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
  minX = constrain(minX - padding, 0, width);
  maxX = constrain(maxX + padding, 0, width);
  minY = constrain(minY - padding, 0, height);
  maxY = constrain(maxY + padding, 0, height);
  
  // Reposition words around the pose (only if visible)
  if (textVisible) {
    for (let i = 0; i < positionedWords.length; i++) {
      if (random() > 0.5) {
        // Random position in bounding box
        positionedWords[i].x = random(minX, maxX);
        positionedWords[i].y = random(minY, maxY);
      } else {
        // Position near a random keypoint
        let kp = random(pose.keypoints);
        positionedWords[i].x = kp.position.x + random(-20, 20);
        positionedWords[i].y = kp.position.y + random(-20, 20);
      }
    }
  }
}

function drawKeypoints() {
  for (let pose of poses) {
    for (let keypoint of pose.pose.keypoints) {
      if (keypoint.score > 0.2) {
        text(keypoint.part, keypoint.position.x, keypoint.position.y)
        textSize(20)
        fill(255, 255, 0);
        noStroke();
        ellipse(keypoint.position.x, keypoint.position.y, 10, 10);
      }
    }
  }
}

function windowResized() {
  resizeCanvas(initWidth, initHeight);
  canvas.position(windowWidth/2-initWidth/2, windowHeight/2-initHeight/2);
}