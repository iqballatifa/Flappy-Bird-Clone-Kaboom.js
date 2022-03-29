kaboom({
  width: window.innerWidth,
  height: window.innerHeight
});

function loadAssets() {
  loadRoot("https://raw.githubusercontent.com/iqballatifa/Flappy-Bird-Clone-Kaboom.js/master/images/");
  loadSprite("bg-day", "background-day.png");
  loadSprite("bg-night", "background-night.png");
  loadSprite("base", "base.png");
  loadSprite("bluebird-downflap", "bluebird-downflap.png");
  loadSprite("bluebird-midflap", "bluebird-midflap.png")
  loadSprite("bluebird-upflap", "bluebird-upflap.png");
  loadSprite("yellowbird-downflap", "yellowbird-downflap.png");
  loadSprite("yellowbird-midflap", "yellowbird-midflap.png");
  loadSprite("yellowbird-upflap", "yellowbird-upflap.png");
  loadSprite("redbird-downflap", "redbird-downflap.png");
  loadSprite("redbird-midflap", "redbird-midflap.png");
  loadSprite("redbird-upflap", "redbird-upflap.png");
  loadSprite("gameover", "gameover.png");
  loadSprite("message", "message.png");
  loadSprite("pipe-green", "pipe-green.png");
  loadSprite("pipe-red", "pipe-red.png");
  for (let i = 0; i < 10; i++) {
    loadSprite(`${i}`, `${i}.png`);
  };
  
  loadRoot("https://raw.githubusercontent.com/iqballatifa/Flappy-Bird-Clone-Kaboom.js/master/audio/");
  loadSound("die", "die.wav");
  loadSound("hit", "hit.wav");
  loadSound("point", "point.wav");
  loadSound("swoosh", "swoosh.wav");
  loadSound("wing", "wing.wav")
};

loadAssets();
let bgImg = choose(["bg-day", "bg-night"])
const BASE_HEIGHT = 100;
const numList = [];
for (let i = 0; i < 10; i++) {
  numList.push(`${i}`);
};

let leftScore = 0;
let rightScore = 0;

function reset() {
  bgImg = choose(["bg-day", "bg-night"]);
  
  leftScore = 0;
  rightScore = 0;
}

scene("main", () => {
  layers(["bg", "obj", "base", "ui"], "obj");
  
  let pipe = "pipe-green";
  if (bgImg == "bg-night") pipe = "pipe-red";
  
  const bg = add([
    sprite(bgImg, {width: width(), height: height()}),
    layer("bg"),
    pos(0, 0),
    
    ]);
    
  let GAME_OVER = false;
   
    
  for (let i = 0; i < 2; i++) {
    var floor = add([
      
      sprite("base", {width: window.innerWidth, height: BASE_HEIGHT}),
      layer("base"),
      pos(width() * i, height() - BASE_HEIGHT),
      area(),
      move(LEFT, 70),
     // outview({pos: vec2(width(), height() - BASE_HEIGHT)}),
      "floor"
      ]);
  };
  
  onUpdate("floor", (f) => {
    if (f.pos.x + width() <= 4) {
      destroy(f);
      var floor = add([
          sprite("base", { width: window.innerWidth, height: BASE_HEIGHT }),
            pos(width(), height() - BASE_HEIGHT),
            area(),
            layer("base"),
            move(LEFT, 70),
           // outview({pos: vec2(width(), height() - BASE_HEIGHT)}),
            "floor"
            ]);
    };
    if (GAME_OVER) f.paused = true;
  });
  
  const PIPE_GAP = 140;
  const PIPE_HEIGHT = height() / 2 + PIPE_GAP / 2;
  const PIPE_DISTANCE = 10;
  
  function genPipes() {
    var bot_pipe = add([
      sprite(pipe, {height: PIPE_HEIGHT, width: 60}),
      pos(width(), rand((height() - BASE_HEIGHT) / 2 - PIPE_GAP/2, (height() - BASE_HEIGHT) / 2 + PIPE_GAP)),
      area(),
      layer("obj"),
      move(LEFT, 70),
      "bot_pipe",
      "pipe"
      ]);
      
    var top_pipe = add([
      sprite(pipe, {height: PIPE_HEIGHT, width: 60}),
      origin("center"),
      rotate(180),
      pos(bot_pipe.pos.x + bot_pipe.width / 2, bot_pipe.pos.y - PIPE_GAP - (PIPE_HEIGHT / 2)),
      area(),
      move(LEFT, 70),
      "pipe"
    ]);
    wait(2.5, ()=>{
      if (!GAME_OVER)
      genPipes();
    });
   
  };
  
  onUpdate("pipe", (p) => {
    if (p.pos.x + p.width <= 0) destroy(p);
    if (GAME_OVER) p.paused = true;
  })
  
  genPipes();
    
  const bird_width = 40;
  const bird_height = 30;
  
  const bird_anim = choose([["bluebird-upflap", "bluebird-midflap", "bluebird-downflap"], ["yellowbird-upflap", "yellowbird-midflap", "yellowbird-downflap"], ["redbird-upflap", "redbird-midflap", "redbird-downflap"]]);
    
  const bird = add([
    rect(bird_width, bird_height),
    pos(30, 30),
    area(),
    origin("center"),
    body({weight: 0.8}),
    "bird",
    {anim_frame: 0, isJumping: false}
    ]);
    
  const checkPoint = add([
    rect(2, 2),
    origin("botleft"),
    pos(-40, height() - BASE_HEIGHT),
    area(),
    "point"
    ])
    
  let angle = 0;
  let HIT_PIPE = false;
  
  let goWidth = 50;
  onDraw(() => {
    drawSprite({
      sprite: bird_anim[bird.anim_frame],
      width: bird_width,
      height: bird_height,
      pos: bird.pos,
      origin: "center",
      angle: angle
    });
    if (HIT_PIPE && angle < 60) angle += 1;
    bird.hidden = true;
    
    drawSprite({
      sprite: numList[leftScore],
      origin: "topright",
      layer: "ui",
      scale: 1.5,
      pos: vec2(width() / 2 - 5, 20)
    });
    
    drawSprite({
      sprite: numList[rightScore],
      layer: "ui",
      scale: 1.5,
      pos: vec2(width() / 2 + 5, 20)
    });
    
    if (GAME_OVER && !HIT_PIPE) {
      drawSprite({
        sprite: "gameover",
        width: goWidth,
        origin: ("center"),
        pos: vec2(width() / 2, height() / 2)
      });
      
      if (goWidth < 250) {
        goWidth+=3;
      }
    }
  });
  
  onTouchStart(() => {
    if (!GAME_OVER && bird.pos.y > 0) {
      bird.jump(400);
      bird.isJumping = true
      play("swoosh");
      play("wing");
    } else {
      if (!HIT_PIPE) {
      go("start");
      reset();
      };
    }
  });
  
  let timer = 0;
  onUpdate("bird", (b) => {
    if (b.isJumping) {
      timer += dt();
      if (timer < 0.15) return;
      timer = 0;
      b.anim_frame++;
      if (b.anim_frame >= bird_anim.length) {
        b.anim_frame = 0;
        b.isJumping = false;
      }
      
    }
  })
    
  onCollide("bird", "pipe", (b, p) => {
    if (!GAME_OVER) {
      play("hit");
      shake();
      wait(0.2, () => {
        play("die");
     });
     GAME_OVER = true;
     HIT_PIPE = true;
    };
  });
  
  onCollide("bird", "floor", (b, f) => {
    if (!GAME_OVER) play("hit");
    b.paused = true;
    GAME_OVER = true;
    HIT_PIPE = false;
  });
  
  onCollide("bot_pipe", "point", (bp, p) => {
    play("point");
    rightScore++;
    if (rightScore == 10) {
      leftScore++;
      rightScore = 0;
    };
    if (rightScore == 10) rightScore = 0;
  })
  
});

scene("start", () => {
  const bg = add([
      sprite(bgImg, { width: width(), height: height() }),
      pos(0, 0),
      ]);
      
  add([
      sprite("base", { width: window.innerWidth, height: BASE_HEIGHT }),
      layer("base"),
      pos(0, height() - BASE_HEIGHT),
    ]);
    
  const maxWidth = 200;
  const maxHeight = 273;
  const minWidth = 176;
  const minHeight = 263;
  
  let mWidth = 184;
  let mHeight
  
  let x = 1;
  let timer = 0;
  onDraw(() => {
    drawSprite({
      sprite: "message",
      origin: "center",
      pos: vec2(width()/2, height()/2),
      width: mWidth,
      height: mHeight
    })
    timer += dt();
    if (timer < 0.02) return;
    timer = 0;
    mWidth += x
    if (mWidth == maxWidth || mWidth == minWidth) x *= -1;
  });
  
  onTouchStart((id, pos) => {
    go("main");
  })
});

go("start");