//sketch.js
//├── WelcomeScreen
//├── Verification
//│   ├── TextCaptcha
//│   ├── ImageCaptcha
//│   ├── MemoryRecognition
//│   └── HumanIntuition
//│
//├── MemoryPrompt
//│
//└── Exhibition
//    ├── Artwork
//    └── VideoLayer

let welcomeScreen;
let verification;
let memoryPrompt;
let exhibition;

let currentPage = "welcome";

async function setup() {
  createCanvas(1000, 700);

  welcomeScreen = new WelcomeScreen();
  verification = new Verification();
  memoryPrompt = new MemoryPrompt();
  exhibition = new Exhibition();
  await verification.loadImages();

  console.log("All images loaded!");
}

function draw() {
  background(248);

  if (currentPage === "welcome") {
    welcomeScreen.display();
  }

  else if (currentPage === "verification") {
    verification.display();
  }

  else if (currentPage === "memory") {
    memoryPrompt.display();
  }

  else if (currentPage === "exhibition") {
    exhibition.display();
  }
}

function mousePressed() {

  if (currentPage === "welcome") {
    welcomeScreen.mousePressed();
  }

  else if (currentPage === "verification") {
    verification.mousePressed();
  }

  else if (currentPage === "memory") {
    memoryPrompt.mousePressed();
  }

  else if (currentPage === "exhibition") {
    exhibition.mousePressed();
  }
}

function keyPressed() {
  console.log("Key pressed:", keyCode);
  if (currentPage === "verification") {
    verification.keyPressed();
  }
}

function mouseDragged() {

  if (currentPage === "verification") {
    verification.mouseDragged();
  }
}
// ===================================
// WELCOME SCREEN
// ===================================

class WelcomeScreen {

  display() {
    background(248);

    fill(60, 130, 220);
    noStroke();
    circle(width / 2, height / 2, 100);
  }

  mousePressed() {
    // Temporary: click the circle to enter verification
    if (dist(mouseX, mouseY, width / 2, height / 2) < 50) {
      verification.start();
      currentPage = "verification";
    }
  }
}


// ===================================
// MEMORY PROMPT
// ===================================

class MemoryPrompt {

  constructor() {
    this.memoryInput = "";
    this.state = "idle";
    this.successStart = 0;
    this.successDuration = 5000;

    this.inputBox = createElement("textarea");

    this.inputBox.attribute(
      "placeholder",
      "Write a random memory or experience..."
    );

    this.inputBox.position(300, 250);
    this.inputBox.size(600, 150);

    this.inputBox.style("font-size", "16px");
    this.inputBox.style("padding", "12px");
    this.inputBox.style("resize", "none");
    this.inputBox.style("box-sizing", "border-box");
    this.inputBox.style("border", "1px solid #aaa");

    this.inputBox.hide();
  }

  display() {
    background(248);

    if (this.state === "success") {
      this.inputBox.hide();
      this.displaySuccess();
      return;
    }

    this.inputBox.show();
    this.displayPrompt();
  }
  
  displayPrompt() {

    textAlign(CENTER, CENTER);
    noStroke();
    fill(40);

    textSize(20);
    fill(110);
    text(
      "Share a random memory or experience.",
      500, 195
    );

    this.drawButton("VERIFY", 425, 460, 150, 45);
  }

  drawButton(label, x, y, w, h) {
    fill(40);
    noStroke();
    rect(x, y, w, h, 5);

    fill(255);
    textAlign(CENTER, CENTER);
    textSize(15);
    text(label, x + w / 2, y + h / 2);
  }

  mousePressed() {
    if (this.state !== "idle") return;

    if (
      mouseX > 425 && mouseX < 575 &&
      mouseY > 460 && mouseY < 505
    ) {
      this.memoryInput = this.inputBox.value();

      if (this.memoryInput.trim().length > 0) {
        this.state = "success";
        this.successStart = millis();
        this.inputBox.hide();
      }
    }
  }

  displaySuccess() {
    background(248);

    textAlign(CENTER, CENTER);
    noStroke();

    fill(40);
    textSize(30);
    text("Verification successful.", 
         500, 250
      );

    fill(40);
    textSize(25);
    text("Your information has been received. Your individuality remains unknown.",
        500,300
      );

    fill(110);
    textSize(17);
    text(
      "You may enter the exhibition.",
      500, 350
    );

    if (millis() - this.successStart > this.successDuration) {
      currentPage = "exhibition";
    }
  }
}


// ===================================
// EXHIBITION
// ===================================

class Exhibition {

  display() {
    background(248);

    fill(60, 130, 220);
    noStroke();
    circle(width / 2, height / 2, 100);
  }

  mousePressed() {}
}




// ===================================
// VERIFICATION CLASS
// ===================================

class Verification {

  constructor() {

    this.round = 1;
    this.state = "idle";
    this.nextRound = 1;
    // Images
    this.textImage = null;
    this.captchaImages = [];
    this.robotImages = [];
    this.notRobotImage = null;

    // Round 1
    this.captchaInput = "";
    this.inputActive = false;

    // Round 2
    this.selectedImages = [];

    // Round 3
    this.robotClicked = false;

    // Round 4
    this.drawingLayer = createGraphics(800,500);
    this.brushSize = 5;
    

    // Failure
    this.failureStart = 0;
    this.failureDuration = 200;
    this.nextAction = "";
  }


  // =================================
  // LOAD IMAGES
  // =================================

  async loadImages() {

    this.textImage = await loadImage("image/textcaptcha.png");
    console.log("Text image:", this.textImage);
    this.captchaImages = await Promise.all(
      [1, 2, 3, 4, 5, 6, 7, 8, 9].map(
        n => loadImage("image/" + n + ".jpg")
      )
    );

    this.robotImages = await Promise.all(
      [1, 2, 3, 4, 5, 6, 7, 8].map(
        n => loadImage("image/robot" + n + ".jpg")
      )
    );

    this.notRobotImage = await loadImage(
      "image/notrobot.jpg"
    );

    this.drawingLayer = createGraphics(width, height);
    this.drawingLayer.clear();
  }


  // =================================
  // START VERIFICATION
  // =================================

  start() {

    this.openRound(this.nextRound);
  }


  openRound(round) {

    this.round = round;
    this.state = "active";

    if (round === 1) {
      this.captchaInput = "";
      this.inputActive = false;
    }

    if (round === 2) {
      this.selectedImages = [];
    }

    if (round === 3) {
      this.robotClicked = false;
    }

    if (round === 4) {
      this.drawingLayer.clear();
    }
  }


  // =================================
  // DISPLAY
  // =================================

  display() {

    background(248);

    if (this.state === "failure") {
      this.displayFailure();
      return;
    }

    if (this.round === 1) {
      this.displayTextCaptcha();
    }

    else if (this.round === 2) {
      this.displayImageCaptcha();
    }

    else if (this.round === 3) {
      this.displayRound3();
    }

    else if (this.round === 4) {
      this.displayDrawing();
    }
  }


  // =================================
  // HEADER AND BUTTON
  // =================================

  drawHeader(message) {

    fill(35);
    noStroke();

    textAlign(CENTER, CENTER);
    textSize(22);
    text(message, width / 2, 90);

    textSize(12);
    fill(150);
    text("Human verification system", width / 2, 120);
  }


  drawButton(label, x, y, w, h) {

    fill(35);
    noStroke();
    rect(x, y, w, h, 4);

    fill(255);
    textAlign(CENTER, CENTER);
    textSize(14);
    text(label, x + w / 2, y + h / 2);
  }


  drawImageFit(img, x, y, w, h) {

    if (!img) return;

    let s = min(w / img.width, h / img.height);

    let newW = img.width * s;
    let newH = img.height * s;

    image(
      img,
      x + (w - newW) / 2,
      y + (h - newH) / 2,
      newW,
      newH
    );
  }


  // =================================
  // ROUND 1: TEXT CAPTCHA
  // =================================

  displayTextCaptcha() {

    this.drawHeader("Please enter the characters you see.");
    textAlign(CENTER, CENTER);
    textSize(15);
    fill(110);
    noStroke();

    text(
      "You need to verify that you are human before entering the exhibition.",
      width / 2,
      550
    );
    this.drawImageFit(
      this.textImage,
      350, 190, 300, 120
    );

    stroke(150);
    fill(255);
    rect(350, 340, 300, 45, 4);

    noStroke();
    fill(30);
    textAlign(LEFT, CENTER);
    textSize(18);

    let cursor = frameCount % 60 < 30 ? "|" : "";

    text(
      this.captchaInput +
      (this.inputActive ? cursor : ""),
      365, 362
    );

    this.drawButton("VERIFY", 425, 420, 150, 45);
  }


  // =================================
  // ROUND 2: IMAGE CAPTCHA
  // =================================

  displayImageCaptcha() {

    this.drawHeader("Select all images containing souls.");

    let startX = 335;
    let startY = 155;

    let cellW = 110;
    let cellH = 100;
    let gap = 5;

    for (let i = 0; i < 9; i++) {

      let x = startX + (i % 3) * (cellW + gap);
      let y = startY + floor(i / 3) * (cellH + gap);

      this.drawImageFit(
        this.captchaImages[i],
        x, y, cellW, cellH
      );

      if (this.selectedImages.includes(i)) {

        noFill();
        stroke(40, 130, 240);
        strokeWeight(5);
        rect(x, y, cellW, cellH);
      }
    }

    this.drawButton("VERIFY", 425, 490, 150, 45);
  }


  // =================================
  // ROUND 3: ROBOT SELECTION
  // =================================

  displayRound3() {
    this.drawHeader("Please identify yourself.");

    let imgW = 215;
    let imgH = 160;

    let gapX = 25;
    let gapY = 20;

    let startX = (width - (3 * imgW + 2 * gapX)) / 2;
    let startY = 130;

  // Draw 8 robot images
    for (let i = 0; i < 8; i++) {
      let col = i % 3;
      let row = Math.floor(i / 3);

      let x = startX + col * (imgW + gapX);
      let y = startY + row * (imgH + gapY);

      let img = this.robotImages[i];

      let scaleFactor = Math.min(
        imgW / img.width,
        imgH / img.height
      );

      let displayW = img.width * scaleFactor;
      let displayH = img.height * scaleFactor;

      image(
        img,
        x + (imgW - displayW) / 2,
        y + (imgH - displayH) / 2,
        displayW,
        displayH
      );
    }

  // Draw the notRobot image in the ninth position
    let col = 2;
    let row = 2;

    let x = startX + col * (imgW + gapX);
    let y = startY + row * (imgH + gapY);

    let img = this.notRobotImage;

    let scaleFactor = Math.min(
      imgW / img.width,
      imgH / img.height
    );

    let displayW = img.width * scaleFactor;
    let displayH = img.height * scaleFactor;

    image(
      img,
      x + (imgW - displayW) / 2,
      y + (imgH - displayH) / 2,
      displayW,
      displayH
    );
  }


  // =================================
  // ROUND 4: DRAW YOURSELF
  // =================================

  displayDrawing(){

    this.drawHeader("Draw yourself.");

  // Drawing area
    fill(255);
    stroke(190);
    strokeWeight(1);
    rect(150, 170, 700, 400);

  // Display drawing
    image(this.drawingLayer, 150, 170);

  // VERIFY button
    this.drawButton("VERIFY", 425, 610, 150, 45);
  }


  // =================================
  // FAILURE
  // =================================

  
  fail() {
    this.state = "failure";
    this.failureStart = frameCount;
  }

    
  displayFailure() {

    background(248);

    fill(50);
    noStroke();

    textAlign(CENTER, CENTER);
    textSize(28);
    text("Verification failed.", width / 2, height / 2);

    textSize(14);
    fill(150);
    text("Please try again.", width / 2, height / 2 + 40);

    if (frameCount - this.failureStart > this.failureDuration) {

    // ROUND 1 -> ROUND 2
      if (this.round === 1) {
        this.openRound(2);
      }

    // ROUND 2 -> ROUND 3
      else if (this.round === 2) {
        this.openRound(3);
      }

    // ROUND 3 -> ROUND 4
      else if (this.round === 3) {
        this.openRound(4);
      }

    // ROUND 4 -> MEMORY PROMPT
      else if (this.round === 4) {
        this.state = "idle";
        currentPage = "memory";
      }
    }
}



  // =================================
  // MOUSE PRESSED
  // =================================

  mousePressed() {

    if (this.state !== "active") return;

    // ---------- ROUND 1 ----------
    if (this.round === 1) {

      if (
        mouseX > 350 && mouseX < 650 &&
        mouseY > 340 && mouseY < 385
      ) {
        this.inputActive = true;
      }

      else if (
        mouseX > 425 && mouseX < 575 &&
        mouseY > 420 && mouseY < 465
      ) {
        this.inputActive = false;
        this.captchaInput = "";

        this.fail();
      }

      else {
        this.inputActive = false;
      }
    }


    // ---------- ROUND 2 ----------
    else if (this.round === 2) {

      let startX = 335;
      let startY = 155;
      let cellW = 110;
      let cellH = 100;
      let gap = 5;

      for (let i = 0; i < 9; i++) {

        let x = startX + (i % 3) * (cellW + gap);
        let y = startY + floor(i / 3) * (cellH + gap);

        if (
          mouseX > x && mouseX < x + cellW &&
          mouseY > y && mouseY < y + cellH
        ) {

          if (this.selectedImages.includes(i)) {

            this.selectedImages =
              this.selectedImages.filter(n => n !== i);
          }

          else {
            this.selectedImages.push(i);
          }

          return;
        }
      }

      if (
        mouseX > 425 && mouseX < 575 &&
        mouseY > 490 && mouseY < 535
      ) {
        this.fail();
      }
    }


    // ---------- ROUND 3 ----------
    else if (this.round === 3) {

      let imgW = 215;
      let imgH = 160;

      let gapX = 25;
      let gapY = 20;

      let startX = (width - (3 * imgW + 2 * gapX)) / 2;
      let startY = 100; // 必须和 displayRound3() 中的 startY 一致

  // Position of notRobot image (bottom-right)
      let x = startX + 2 * (imgW + gapX);
      let y = startY + 2 * (imgH + gapY);

  // Only notRobot is clickable
      if (
        mouseX > x && mouseX < x + imgW &&
        mouseY > y && mouseY < y + imgH
      ) {
        this.fail();
      }
}
      


    // ---------- ROUND 4 ----------
    else if (this.round === 4) {

      // CLEAR
      if (
        mouseX > 650 && mouseX < 740 &&
        mouseY > 565 && mouseY < 605
      ) {
        this.drawingLayer.clear();
      }

      // VERIFY
      // VERIFY
      else if (
        mouseX > 425 && mouseX < 575 &&
        mouseY > 610 && mouseY < 655
      ) {
        this.fail();
      }

      

      
    }
  }


  // =================================
  // KEYBOARD
  // =================================


  keyPressed() {

    if (
      this.round !== 1 ||
      this.state !== "active" ||
      !this.inputActive
    ) return;

    if (keyCode === 8) {
      this.captchaInput = this.captchaInput.slice(0, -1);
      return false;
    }

    else if (keyCode === ENTER || keyCode === RETURN) {
      this.inputActive = false;
      this.fail();
      return false;
    }

    else if (
      key.length === 1 &&
      this.captchaInput.length < 12
    ) {
      this.captchaInput += key;
      return false;
    }
}


  // =================================
  // DRAWING
  // =================================

  mouseDragged() {

    if (
      this.round !== 4 ||
      this.state !== "active"
    ) return;

  // Only draw inside the 700 × 400 area
    if (
      mouseX > 150 && mouseX < 850 &&
      mouseY > 170 && mouseY < 570
    ) {

      this.drawingLayer.stroke(0);
      this.drawingLayer.strokeWeight(4);
      this.drawingLayer.strokeCap(ROUND);

      this.drawingLayer.line(
        pmouseX - 150,
        pmouseY - 170,
        mouseX - 150,
        mouseY - 170
      );
    }
  }
}
