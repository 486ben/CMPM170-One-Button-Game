title = "Flappy spaceship";

description = `
[Hold] Fly up
`;

characters = [
  `
  cc
 cllc
 cllc
cllllc
l cc l
l cc l
`,
];

const G = {
	WIDTH: 200,
	HEIGHT: 150,
  starspeedmin: 0.1,
  starspeedmax: 1,
};

options = {
  viewSize: { x: 100, y: 100 },
  isPlayingBgm: true,
  isReplayEnabled: true,
  theme: "pixel",
  seed: 3,
};


//For ROCKS
/**
 * @typedef {{
* pos: Vector,
* speed: number
* }} stars
*/

/**
* @type { stars [] }
*/
let star;


//Mountain
let mountains;

//SpaceShip
let shipY, shipV;

let offset;

//distance between mountain
let distance;

//Mountain index number
let m_Index_number;

//landging index number
let landingIndex;

//the landing
let landing;

//The Y axis of land
let landY;

//Spaceship collision
let crash;
let m;

//Meteorite fell to the ground
let meteoritelanded;

//meteorite_falling down.
let meteorite_falling;

//next upcoming_meteorite falling down
let upcoming_meteorite;

//element for meteorite scr and distance
let scr;
let dist;
const groundY = 90;

function update() {
  if (!ticks) {

    //random set for the star
    star = times(20, () => {

            const posX = rnd(0, G.WIDTH);
            const posY = rnd(0, G.HEIGHT);
            return {
                pos: vec(posX, posY),
                //the speed for background star.
                speed: rnd(G.starspeedmin, G.starspeedmax)
            };
        });
        meteorite_falling = [];
        upcoming_meteorite = 100;
        scr = 0;
        dist = 0;

    //mountain height
    mountains = times(15, (i) => {
      if (i === 4) {
        //green safe mountain for player
        return { y: (landY = 50), c: "green" };
      } else {
        //yellow is the danger mountain
        return { y: 90 - i, c: "yellow" };
      }
    });


    //You could fix the number here
    //Here is just a random number set
    shipY = 30;
    shipV = 0;
    offset = 0;
    distance = 0;
    m_Index_number = 0;
    landing = 0;
    meteoritelanded = 0;
    landingIndex = 5;
    meteorite_falling = [];
    upcoming_meteorite = 100;
  }

  //update for the background star moving
  star.forEach((s) => {
    s.pos.x += s.speed;
    s.pos.y += s.speed;
    s.pos.wrap(0, G.WIDTH, 0, G.HEIGHT);
 
    color("purple");
    box(s.pos, 1);
    });


  mountains.map((m, i) => {
    color(m.c);
    rect(wrap(i * 13 + offset - 13, -13, 104), m.y, 13, 99);
  });
  color("green");
  crash = char("a", 25, shipY);
  if (landing) {
    if (input.isJustPressed) {
      landing = 0;
    } else {
      return;
    }
  }

  offset -= difficulty;
  if ((distance = distance - difficulty) < 0) {
    m = mountains[wrap(m_Index_number, 0, 9)];
    m.y =
      landingIndex > 5 || landingIndex === 1
        ? rnd(70, 90)
        : landingIndex === 0
        ? (landY = rnd(40, 70))
        : rnd(40, 90);
    landingIndex--;
    if (landingIndex < 0) {
      m.c = "green";
      landingIndex = 9;
    } else {
      m.c = "yellow";
    }
    m_Index_number = m_Index_number + 1;
    distance += 13;
  }


  if (meteoritelanded) {
    if (input.isJustPressed) {
      play("laser");
      shipV -= 0.4;
    }
    if (input.isPressed) {
      shipV -= 0.2;
      particle(24.5, shipY + 2, 1, 1, PI / 2, 1);
    }
  }

  shipV += 0.1;
  shipV *= 0.99;
  if (shipY < 0 && shipV < 0) {
    shipV *= -1;
  }
  shipY += shipV * difficulty;
  
  
  //if the spaceshuo hit the green plane, become yellow
  if (crash.isColliding.rect.green) {
    play("select");
    particle(24.5, shipY);
    landing = ++score;
    shipV = 0;
    shipY = landY - 3;
    mountains.map((n) => (n.c = "yellow"));
    meteoritelanded = 1;
  }

  //if the spaceship hit the yellow plane, game over
  if (crash.isColliding.rect.yellow) {
    play("explosion");
    end();
  }

  //if the spaceshuo missing the green plane, game over
  if (rect(-1, 0, 1, 99).isColliding.rect.green) {
    color("yellow");
    for (let y = landY - 4; y < 99; y += 7) {
      text("X", 2, y);
    }
    play("explosion");
    end();
  }
  
//The rocks from the spaces
upcoming_meteorite = upcoming_meteorite - 1;
if (upcoming_meteorite < 0) {
  play("laser");
  const size = rnd(1, 15);
  const f = {
    pos: vec(rnd(50, 150), -size),
    vel: vec(-rnd(1, 2), rnd(1, 1.2)),
    size,
  };
  f.vel.mul(difficulty);
  meteorite_falling.push(f);
  upcoming_meteorite = rnd(40, 60) / difficulty;
}
color("cyan");

remove(meteorite_falling, (f) => {
  f.pos.add(f.vel);
  f.pos.x -= scr;
  const cl = box(f.pos, f.size, f.size).isColliding.rect;
  particle(
    f.pos.x + rnds(f.size),
    f.pos.y + rnds(f.size),
    (rnd() * f.size),
    -f.vel.length,
    f.vel.angle,
    0.3
  );
  if (cl.yellow || cl.green) {
    play("explosion");
  }
  if (cl.yellow || cl.green ||f.pos.y > groundY) {
    play("hit");
    particle(f.pos, f.size * 10);
    return true;
  }
});

}