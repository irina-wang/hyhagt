
// Letter Variables
let rings = []; 
let numRing = 5;
let fonts = [];
let isPaused = false;
let imageID = 'letter_art';


// This will use the global variable we set in the HTML
let memoryText = window.memory_text || "Default text if not set";
let memoryColor = window.memory_color || "rgba(255, 245, 220, 0.9)";


let counter = 0;
let letters = [];  // Array to store the trail of letters
let memory_text = memoryText; // Use the passed memory text
let alphabets = []
// let alphabets = ["h","o","p","e"," ", "y","o","u"," ", "h","a","v","e"," ", "a"," ", "g","r","e","a","t", " ", "t","i","m","e"]

function preload() {  
  fonts[0] = loadFont("../../fonts/Barriecito-Regular.ttf");
}

function setup() {
  let canvas = createCanvas(591*1.5, 399*1.5);
  canvas.parent('canvas-container'); // Put canvas in a div
  textColor = getContrastColor(...bgColor);
  textAlign(CENTER, CENTER);

  // Example usage:

  alphabets = parseParagraphToAlphabets(memory_text);
  console.log(alphabets);
  
  // Create export button OFF-CANVAS
  let exportBtn = createButton('Export Image');
  exportBtn.parent('controls-container'); // Place in separate div
  exportBtn.mousePressed(exportCanvas);
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
  // background([148, 0, 211]);
  background([228,212,187]);
  if (!isPaused&&frameCount % 2 === 0) {
    counter +=1 
      
    let letter = alphabets[counter%alphabets.length];  // Pick a random letter from the alphabet
    console.log(memory_text)
    let fontSize = random(15, 30);  // Random font size
    let font = fonts[0];  // Use the first font
    letters.push(new Letter(letter, fontSize, font));  // Create and add new letter to the trail
  }
  
  // Update and display each letter in the trail
  for (let i = letters.length - 1; i >= 0; i--) {
    letters[i].update();  // Update the letter's position
    letters[i].display();  // Display the letter
    
    // If the letter's lifespan is over, remove it from the trail
    if (letters[i].alpha <= 0) {
      letters.splice(i, 1);  // Remove letter from the array
    }
  }
}

function mousePressed() {
  // Only pause if clicking on canvas (not buttons)
  if (mouseX >= 0 && mouseX < width && mouseY >= 0 && mouseY < height) {
    isPaused = !isPaused;
  }
}

function exportCanvas() {
  saveCanvas(imageID, 'png');
}

function trigger(letter, mouth) {
  let force = p5.Vector.sub(letter.position, mouth);
  let distance = force.mag();
  force.normalize();
  
  let magnitude = map(distance, 0, width, 0.1, 1) * random(0.5, 1);
  force.mult(magnitude);
  letter.applyForce(force);
  
  letter.angleV = map(distance, 0, width, 0.01, 0.1) *random(0.5, 1);
}