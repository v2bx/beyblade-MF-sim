/*** GLOBAL VARIABLES ***/
let gameOver = false;
let canvas, ctx;
let beyblade1, beyblade2; // Changed to beyblade1 and beyblade2 for clarity
const canvasWidth = 480;
const canvasHeight = 480;
const battleMusic = document.getElementById("battleMusic");

/*** PHYSICS VARIABLES ***/
const gravityStrength = 0.001; // Gradual inward force (lower value for more control)
const friction = 0.005; // Friction applied to the movement (lower value for less friction)
const restitution = 1.2; // Bounciness when colliding with the boundary
const spinDecayFactor = 0.001; // Decay rate for the Beyblade's spin (losing angular velocity over time)
const maxSpin = 1.5; // Maximum spin velocity to prevent it from becoming too fast
let initialSpeed = 5; // Initial tangential speed of the Beyblade

let basaltImage, gpegasusImage;

/*** COLLISION FLAG ***/
let collisionEnabled = true; // Flag to control collision detection

/*** STAMINA CONFIGURATION ***/
const STAMINA_LOSS_PER_COLLISION = 1;
const COLLISION_FORCE = 7;

/*** INIT FUNCTIONS ***/
window.onload = init;

function startGame() {
  battleMusic.onplay();
  // Check if the game is over
  if (gameOver) {
    // Reset the game state
    restartGame();
  }

  const beyblade1Type = document.getElementById("beySelector1").value;
  const beyblade2Type = document.getElementById("beySelector2").value;

  if (beyblade1Type && beyblade2Type) {
    // Remove the lines that disable the selectors
    // document.getElementById('beySelector1').disabled = true;
    // document.getElementById('beySelector2').disabled = true;

    // Reinitialize Beyblades with new types
    beyblade1 = initBeyblade(beyblade1Type);
    beyblade2 = initBeyblade(beyblade2Type);

    console.log("Beyblade 1:", beyblade1);
    console.log("Beyblade 2:", beyblade2);

    // Start the game loop
    gameOver = false;
    window.requestAnimationFrame(gameLoop);
  } else {
    alert("Please select two Beyblades to start the battle!");
  }
}

function initBeyblade(beybladeType) {
  const centerX = canvasWidth / 2;
  const centerY = canvasHeight / 2;
  const arenaRadius = 220;
  const radius = 20;

  // Generate a random angle
  const angle = Math.random() * Math.PI * 2;

  // Generate a random distance
  const maxDistance = arenaRadius - radius;
  const randomDistance = Math.sqrt(Math.random()) * maxDistance;

  // Calculate spawn position
  const x = centerX + Math.cos(angle) * randomDistance;
  const y = centerY + Math.sin(angle) * randomDistance;

  // Get Beyblade properties
  const properties = getBeybladeProperties(beybladeType);

  return {
    x: x,
    y: y,
    radius: 20,
    angle: 0,
    angularVelocity: properties.angularVelocity(),
    velocityX: 0,
    velocityY: properties.initialSpeed(),
    image: properties.image,
    behavior: properties.behavior,
    stamina: properties.stamina || 100,
    attackPower: properties.attackPower || 5,
    defensePower: properties.defensePower || 5,
    friction: properties.friction || 0.005,
    isAlive: true, // New property to track if the Beyblade is alive
  };
}

function loadImage(key, path) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      console.log(`Loaded image for ${key}`);
      beybladeImages[key] = img;
      resolve(img);
    };
    img.onerror = () => {
      console.error(`Failed to load image for ${key} from ${path}`);
      beybladeImages[key] = null; // Set to null instead of keeping the broken image
      resolve(null); // Resolve with null to continue loading other images
    };
    img.src = path;
  });
}

function drawBeyblade(blade) {
  ctx.save();
  ctx.translate(blade.x, blade.y);
  ctx.rotate(blade.angle);

  let beybladeImage;
  if (blade === beyblade1) {
    const beybladeType = document.getElementById("beySelector1").value;
    beybladeImage = beybladeImages[beybladeType];
  } else if (blade === beyblade2) {
    const beybladeType = document.getElementById("beySelector2").value;
    beybladeImage = beybladeImages[beybladeType];
  }

  if (
    beybladeImage &&
    beybladeImage.complete &&
    beybladeImage.naturalWidth > 0
  ) {
    ctx.drawImage(
      beybladeImage,
      -blade.radius,
      -blade.radius,
      blade.radius * 2,
      blade.radius * 2
    );
  } else {
    // Fallback to drawing a colored circle
    ctx.beginPath();
    ctx.arc(0, 0, blade.radius, 0, Math.PI * 2);
    ctx.fillStyle = blade === beyblade1 ? "red" : "blue";
    ctx.fill();
    ctx.strokeStyle = "black";
    ctx.stroke();
  }

  ctx.restore();
}

// Helper function to draw a fallback shape (a circle) when image can't be loaded
function drawFallbackShape(blade) {
  ctx.beginPath();
  ctx.arc(0, 0, blade.radius, 0, Math.PI * 2);

  // Use different colors for each Beyblade
  if (blade === beyblade1) {
    ctx.fillStyle = "red";
  } else if (blade === beyblade2) {
    ctx.fillStyle = "blue";
  } else {
    ctx.fillStyle = "green";
  }

  ctx.fill();
  ctx.strokeStyle = "black";
  ctx.stroke();
}

// Helper function to draw a fallback shape
function drawFallbackShape(blade) {
  ctx.beginPath();
  ctx.arc(0, 0, blade.radius, 0, Math.PI * 2);

  // Use different colors for each Beyblade
  if (blade === beyblade1) {
    ctx.fillStyle = "red";
  } else if (blade === beyblade2) {
    ctx.fillStyle = "blue";
  } else {
    ctx.fillStyle = "green";
  }

  ctx.fill();
  ctx.strokeStyle = "black";
  ctx.stroke();
}

function init() {
  canvas = document.getElementById("arena");
  ctx = canvas.getContext("2d");

  window.beybladeImages = {};

  const imagesToLoad = [
    { key: "Basalt Horogium", path: "BEYS/BASALT.png" },
    { key: "Storm Pegasus", path: "BEYS/GPEGASUS.png" },
    { key: "Flame Sagitarrio", path: "BEYS/FLAME SAGITARRIO.png" },
    { key: "Earth Eagle", path: "BEYS/EARTH EAGLE.png" },
    { key: "Lightning L-Drago", path: "BEYS/LIGHTNING L-DRAGO.png" },
    { key: "Rock Leone", path: "BEYS/ROCK LEONE.png" },
    { key: "Dark Wolf", path: "BEYS/DARK WOLF.png" },
    { key: "Rock Scorpio", path: "BEYS/ROCK SCORPIO.png" },
  ];

  Promise.all(imagesToLoad.map((img) => loadImage(img.key, img.path)))
    .then(() => {
      console.log("All Beyblade images loaded or handled");
      drawArena();
    })
    .catch((error) => {
      console.error("Error in image loading process:", error);
      drawArena(); // Continue with the game even if some images fail to load
    });
}

/*** GAME LOOP ***/
let gameLoopId; // Declare a variable to hold the game loop ID

function gameLoop() {
  if (gameOver) return; // Stop the loop if the game is over

  gameLoopId = window.requestAnimationFrame(gameLoop); // Store the ID

  // Apply spin decay to both Beyblades
  beyblade1.angularVelocity *= 1 - spinDecayFactor;
  beyblade2.angularVelocity *= 1 - spinDecayFactor;

  // Clear the canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Apply physics for first Beyblade
  if (beyblade1.isAlive) {
    applyBowlLikeMotion(beyblade1);
    applyFriction(beyblade1);
    applyCentripetalForce(beyblade1);
    beyblade1.x += beyblade1.velocityX;
    beyblade1.y += beyblade1.velocityY;
    beyblade1.angle += beyblade1.angularVelocity;
  } else {
    // Apply falling effect for dead Beyblade
    beyblade1.y += 2; // Adjust the falling speed as needed
  }

  // Apply physics for second Beyblade
  if (beyblade2.isAlive) {
    applyBowlLikeMotion(beyblade2);
    applyFriction(beyblade2);
    applyCentripetalForce(beyblade2);
    beyblade2.x += beyblade2.velocityX;
    beyblade2.y += beyblade2.velocityY;
    beyblade2.angle += beyblade2.angularVelocity;
  } else {
    // Apply falling effect for dead Beyblade
    beyblade2.y += 2; // Adjust the falling speed as needed
  }

  // Check for collision between Beyblades
  checkBeybladeCollision();

  // Draw the arena
  drawArena();

  // Draw Beyblades
  drawBeyblade(beyblade1);
  drawBeyblade(beyblade2);

  // Update the display
  updateDataDisplay();
}
/*** DRAWING FUNCTIONS ***/

// Function to draw the arena (bowl-like appearance)
function drawArena() {
  console.log("Drawing arena..."); // Debugging line
  ctx.save();
  ctx.translate(canvasWidth / 2, canvasHeight / 2);

  // Create a radial gradient for the arena
  const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, 220);
  gradient.addColorStop(0, "#ffffff"); // Center color
  gradient.addColorStop(1, "#888888"); // Outer color

  // Draw the arena with the gradient
  ctx.beginPath();
  ctx.arc(0, 0, 220, 0, Math.PI * 2); // Arena radius
  ctx.fillStyle = gradient;
  ctx.fill();

  // Add a shadow effect
  ctx.shadowColor = "rgba(0, 0, 0, 0.5)";
  ctx.shadowBlur = 15;
  ctx.shadowOffsetX = 5;
  ctx.shadowOffsetY = 5;

  // Draw the outline
  ctx.strokeStyle = "#000";
  ctx.lineWidth = 5;
  ctx.stroke();

  ctx.restore();
}

// Function to draw the Beyblade
// Load images before init

window.onload = function () {
  // Load images before initializing
  basaltImage = new Image();
  basaltImage.src = "BEYS/BASALT.png";

  gpegasusImage = new Image();
  gpegasusImage.src = "BEYS/GPEGASUS.png";

  // Wait for images to load before initializing
  basaltImage.onload = gpegasusImage.onload = init;
};

function drawBeyblade(blade) {
  ctx.save();
  ctx.translate(blade.x, blade.y);
  ctx.rotate(blade.angle);

  // Choose the appropriate image based on the blade being drawn
  let beybladeImage;

  if (blade === beyblade1) {
    // Use the image based on the Beyblade type selected
    const beybladeType = document.getElementById("beySelector1").value;
    beybladeImage = beybladeImages[beybladeType] || beybladeImages.basalt;
  } else if (blade === beyblade2) {
    // Use the image based on the Beyblade type selected
    const beybladeType = document.getElementById("beySelector2").value;
    beybladeImage = beybladeImages[beybladeType] || beybladeImages.gpegasus;
  } else {
    console.error("Unknown Beyblade", blade);
    beybladeImage = beybladeImages.basalt; // Fallback image
  }

  // Draw the Beyblade image
  ctx.drawImage(
    beybladeImage,
    -blade.radius, // Center the image
    -blade.radius,
    blade.radius * 2,
    blade.radius * 2
  );

  ctx.restore();
}

/*** PHYSICS FUNCTIONS ***/

function updateBeybladeEnergy(blade) {
  // Reduce speed based on friction
  blade.velocityX -= blade.velocityX * blade.friction;
  blade.velocityY -= blade.velocityY * blade.friction;

  // Ensure the speed does not drop below a minimum threshold
  const minSpeed = 0.1;
  if (Math.abs(blade.velocityX) < minSpeed) blade.velocityX = 0;
  if (Math.abs(blade.velocityY) < minSpeed) blade.velocityY = 0;
}

// Apply bowl-like motion (simulating spiral inward motion)
function applyBowlLikeMotion(blade) {
  const centerX = canvasWidth / 2;
  const centerY = canvasHeight / 2;

  // Calculate distance from center
  const dx = blade.x - centerX;
  const dy = blade.y - centerY;
  const distance = Math.sqrt(dx * dx + dy * dy);
  const arenaRadius = 220;

  // Normalize the direction towards the center
  const normalizedDx = dx / distance;
  const normalizedDy = dy / distance;

  // Base inward force - more pronounced at larger distances
  const baseInwardForce = 0.05;
  const distanceFromCenterFactor = Math.min(1, distance / arenaRadius);
  const inwardForce = baseInwardForce * (1 + distanceFromCenterFactor * 2);

  // Apply inward force
  blade.velocityX -= normalizedDx * inwardForce;
  blade.velocityY -= normalizedDy * inwardForce;

  // Apply a damping effect to simulate energy loss
  const dampingFactor = 0.98; // Adjust this value to control energy loss
  blade.velocityX *= dampingFactor;
  blade.velocityY *= dampingFactor;

  // Soft velocity cap to prevent extreme speeds
  const maxVelocity = 10;
  blade.velocityX = Math.max(
    Math.min(blade.velocityX, maxVelocity),
    -maxVelocity
  );
  blade.velocityY = Math.max(
    Math.min(blade.velocityY, maxVelocity),
    -maxVelocity
  );
}

function applyFriction(blade) {
  blade.velocityX *= 1 - friction;
  blade.velocityY *= 1 - friction;

  // Gradually reduce angular velocity due to friction
  blade.angularVelocity *= 1 - friction * 0.1;
}

// Apply friction to the movement (slowing down the Beyblade)
function applyFriction() {
  beyblade1.velocityX *= 1 - friction;
  beyblade2.velocityY *= 1 - friction;
}

// Apply centripetal force to keep the Beyblade within the circular arena
function applyCentripetalForce(blade) {
  const centerX = canvasWidth / 2;
  const centerY = canvasHeight / 2;

  const dx = blade.x - centerX;
  const dy = blade.y - centerY;
  const distance = Math.sqrt(dx * dx + dy * dy);

  // Arena radius is fixed at 220 pixels
  const arenaRadius = 220;

  // Apply centripetal force only if the Beyblade is outside the arena
  if (distance > arenaRadius - blade.radius) {
    // Calculate the angle of collision with the wall
    const angleOfCollision = Math.atan2(dy, dx);

    // Reflect the velocity vector based on the collision angle
    const speed = Math.sqrt(blade.velocityX ** 2 + blade.velocityY ** 2);
    blade.velocityX = -blade.velocityX * restitution;
    blade.velocityY = -blade.velocityY * restitution;

    // Drain spin power when hitting the wall
    const spinDrainFactor = 0.3; // Adjust this value to control spin power loss
    blade.angularVelocity *= 1 - spinDrainFactor;

    // Apply centripetal force to bring the Beyblade back towards the center
    const normalX = Math.cos(angleOfCollision);
    const normalY = Math.sin(angleOfCollision);

    // Applying some centripetal force to push it back toward the center
    blade.velocityX += normalX * 0.05;
    blade.velocityY += normalY * 0.05;

    // Ensure Beyblade stays within the arena boundary
    blade.x = centerX + (arenaRadius - blade.radius) * normalX;
    blade.y = centerY + (arenaRadius - blade.radius) * normalY;
  }
}
// Check for collision between Beyblades
function checkBeybladeCollision() {
  const dx = beyblade1.x - beyblade2.x; // Difference in X positions
  const dy = beyblade1.y - beyblade2.y; // Difference in Y positions
  const distance = Math.sqrt(dx * dx + dy * dy); // Calculate distance between Beyblades

  // Check if Beyblades are colliding
  if (distance < beyblade1.radius + beyblade2.radius) {
    // Calculate the overlap
    const overlap = beyblade1.radius + beyblade2.radius - distance;

    // Normalize the collision direction
    const normalizedDX = dx / distance;
    const normalizedDY = dy / distance;

    // Separate the Beyblades based on the overlap
    beyblade1.x += normalizedDX * (overlap / 2);
    beyblade1.y += normalizedDY * (overlap / 2);
    beyblade2.x -= normalizedDX * (overlap / 2);
    beyblade2.y -= normalizedDY * (overlap / 2);

    // Calculate relative velocities
    const relativeVelX = beyblade1.velocityX - beyblade2.velocityX;
    const relativeVelY = beyblade1.velocityY - beyblade2.velocityY;

    // Project relative velocity onto collision normal
    const relativeVelocityAlongNormal =
      relativeVelX * normalizedDX + relativeVelY * normalizedDY;

    // If the Beyblades are separating, no further calculation is needed
    if (relativeVelocityAlongNormal > 0) return;

    // Calculate impulse scalar (the energy transfer from the collision)
    const reboundFactor = 5; // Adjusted rebound factor for a more realistic bounce
    const impulse = -(1 + reboundFactor) * relativeVelocityAlongNormal;

    // Apply the impulse to each Beyblade's velocity
    beyblade1.velocityX += impulse * normalizedDX;
    beyblade1.velocityY += impulse * normalizedDY;
    beyblade2.velocityX -= impulse * normalizedDX;
    beyblade2.velocityY -= impulse * normalizedDY;

    // Introduce randomness to break perfect alignment and avoid stuck movement
    beyblade1.velocityX += (Math.random() - 0.5) * 0.5;
    beyblade1.velocityY += (Math.random() - 0.5) * 0.5;
    beyblade2.velocityX += (Math.random() - 0.5) * 0.5;
    beyblade2.velocityY += (Math.random() - 0.5) * 0.5;

    // Apply a small angular velocity loss to simulate energy loss
    const angularLossFactor = 0.1; // Adjust this value to control spin loss
    beyblade1.angularVelocity *= 1 - angularLossFactor;
    beyblade2.angularVelocity *= 1 - angularLossFactor;

    // Add random angular velocity to throw Beyblades off course
    const randomAngularVelocity = (Math.random() - 0.5) * 0.5; // Adjust magnitude for randomness
    beyblade1.angularVelocity += randomAngularVelocity;
    beyblade2.angularVelocity += randomAngularVelocity;

    // Ensure velocities are within max limits
    const maxVelocity = 1000; // Set a reasonable maximum velocity
    beyblade1.velocityX = Math.min(
      Math.max(beyblade1.velocityX, -maxVelocity),
      maxVelocity
    );
    beyblade1.velocityY = Math.min(
      Math.max(beyblade1.velocityY, -maxVelocity),
      maxVelocity
    );
    beyblade2.velocityX = Math.min(
      Math.max(beyblade2.velocityX, -maxVelocity),
      maxVelocity
    );
    beyblade2.velocityY = Math.min(
      Math.max(beyblade2.velocityY, -maxVelocity),
      maxVelocity
    );

    // Ensure Beyblades are not stuck in a straight line
    const separationFactor = 0.1; // Adjust this value to control how much they separate
    beyblade1.velocityX += normalizedDX * separationFactor;
    beyblade1.velocityY += normalizedDY * separationFactor;
    beyblade2.velocityX -= normalizedDX * separationFactor;
    beyblade2.velocityY -= normalizedDY * separationFactor;
  }

  checkGameEnd(); // Check if the game has ended
}

let alertShown = false; // Flag to track if an alert has been shown

function checkGameEnd() {
  if (beyblade1 && beyblade2) {
    const spinThreshold = 0.01; // Minimum spin to continue

    // Check if Beyblade 1 is defeated
    if (
      (Math.abs(beyblade1.angularVelocity) <= spinThreshold ||
        beyblade1.angularVelocity < 0) &&
      beyblade1.isAlive
    ) {
      beyblade1.isAlive = false; // Mark Beyblade 1 as dead
      if (!alertShown) {
        // Show alert only if no alert has been shown yet
        alert(
          `${document.getElementById("beySelector1").value} has been defeated!`
        );
        battleMusic.pause();
        battleMusic.currentTime = 0;
        alertShown = true; // Set the flag to true
      }
    }

    // Check if Beyblade 2 is defeated
    if (
      (Math.abs(beyblade2.angularVelocity) <= spinThreshold ||
        beyblade2.angularVelocity < 0) &&
      beyblade2.isAlive
    ) {
      beyblade2.isAlive = false; // Mark Beyblade 2 as dead
      if (!alertShown) {
        // Show alert only if no alert has been shown yet
        alert(
          `${document.getElementById("beySelector2").value} has been defeated!`
        );
        alertShown = true; // Set the flag to true
      }
    }

    // Check if both Beyblades are dead
    if (!beyblade1.isAlive || !beyblade2.isAlive) {
      gameOver = true; // Set game over state
      cancelAnimationFrame(gameLoopId); // Stop the game loop
    }
  }
}
function restartGame() {
  // Reset game state
  gameOver = false;
  alertShown = false; // Reset the alert flag

  // Stop the battle music
  battleMusic.pause();
  battleMusic.currentTime = 0; // Reset the audio to the beginning

  // Clear the canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Redraw the arena
  drawArena();

  // Reset game loop related variables
  if (gameLoopId) {
    cancelAnimationFrame(gameLoopId);
  }

  // Reset Beyblade variables to null
  beyblade1 = null;
  beyblade2 = null;

  // Ensure the selection dropdowns are enabled (if they were disabled)
  document.getElementById("beySelector1").disabled = false;
  document.getElementById("beySelector2").disabled = false;

  // Optional: Reset any other game-related UI elements
  document.getElementById("dataDisplay").innerHTML = `
        <p><strong>Starting Position:</strong> x: 240, y: 140</p>
        <p><strong>Velocity:</strong> x: 0, y: 2</p>
        <p><strong>Angular Velocity:</strong> 0.2</p>
        <p><strong>RPM:</strong> 0</p>
    `;
}

function startGame() {
  // Check if the game is over
  if (gameOver) {
    // Reset the game state
    restartGame();
  }

  const beyblade1Type = document.getElementById("beySelector1").value;
  const beyblade2Type = document.getElementById("beySelector2").value;

  if (beyblade1Type && beyblade2Type) {
    // Play the battle music
    battleMusic.play();

    // Reinitialize Beyblades with new types
    beyblade1 = initBeyblade(beyblade1Type);
    beyblade2 = initBeyblade(beyblade2Type);

    console.log("Beyblade 1:", beyblade1);
    console.log("Beyblade 2:", beyblade2);

    // Start the game loop
    gameOver = false;
    window.requestAnimationFrame(gameLoop);
  } else {
    alert("Please select two Beyblades to start the battle!");
  }
}

// Update the display data on the screen
function updateDataDisplay() {
  // Calculate RPM for both Beyblades
  const rpmFirst = Math.abs((beyblade1.angularVelocity * 60) / (2 * Math.PI));
  const rpmSecond = Math.abs((beyblade2.angularVelocity * 60) / (2 * Math.PI));

  // Update the data on the page with both Beyblades' information
  document.getElementById("dataDisplay").innerHTML = `
        <div class="beyblade-stats">
            <h3>${document.getElementById("beySelector1").value}</h3>
            <p><strong>Position:</strong> x: ${beyblade1.x.toFixed(
              2
            )}, y: ${beyblade1.y.toFixed(2)}</p>
            <p><strong>Speed:</strong> x: ${beyblade1.velocityX.toFixed(
              2
            )}, y: ${beyblade1.velocityY.toFixed(2)}</p>
            <p><strong>Stamina:</strong> ${beyblade1.angularVelocity.toFixed(
              2
            )}</p>
            <p><strong>RPM:</strong> ${rpmFirst.toFixed(2)}</p>
        </div>
        <div class="beyblade-stats">
            <h3>${document.getElementById("beySelector2").value}</h3>
            <p><strong>Position:</strong> x: ${beyblade2.x.toFixed(
              2
            )}, y: ${beyblade2.y.toFixed(2)}</p>
            <p><strong>Speed:</strong> x: ${beyblade2.velocityX.toFixed(
              2
            )}, y: ${beyblade2.velocityY.toFixed(2)}</p>
            <p><strong>Stamina:</strong> ${beyblade2.angularVelocity.toFixed(
              2
            )}</p>
            <p><strong>RPM:</strong> ${rpmSecond.toFixed(2)}</p>
        </div>
    `;
}
