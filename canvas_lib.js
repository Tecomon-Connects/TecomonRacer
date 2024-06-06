export function item(context_object) {
  let context = context_object.context;
  let x = 0,
    y = 0,
    alpha = 0,
    scale = 1;
  let children = [];

  let matrix = new DOMMatrix(),
    inverse,
    initialGrabbed;
  let needupdate = false;
  let obj_infos = {};
  let touchId;

  function append(c) {
    children.push(c);
  }

  function getMatrix() {
    update();
    return matrix;
  }

  function isTouched(pointer, identifier) {
    let movingMatrix = pointer.getMatrix(); // movingMatrix == T

    // the inverse of the local coord-system
    // used in isTouched()
    let localInverse = DOMMatrix.fromMatrix(matrix); // matrix = M/L
    localInverse.invertSelf();
    let localTouchPoint = localInverse.transformPoint(
      new DOMPoint(movingMatrix.e, movingMatrix.f)
    );
    if (
      context.isPointInPath(
        obj_infos.path,
        localTouchPoint.x,
        localTouchPoint.y
      )
    ) {
      touchId = identifier;

      inverse = new DOMMatrix(movingMatrix); // Ti
      inverse.invertSelf(); // Ti-1

      initialGrabbed = new DOMMatrix(matrix);
      initialGrabbed.preMultiplySelf(inverse);
      return true;
    }
    return false;
  }

  let dragged = false;
  function grab(pointer, identifier) {
    if (touchId === identifier) {
      matrix = new DOMMatrix(initialGrabbed);
      matrix.preMultiplySelf(pointer.getMatrix());
      // Store the coords - otherwise rotate does block translation
      x = matrix.e;
      y = matrix.f;
    }
  }

  function touchEnd(identifier) {
    if (touchId === identifier) {
      obj_infos.fillStyle = "gray";
      touchId = undefined;
    }
  }

  // Update the matrix after user translate/rotate
  function update() {
    if (needupdate) {
      matrix = new DOMMatrix();
      matrix.translateSelf(x, y);
      matrix.rotateSelf(alpha); // alpha must be degree not radians
      matrix.scaleSelf(scale);
      needupdate = false;
    }
  }

  // the draw function of base-class
  // stored/used as o.pre in sub-classes
  function draw(parent) {
    update();

    let local = DOMMatrix.fromMatrix(parent);
    local.multiplySelf(matrix);

    // draw children
    for (let c of children) {
      context.save();
      c.draw(local);
      context.restore();
    }
    // parent is drawn AFTER this trans
    context.transform(local.a, local.b, local.c, local.d, local.e, local.f);
    // NOT setTransform - would overwrite the global transform
  }

  function move(nx, ny) {
    x = nx;
    y = ny;
    needupdate = true;
    update();
  }

  function delta_move(nx, ny) {
    let collideX = x,
      collideY = y;

    collideX += nx;
    collideY += ny;

    if (
      !context.isPointInPath(context_object.pathIn, collideX, collideY) &&
      context.isPointInPath(context_object.pathOut, collideX, collideY)
    ) {
      x += nx;
      y += ny;
      needupdate = true;
    }
    update();
  }

  function rotate(na) {
    alpha = na;
    needupdate = true;
    update();
  }

  // rad to grad
  function rotateRadians(na) {
    alpha = (na * 180) / Math.PI;
    needupdate = true;
    update();
  }

  function setScale(sc) {
    scale = sc;
    needupdate = true;
  }

  return {
    move,
    rotate,
    grab,
    rotateRadians,
    isTouched,
    touchEnd,
    getMatrix,
    draw,
    delta_move,
    append,
    setScale,
    obj_infos,
    get x() {
      return x;
    },
    get y() {
      return y;
    },
  };
}

export function imgCar(context_object, img, x, y) {
  let context = context_object.context;
  let alpha = -90,
    scale = 1;

  function move(nx, ny) {
    x = nx;
    y = ny;
    //needupdate = true;
    //update();
  }

  function delta_move(nx, ny) {
    let collideX = x,
      collideY = y;

    collideX += nx;
    collideY += ny;

    context.translate(x, y);
    context.rotate((alpha * Math.PI) / 180 + (90 * Math.PI) / 180);

    context.resetTransform();

    if (
      !context.isPointInPath(context_object.pathIn, collideX, collideY) &&
      context.isPointInPath(context_object.pathOut, collideX, collideY)
    ) {
      x += nx;
      y += ny;
      //needupdate = true;
    }
    //update();
  }

  function rotate(na) {
    alpha = na;
    //needupdate = true;
    //update();
  }

  // rad to grad
  function rotateRadians(na) {
    alpha = (na * 180) / Math.PI;
    //needupdate = true;
    //update();
  }

  function setScale(sc) {
    scale = sc;
    //needupdate = true;
  }

  function draw() {
    context.translate(x, y);
    context.rotate((alpha * Math.PI) / 180 + (90 * Math.PI) / 180);

    context.translate(-25 * scale, -25 * scale);
    context.drawImage(img, 0, 0, 50 * scale, 50 * scale);
    context.resetTransform();
  }

  function reset(resetX, resetY) {
    x = resetX;
    y = resetY;
    alpha = -90;
  }

  return {
    draw,
    move,
    delta_move,
    rotate,
    rotateRadians,
    reset,
    setScale,
    get x() {
      return x;
    },
    get y() {
      return y;
    },
  };
}

export function circle(context_object, radius, fillStyle) {
  let o = item(context_object);
  let context = context_object.context;

  o.setFillStyle = (style) => {
    fillStyle = style;
  };

  let pre = o.draw;
  o.draw = function (parent) {
    context.save();
    pre(parent);
    context.fillStyle = fillStyle;
    let endAngle = Math.PI * 2; // End point on circle
    context.beginPath();
    context.arc(0, 0, radius, 0, endAngle, true);
    context.fill();

    context.restore();
  };
  return o;
}

export function path_object(context_object, scale, fillStyle, path_func) {
  let context = context_object.context;
  let o = item(context_object);
  o.obj_infos.path = path_func();
  o.obj_infos.fillStyle = fillStyle;
  let pre = o.draw;
  o.setScale(scale);

  o.draw = function (m) {
    context.save();
    pre(m);
    context.fillStyle = o.obj_infos.fillStyle;
    context.fill(o.obj_infos.path);

    context.restore();
  };
  return o;
}

function tri_path() {
  //green touch triangle
  let the_path = new Path2D();
  the_path.moveTo(2, 0);
  the_path.lineTo(0, 5);
  the_path.lineTo(-2, 0);
  the_path.closePath();
  return the_path;
}

export function dragger(context_object, identifier) {
  let o = path_object(context_object, 25, "#0f0", tri_path, `T: ${identifier}`);

  const MIN_DIST = 10;
  const SAMPLES = 10;
  let pipe = [];
  let alpha = 0;

  o.move_global = function (nx, ny) {
    let localTouchPoint = context_object.inverse.transformPoint(
      new DOMPoint(nx, ny)
    );
    o.move(localTouchPoint.x, localTouchPoint.y);

    pipe.push({ old_x: o.x, old_y: o.y });
    if (pipe.length > SAMPLES) {
      let { old_x, old_y } = pipe.shift();
      let d = distance(o.x, o.y, old_x, old_y);
      if (d > MIN_DIST) {
        let dx = old_x - o.x;
        let dy = old_y - o.y;
        // console.log(dx, dy);
        o.rotateRadians(Math.atan2(dy, dx) + Math.PI / 2);
      }
    }
  };
  return o;
}

///////////////////////////////////////////////////////////////////////////////
// gets the canvas-context
// calculates a global transformation to support device-independant coordinates
// returns

export function getCanvas(id, width, height) {
  const drawing_width = width || 1422;
  const drawing_height = height || 800;
  const drawing_aspect_ratio = drawing_width / drawing_height;
  let pathOut, pathIn, pathMid, goal;

  // aus https://www.html5rocks.com/en/tutorials/canvas/hidpi/
  // Get the device pixel ratio, falling back to 1.

  // USAGE OF DPR seems to be NOT necessary
  const dpr = window.devicePixelRatio || 1;
  // let rect = canvas.getBoundingClientRect();
  // canvas.width = rect.width * dpr;
  // canvas.height = rect.height * dpr;
  // console.log(`Canvas ${canvas.width}x${canvas.height} Dpr: ${dpr}`)

  let canvas = document.getElementById(id);
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  width = canvas.width;
  height = canvas.height;

  // calculate a global matrix with translation and scale
  let context = canvas.getContext("2d");
  let matrix;

  let scale = 1;
  let fontSize = 40;

  // variables used to draw a frame around the desired screen part
  //const dist = 5;
  //let frame_x = dist;
  //let frame_y = dist;
  //let frame_width = drawing_width - 2 * dist;
  //let frame_height = drawing_height - 2 * dist;

  // this will be returned/exported
  let context_object = {};

  CanvasRenderingContext2D.prototype.roundRect = function (x, y, w, h, r) {
    if (w < 2 * r) r = w / 2;
    if (h < 2 * r) r = h / 2;

    this.beginPath();
    this.moveTo(x + r, y);
    this.arcTo(x + w, y, x + w, y + h, r);
    this.arcTo(x + w, y + h, x, y + h, r);
    this.arcTo(x, y + h, x, y, r);
    this.arcTo(x, y, x + w, y, r);
    this.closePath();

    return this;
  };

  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    let canvas_aspect_ratio = canvas.width / canvas.height;
    let ratio = drawing_aspect_ratio / canvas_aspect_ratio;
    //let border_height = 0
    //let border_width = 0
    //let scale = 1

    // ratio > 1: "to much" height of the real screen
    // width used to calculate the global scale factor
    if (ratio > 1) {
      scale = canvas.width / drawing_width;
      // border_height = (canvas.height - scale * drawing_height) / 2;
      //frame_x = dist;
      //frame_width = drawing_width - 2 * dist;
    } else {
      // ratio < 1: "to much" width of the real screen
      // height used to calculate the global scale factor
      scale = canvas.height / drawing_height;
      // border_width = (canvas.width - scale * drawing_width) / 2;
      //frame_y = dist;
      //frame_height = drawing_height - 2 * dist;
    }

    //console.log(`Canvas ${canvas.width}x${canvas.height} Dpr: ${dpr} dr.asp ${drawing_aspect_ratio.toFixed(2)} cv.asp ${canvas_aspect_ratio.toFixed(2)}`)
    //console.log(`Ratio ${ratio.toFixed(2)} Border ${border_width.toFixed(0)}x${border_height.toFixed(0)} scale ${scale.toFixed(2)}`)

    matrix = new DOMMatrix();
    //matrix.translateSelf(border_width, border_height);
    //matrix.scaleSelf(scale, scale);

    context_object.inverse = DOMMatrix.fromMatrix(matrix);
    context_object.inverse.invertSelf();
  }

  window.addEventListener("resize", resize);
  resize();

  // clear the canvas, set the context
  context_object.pre_draw = function (
    player1,
    player2,
    runden1,
    runden2,
    color1,
    color2
  ) {
    context.clearRect(0, 0, context.canvas.width, context.canvas.height);
    context.setTransform(matrix);

    draw_canvas(player1, player2, runden1, runden2, color1, color2);
  };

  function draw_canvas(player1, player2, runden1, runden2, color1, color2) {
    context.strokeStyle = "#080"; //Linienfarbe
    context.lineWidth = 3; //Linienbreite
    fontSize = 40 * scale;

    //Hintergrund (grün)
    context.save();
    context.fillStyle = "#339933";
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.restore();

    //Text
    context.save();
    context.fillStyle = color1;
    context.font = `${fontSize}px Arial`;
    if (runden1 == -1) runden1 = 0;
    context.fillText(
      `${player1}: ${runden1}`,
      canvas.width - 200 * scale,
      0 + 40 * scale
    );
    context.fillStyle = color2;
    if (runden2 == -1) runden2 = 0;
    context.fillText(
      `${player2}: ${runden2}`,
      canvas.width - 200 * scale,
      0 + 90 * scale
    );
    context.restore();

    //Streckenhintergrund
    context.save();
    context.fillStyle = "#424242";
    context.beginPath();
    context.roundRect(
      canvas.width / 2 - canvas.width / 3,
      canvas.height / 2 - canvas.height / 3,
      canvas.width / 1.5,
      canvas.height / 1.5,
      10
    );
    context.fill();

    context.fillStyle = "#fff";
    context.beginPath();
    context.roundRect(
      canvas.width / 2 - canvas.width / 4 + 50,
      canvas.height / 2 - canvas.height / 4 + 50,
      canvas.width / 2 - 100,
      canvas.height / 2 - 100,
      10
    );
    context.fill();
    context.restore();

    //Strecke
    pathOut = new Path2D();
    pathOut.roundRect(
      canvas.width / 2 - canvas.width / 3,
      canvas.height / 2 - canvas.height / 3,
      canvas.width / 1.5,
      canvas.height / 1.5,
      10
    );
    context.stroke(pathOut);

    pathIn = new Path2D();
    pathIn.roundRect(
      canvas.width / 2 - canvas.width / 4 + 50,
      canvas.height / 2 - canvas.height / 4 + 50,
      canvas.width / 2 - 100,
      canvas.height / 2 - 100,
      10
    );
    context.stroke(pathIn);

    //Mittellinie (gestrichelt)
    pathMid = new Path2D();
    pathMid.roundRect(
      (canvas.width / 2 -
        canvas.width / 4 +
        50 -
        (canvas.width / 2 - canvas.width / 3)) /
        2 +
        canvas.width / 2 -
        canvas.width / 3,
      (canvas.height / 2 -
        canvas.height / 4 +
        50 -
        (canvas.height / 2 - canvas.height / 3)) /
        2 +
        canvas.height / 2 -
        canvas.height / 3,
      (canvas.width / 1.5 - (canvas.width / 2 - 100)) / 2 +
        canvas.width / 2 -
        100,
      (canvas.height / 1.5 - (canvas.height / 2 - 100)) / 2 +
        canvas.height / 2 -
        100,
      10
    );
    context.save();
    context.setLineDash([10, 10]);
    context.strokeStyle = "#ffffff";
    context.stroke(pathMid);
    context.restore();

    //Ziel
    context.save();
    context.fillStyle = "#d8dcd4";
    goal = new Path2D();
    goal.rect(
      canvas.width / 2 - canvas.width / 3 + canvas.width / 3,
      canvas.height / 2 - canvas.height / 3,
      20,
      canvas.height / 12 + 50
    );
    context.fill(goal);
    context.restore();
  }

  draw_canvas();

  context_object.context = context;
  context_object.canvas = canvas;
  context_object.pathOut = pathOut;
  context_object.pathIn = pathIn;
  context_object.goal = goal;
  context_object.scale = scale;
  context_object.fontSize = fontSize;

  return context_object;
}

export function distance(x1, y1, x2, y2) {
  let dx = x1 - x2;
  let dy = y1 - y2;
  return Math.sqrt(dx * dx + dy * dy);
}

export function winGame(context, spieler, color, fontSize, scale, time) {
  console.log("time");
  console.log(time);
  let timeString =
    String(time).slice(-5, -3) + "." + String(time).slice(-3, -1);
  if (timeString.length == 3) {
    timeString = "00" + timeString;
  }
  if (timeString.length == 4) {
    timeString = "0" + timeString;
  }

  console.log("timeString");
  console.log(timeString);

  context.fillStyle = "#eee";
  context.roundRect(
    context.canvas.width / 2 - 200 * scale,
    context.canvas.height / 2 - 125 * scale,
    400 * scale,
    250 * scale,
    20
  );
  context.fill();
  context.translate(
    context.canvas.width / 2 - 200 * scale,
    context.canvas.height / 2 - 100 * scale
  );

  context.fillStyle = color;
  context.font = `${fontSize}px Verdana`;
  context.fillText(`${spieler}`, fontSize * 1.1, fontSize * 2);
  context.fillText(`hat gewonnen!`, fontSize * 1.1, fontSize * 3.5);
  context.fillText(`in ${timeString}s`, fontSize * 1.1, fontSize * 5);

  fetch(`/api/savescoreboard?name=${spieler}&time=${time}`)
    .then((res) => res.text())
    .then((data) => console.log(data));
}
