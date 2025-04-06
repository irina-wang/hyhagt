
/*
 * Dual-Hand Musical Controller - Properly Oriented Text Version
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
  
  video = createCapture(VIDEO);
  video.size(width, height);
  video.hide();
  
  handpose = ml5.handPose(video, { flipHorizontal: false }, modelReady);
  
  synth = new p5.PolySynth();
  synth.setADSR(0.05, 0.1, 0.5, 0.5);
  
  textSize(20);
  textAlign(CENTER, CENTER);
}

function modelReady() {
  console.log("Handpose model ready!");
  detectHands();
}

function detectHands() {
  if (video && video.loadedmetadata) {
    handpose.detect(video)
      .then(results => {
        gotHands(results);
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
  background(0, 0, 0, 25);
  image(video, 0, 0, width, height);
  drawNoteRegions();
  
  for (let i = 0; i < hands.length; i++) {
    let hand = hands[i];
    let landmarks = hand.landmarks;
    let indexTip = hand.index_finger_tip;
    let thumbTip = hand.thumb_tip;
    let pinchDist = dist(indexTip.x, indexTip.y, thumbTip.x, thumbTip.y);
    let isPinched = pinchDist < pinchThreshold;
    let centerX = (indexTip.x + thumbTip.x) / 2;
    let centerY = (indexTip.y + thumbTip.y) / 2;
    let isLeftSide = centerX < width/2;
    
    // Calculate angle between thumb and index finger
    let angle = atan2(thumbTip.y - indexTip.y, thumbTip.x - indexTip.x);
    
    // Adjust angle to keep text upright
    let displayAngle = angle;
    if (angle > PI/2 || angle < -PI/2) {
      displayAngle = angle + PI; // Flip 180 degrees if upside down
    }
    
    if (isLeftSide) {
      if (isPinched && !wasPinchedRight) {
        let noteIndex = floor(map(centerY, 0, height, 0, leftHandNotes.length));
        noteIndex = constrain(noteIndex, 0, leftHandNotes.length - 1);
        currentLeftNote = leftHandNotes[noteIndex];
        playNote(currentLeftNote, 0.7);
      }
      wasPinchedLeft = isPinched;
      
      // Draw properly oriented text for left hand
      drawOrientedText(
        "let's play",
        centerX,
        centerY,
        displayAngle,
        map(pinchDist, 0, 150, 12, 24),
        isPinched ? color(100, 100, 255, 200) : color(255, 255, 100, 200)
      );

    } else {
      if (isPinched && !wasPinchedLeft) {
        let noteIndex = floor(map(centerY, 0, height, 0, rightHandNotes.length));
        noteIndex = constrain(noteIndex, 0, rightHandNotes.length - 1);
        currentRightNote = rightHandNotes[noteIndex];
        playNote(currentRightNote, 0.5);
      }
      wasPinchedRight = isPinched;
      
      // Draw properly oriented text for right hand
      drawOrientedText(
        "hope you have a good time",
        centerX,
        centerY,
        displayAngle,
        map(pinchDist, 0, 150, 12, 18),
        isPinched ? color(255, 100, 100, 200) : color(100, 255, 100, 200)
      );
    }
  }
  
  fill(255);
  text("Left: " + (currentLeftNote || "-"), width/4, 30);
  text("Right: " + (currentRightNote || "-"), 3*width/4, 30);
}

function drawOrientedText(txt, x, y, angle, size, col) {
  push();
  translate(x, y);
  rotate(angle); // Now using adjusted angle
  textAlign(CENTER, CENTER);
  textSize(size);
  fill(col);
  text(txt, 0, 0);
  pop();
}

function drawNoteRegions() {
  let regionHeight = height / leftHandNotes.length;
  for (let i = 0; i < leftHandNotes.length; i++) {
    fill(255, 100, 100, 30);
    rect(0, i * regionHeight, width/2, regionHeight);
    fill(255);
    text(leftHandNotes[i], width/4, (i + 0.5) * regionHeight);
  }
  
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
