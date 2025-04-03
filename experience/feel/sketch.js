let poseNet;
let poses = [];
let words = ["I", "see", "the", "rise", "in", "the", "mirror", "Take", "my", "hand", "i", "can", "help", "you", "to", "find", "ourselves", "in", "this", "limbo", "And", "now", "i", "can", "go", "forget", "it", "detail", "When", "i", "falling", "down", "i", "run", "away", "in", "compton", "I", "was", "so", "far", "in", "my", "whole", "map", "Give", "me", "love", "hold", "me", "closer", "say", "my", "love", "until", "a", "better", "times", "No matter what a kinda feeling inside me", "What i know in this world in an dark light tend", "Da dee Da dee Da dee day", "I can dying dying day", "If i cannot see your face again", "And shape of natty fance", "On the moon", "Please dot rules", "Our mummies", "In this room", "Are you stressed In a bloody lips", "Looking for your side of list", "Hungry kiss", "When a tingle hapinness. God bless!", "You know what it is", "Are you come for this?", "You know what it is", "Are you come for this?"];
let positionedWords = [];
let video;

// TODO: emphasize person's countour
// TODO: improve text display/sticking
// TODO: display still object / swing
// TODO: explore shake-off effects

function setup() {
  createCanvas(640, 480);
  video = createCapture(VIDEO);
  video.size(width, height);
  
  // Initialize PoseNet
  poseNet = ml5.poseNet(video, modelReady);
  poseNet.on('pose', function(results) {
    poses = results;
  });
  
  video.hide();
  
  // Initialize words with random positions, colors, and rotations
  for (let word of words) {
    positionedWords.push({
      word: word,
      x: random(width),
      y: random(height),
      size: random(12, 36),
      color: color(random(255), random(255), random(255), 200),
      rotation: random(TWO_PI),
      rotationSpeed: random(-0.05, 0.05)
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
  
  // Draw all words with rotation and color
  for (let w of positionedWords) {
    push(); // Save current drawing state
    translate(w.x, w.y); // Move to word position
    rotate(w.rotation); // Apply rotation
    // w.rotation += w.rotationSpeed; // Update rotation
    
    // Draw text with color and white outline for visibility
    fill(w.color);
    stroke(255);
    strokeWeight(2);
    textSize(w.size);
    textAlign(CENTER, CENTER);
    text(w.word, 0, 0);
    pop(); // Restore original drawing state
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
  let padding = 25;
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
      positionedWords[i].x = kp.position.x + random(-20, 20);
      positionedWords[i].y = kp.position.y + random(-20, 20);
    }
    
    // Keep words on canvas
    positionedWords[i].x = constrain(positionedWords[i].x, 0, width);
    positionedWords[i].y = constrain(positionedWords[i].y, 0, height);
    
    // Occasionally change color and rotation speed
    // if (random() < 0.01) {
    //   positionedWords[i].color = color(random(255), random(255), random(255), 200);
    //   positionedWords[i].rotationSpeed = random(-0.05, 0.05);
    // }
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