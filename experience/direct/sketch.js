// Letter Variables
let rings = []; 
let numRing = 5;
let fonts = [];
let isPaused = false;
let imageID = '| Type your image name...';
let exportInput;

// This will use the global variable we set in the HTML
let memoryText = window.memory_text || "Default text if not set";
let memoryColor = window.memory_color || "rgba(255, 245, 220, 0.9)";

let counter = 0;
let letters = [];  // Array to store the trail of letters
let memory_text = memoryText; // Use the passed memory text
let alphabets = [];

function preload() {  
  fonts[0] = loadFont("../../fonts/Barriecito-Regular.ttf");
}

function setup() {
  let canvas = createCanvas(591*1.5, 399*1.5);
  canvas.parent('canvas-container'); // Put canvas in a div
  textColor = getContrastColor(...bgColor);
  textAlign(CENTER, CENTER);

  // Create text input for filename
  exportInput = createInput(imageID);
  exportInput.parent('controls-container');
  exportInput.attribute('placeholder', 'Enter filename');
  
  // Create export button
  let exportBtn = createButton('Export Image');
  exportBtn.parent('controls-container');
  exportBtn.mousePressed(exportCanvas);

  alphabets = parseParagraphToAlphabets(memory_text);
  console.log(alphabets);
}

function parseParagraphToAlphabets(paragraph) {
  // Convert to lowercase and split into array of characters
  console.log(paragraph)
  const chars = paragraph.toLowerCase().split('');
  
  // Filter to only include alphabetic characters and spaces
  const alphabets = chars.filter(char => {
    // Keep letters a-z or space
    return (char >= 'a' && char <= 'z') || char === ' ';
  });
  
  return alphabets;
}

function draw() {
  background([228,212,187]);
  if (!isPaused && frameCount % 2 === 0) {
    counter += 1;
    let letter = alphabets[counter%alphabets.length];
    let fontSize = random(15, 30);
    let font = fonts[0];
    letters.push(new Letter(letter, fontSize, font));
  }
  
  for (let i = letters.length - 1; i >= 0; i--) {
    letters[i].update();
    letters[i].display();
    
    if (letters[i].alpha <= 0) {
      letters.splice(i, 1);
    }
  }
}

function mousePressed() {
  if (mouseX >= 0 && mouseX < width && mouseY >= 0 && mouseY < height) {
    isPaused = !isPaused;
  }
}

function exportCanvas() {
  let filename = exportInput.value().trim();
  if (filename === '') {
    filename = imageID;
  }
  filename = filename.replace(/\..+$/, ''); // Remove any existing extension
  saveCanvas(canvas, filename, 'png');
}

function trigger(letter, mouth) {
  let force = p5.Vector.sub(letter.position, mouth);
  let distance = force.mag();
  force.normalize();
  
  let magnitude = map(distance, 0, width, 0.1, 1) * random(0.5, 1);
  force.mult(magnitude);
  letter.applyForce(force);
  
  letter.angleV = map(distance, 0, width, 0.01, 0.1) * random(0.5, 1);
}