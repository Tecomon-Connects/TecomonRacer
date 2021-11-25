import { path_object, circle, distance } from './canvas_lib.js';

/*function tri_path() {   //space ship
    let the_path = new Path2D();
    //let the_path = new Image();
    //the_path.src = './images/car1.png';
    the_path.moveTo(0, 0);
    the_path.lineTo(1.5, 0);
    the_path.lineTo(1.5, 2);
    the_path.lineTo(0, 2);
    the_path.closePath();
    return the_path;
}*/

/*function rot_path_object(context_object, scale, fillStyle, path_func = tri_path) {
    let context = context_object.context;

    let o = path_object(context_object, scale, fillStyle, path_func, "Fr");
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
    }
    return o;
}*/

/*export function car(context_object, scale = 10, color = "#aaa") {   //for space ship
    let car = rot_path_object(context_object, scale, color, tri_path);
    
    // switch off standard grabbing
    car.grab = function () { }

    return car;
}*/

export function interactive_circle(context_object, x, y, radius = 30, style) {
    let o = circle(context_object, radius, style);
    //let context = context_object.context;

    let timeOfFirstTouch;
    let stopMove = false;

    //let pre = o.draw;
    o.move(x, y);

    let touchId;
    let tx = x, ty = y, mx = x, my = y;

    o.isTouched = function (pointer, identifier) {
        let movingMatrix = pointer.getMatrix();  // movingMatrix == T
        let d = distance(x, y, movingMatrix.e, movingMatrix.f);
        if (d < radius) {
            timeOfFirstTouch = new Date().getTime();
            touchId = identifier;
            tx = movingMatrix.e;
            ty = movingMatrix.f;
            mx = tx;
            my = ty;
        }
    }

    o.grab = function (pointer, identifier) {
        let movingMatrix = pointer.getMatrix();  // movingMatrix == T
        let d = distance(x, y, movingMatrix.e, movingMatrix.f);
        
        if ((touchId === identifier)) {
            let movingMatrix = pointer.getMatrix();  // movingMatrix == T

            if (d < radius * context_object.scale) {
                mx = movingMatrix.e;
                my = movingMatrix.f;
                stopMove = false;
            } else { stopMove = true }
        }
    }

    o.touchEnd = function (identifier) {
        if (touchId === identifier) {
            touchId = undefined;
            tx = x; ty = y; mx = x; my = y;
        }
    }

    o.get = function () {

        return { x, y, tx, ty, mx, my, stopMove};
    }

    o.setScale 

    /*o.draw = function (m) {   //move triangle
        context.save();
        pre(m);

        if (touchId !== undefined) {
            context.strokeStyle = "#55F";
            context.lineWidth = 2;
            context.beginPath();
            context.moveTo(x, y);
            context.lineTo(tx, ty);
            context.lineTo(mx, my);
            context.lineTo(x, y);
            context.stroke();
        }

        context.restore();
    }*/

    return o;
}