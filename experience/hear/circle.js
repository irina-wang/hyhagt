/*
 * Dual-Hand Musical Controller - Final Working Version
 */

let handpose;
let video;
let hands = [];
let pinchThreshold = 40;
let wasPinchedLeft = false;
let wasPinchedRight = false;
let initWidth = 600;
let initHeight = 450;
// Sound variables
let synth;
let leftHandNotes = ['C3', 'D3', 'E3', 'F3', 'G3', 'A3', 'B3'];
let rightHandNotes = ['C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'B4'];
let currentLeftNote = '';
let currentRightNote = '';

function setup() {
  let canvas = createCanvas(initWidth, initHeight);
  canvas.position(windowWidth/2-initWidth/2, windowHeight/2-initHeight/2);
  
  // Create video with proper DOM element
  video = createCapture(VIDEO);
  video.size(width, height);
  video.hide();
  // video.parent('videoContainer');
  
  // Initialize handpose model
  handpose = ml5.handPose(video, { flipHorizontal: false }, modelReady);
  
  // Create synth
  synth = new p5.PolySynth();
  synth.setADSR(0.05, 0.1, 0.5, 0.5);
  
  textSize(20);
  textAlign(CENTER, CENTER);
}

function modelReady() {
  console.log("Handpose model ready!");
  // Start detection loop
  detectHands();
}

function detectHands() {
  if (video && video.loadedmetadata) {
    handpose.detect(video)
      .then(results => {
        gotHands(results);
        // Continue detection
        requestAnimationFrame(detectHands);
      })
      .catch(err => {
        console.error("Detection error:", err);
        requestAnimationFrame(detectHands);
      });
  } else {
    requestAnimationFrame(detectHands);
  }
}

function gotHands(results) {
  hands = results;
}

function draw() {
  // Clear with semi-transparent background for trail effect
  background(0, 0, 0, 25);
  
  // Draw video feed
  image(video, 0, 0, width, height);
  
  drawNoteRegions();
  
  // Process all detected hands
  for (let i = 0; i < hands.length; i++) {
    let hand = hands[i];
    
    // Get landmarks
    let indexTip = hand.index_finger_tip;  // Index finger tip
    let thumbTip = hand.thumb_tip;  // Thumb tip
    // console.log(indexTip)
    // console.log(thumbTip)

    let pinchDist = dist(indexTip.x, indexTip.y, thumbTip.x, thumbTip.y);
    let isPinched = pinchDist < pinchThreshold;
    console.log(hand)
    console.log(pinchDist, isPinched)

    // Get hand midpoint
    let centerX = (indexTip.x + thumbTip.x) / 2;
    let centerY = (indexTip.y + thumbTip.y) / 2;
    
    // Determine if hand is on left or right side of screen
    let isLeftSide = centerX < width/2;
    
    if (isLeftSide) {
      // Left side logic
      if (isPinched && !wasPinchedRight) {
        let noteIndex = floor(map(centerY, 0, height, 0, leftHandNotes.length));
        noteIndex = constrain(noteIndex, 0, leftHandNotes.length - 1);
        currentLeftNote = leftHandNotes[noteIndex];
        playNote(currentLeftNote, 0.7); // Slightly louder for bass
      }
      wasPinchedLeft = isPinched;
      
      // Visual feedback for left hand
      fill(isPinched ? color(100, 100, 255, 150) : color(255, 255, 100, 150));
      circle(centerX, centerY, -pinchDist);

    } else {
      // Right side logic
      if (isPinched && !wasPinchedLeft) {
        let noteIndex = floor(map(centerY, 0, height, 0, rightHandNotes.length));
        noteIndex = constrain(noteIndex, 0, rightHandNotes.length - 1);
        currentRightNote = rightHandNotes[noteIndex];
        playNote(currentRightNote, 0.5);
      }
      wasPinchedRight = isPinched;
      
      // Visual feedback for right hand
      fill(isPinched ? color(255, 100, 100, 150) : color(100, 255, 100, 150));
      circle(centerX, centerY, -pinchDist);
    }
  }
  
  // Display current notes
  fill(255);
  text("Left: " + (currentLeftNote || "-"), width/4, 30);
  text("Right: " + (currentRightNote || "-"), 3*width/4, 30);
}

function drawNoteRegions() {
  // Left side regions (bass)
  let regionHeight = height / leftHandNotes.length;
  for (let i = 0; i < leftHandNotes.length; i++) {
    fill(255, 100, 100, 30);
    rect(0, i * regionHeight, width/2, regionHeight);
    fill(255);
    text(leftHandNotes[i], width/4, (i + 0.5) * regionHeight);
  }
  
  // Right side regions (treble)
  for (let i = 0; i < rightHandNotes.length; i++) {
    fill(100, 100, 255, 30);
    rect(width/2, i * regionHeight, width/2, regionHeight);
    fill(255);
    text(rightHandNotes[i], 3*width/4, (i + 0.5) * regionHeight);
  }
}

function playNote(note, velocity) {
  try {
    synth.play(note, velocity, 0, 0.2);
  } catch (e) {
    console.error("Error playing note:", e);
  }
}

function windowResized() {
  resizeCanvas(initWidth, initHeight);
  video.size(width, height);
}