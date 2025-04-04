
/*
 * Musical Hand Pose Controller
 * Uses ml5.js handPose to trigger different notes when pinching
 */

let handPose;
let video;
let hands = [];
let pinchThreshold = 30; // Distance threshold for considering a pinch
let wasPinched = false; // To track pinch state changes

// Sound variables
let polySynth;
let notes = ['C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'B4', 'C5'];
let currentNote = '';

function preload() {
  // Load the handPose model
  handPose = ml5.handPose();
}

function setup() {
  createCanvas(640, 480);
  
  // Create the webcam video and hide it
  video = createCapture(VIDEO);
  video.size(640, 480);
  video.hide();
  
  // Start detecting hands from the webcam video
  handPose.detectStart(video, gotHands);
  
  // Create a sound synth - now with proper p5.sound library loaded
  polySynth = new p5.PolySynth();
  
  // Set up synth parameters
  if (polySynth) {
    polySynth.setADSR(0.05, 0.1, 0.5, 0.5); // Attack, Decay, Sustain, Release
  }
  
  textSize(20);
  textAlign(CENTER, CENTER);
}

function draw() {
  // Draw the webcam video
  image(video, 0, 0, width, height);
  
  // Draw note regions (optional visualization)
  drawNoteRegions();
  
  // If there is at least one hand
  if (hands.length > 0) {
    // Find the index finger tip and thumb tip
    let finger = hands[0].index_finger_tip;
    let thumb = hands[0].thumb_tip;
    
    // Calculate the pinch distance
    let pinchDist = dist(finger.x, finger.y, thumb.x, thumb.y);
    
    // Check if pinched (distance below threshold)
    let isPinched = pinchDist < pinchThreshold;
    
    // If just started pinching (tap gesture)
    if (isPinched && !wasPinched) {
      // Get the midpoint between finger and thumb
      let centerX = (finger.x + thumb.x) / 2;
      let centerY = (finger.y + thumb.y) / 2;
      
      // Map the Y position to a note (higher on screen = higher pitch)
      let noteIndex = floor(map(centerY, 0, height, 0, notes.length));
      noteIndex = constrain(noteIndex, 0, notes.length - 1);
      currentNote = notes[noteIndex];
      
      // Play the note if synth is available
      if (polySynth) {
        playNote(currentNote);
      }
    }
    
    // Update pinch state
    wasPinched = isPinched;
    
    // Visual feedback
    fill(isPinched ? color(255, 0, 0, 150) : color(0, 255, 0, 150));
    noStroke();
    circle((finger.x + thumb.x)/2, (finger.y + thumb.y)/2, pinchDist);
    
    // Display current note
    if (currentNote) {
      fill(255);
      text("Current Note: " + currentNote, width/2, 30);
    }
  }
}

function drawNoteRegions() {
  // Visualize the note regions (optional)
  let regionHeight = height / notes.length;
  for (let i = 0; i < notes.length; i++) {
    fill(0, 0, 255, 30);
    rect(0, i * regionHeight, width, regionHeight);
    fill(255);
    text(notes[i], width/2, (i + 0.5) * regionHeight);
  }
}

function playNote(note) {
  try {
    // Play the note with the synth
    polySynth.play(note, 0.5, 0, 0.2);
    console.log("Playing note: " + note);
  } catch (e) {
    console.error("Error playing note:", e);
  }
}

// Callback function for when handPose outputs data
function gotHands(results) {
  // Save the output to the hands variable
  hands = results;
}