let bgColor = [148, 0, 211]; // Purple
let textColor;

class Letter {
  constructor(letter, fontSize, font) {
    this.letter = letter;
    this.fontSize = fontSize;
    this.font = font;
    
    // Start at the mouse position with a slight random offset
    this.position = createVector(mouseX, mouseY + random(-3, 3));
    this.alpha = 255;  // Initial opacity
    this.lifespan = 255;  // Lifespan of the letter (alpha)
  }
  
  // Update the letter's position toward the mouse
  update() {
    let target = createVector(mouseX, mouseY);  // The target is the mouse position
    let force = p5.Vector.sub(target, this.position);  // Calculate direction toward the mouse
    let distance = force.mag();  // Calculate distance
    
    // Move towards the mouse with a smooth, limited speed
    let speed = map(distance, 0, width, 1, 2);  // Speed based on distance
    force.setMag(speed*0.2);  // Set the force magnitude to the desired speed
    
    this.position.add(force);  // Move the letter towards the mouse
    
    // Fade the letter over time
    this.lifespan -= 0.15;  // Decrease lifespan (fading)
    this.alpha = this.lifespan;  // Set alpha based on lifespan
    this.alpha = constrain(this.alpha, 0, 255);  // Ensure alpha is within bounds
  }
  
  // Display the letter
  display() {
    textColor = getContrastColor(148, 0, 211); // Spread operator

    fill(textColor[0], textColor[1], textColor[2], this.alpha);  // White color with fading alpha
    noStroke();
    textSize(this.fontSize);
    textAlign(CENTER, CENTER);
    textFont(this.font);
    text(this.letter, this.position.x, this.position.y);
  }
}

function getContrastColor(r, g, b) {
  return [255-r, 255-g, 255-b]
}