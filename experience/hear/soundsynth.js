let polySynth;

function setup() {
  let cnv = createCanvas(1000, 1000);
  cnv.mousePressed(playSynth);
  background(220);
  text('click to play', 20, 20);

  polySynth = new p5.PolySynth();
}

function playSynth() {
  userStartAudio();

  // note duration (in seconds)
  let dur = 1.5;

  // time from now (in seconds)
  let time = 0;

  // velocity (volume, from 0 to 1)
  let vel = 0.1;

  // notes can overlap with each other
  // D major
  // polySynth.play('D4', vel, 0, dur);
  // polySynth.play('E4', vel, time += 1/3, dur);
  // polySynth.play('F#4', vel, time += 1/3, dur);
  // polySynth.play('G4', vel, time += 1/3, dur);
  // polySynth.play('A4', vel, time += 1/3, dur);
  // polySynth.play('B4', vel, time += 1/3, dur);
  // polySynth.play('C#5', vel, time += 1/3, dur);

  // D minor
  polySynth.play('D4', vel, 0, dur);
  polySynth.play('E4', vel, time += 1/3, dur);
  polySynth.play('F4', vel, time += 1/3, dur);
  polySynth.play('G4', vel, time += 1/3, dur);
  polySynth.play('A4', vel, time += 1/3, dur);
  polySynth.play('Bb4', vel, time += 1/3, dur);
  polySynth.play('C5', vel, time += 1/3, dur);

}