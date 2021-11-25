import { dragger, distance } from './canvas_lib.js';

export function TouchInteraction(context_object, grabbable) {
    let context = context_object.context
    let fingers = {};

    function setFingers(touches) {
        for (let t of touches) {
            let f = dragger(context_object, t.identifier);
            f.move_global(t.pageX, t.pageY);

            for (let g of grabbable) {
                if (g.isTouched(f, t.identifier)) {
                    console.log("Touch", t.identifier);
                    break;
                }
            }
            fingers[t.identifier] = f;
        }
    }

    function moveFingers(touches) {
        for (let t of touches) {
            let f = fingers[t.identifier];
            f.move_global(t.pageX, t.pageY);
            for (let g of grabbable) {
                g.grab(f, t.identifier);
            }
        }
    }

    function rmFingers(touches) {
        for (let t of touches) {
            // remove identifier from list of fingers
            delete fingers[t.identifier]
            for (let g of grabbable) {
                g.touchEnd(t.identifier);
            }
        }
    }

    context.canvas.addEventListener("touchstart", (evt) => {
        evt.preventDefault();
        setFingers(evt.changedTouches);
    }, true);

    context.canvas.addEventListener("touchmove", (evt) => {
        evt.preventDefault();
        moveFingers(evt.changedTouches);
    }, true);

    context.canvas.addEventListener("touchend", (evt) => {
        evt.preventDefault();
        rmFingers(evt.changedTouches);
    }, true);

    
    function drawFingers(parent) {
        for (let identifier in fingers) {
            let finger = fingers[identifier];
            //finger.draw(parent);  //debug: green triangle
        }
    }

    return drawFingers;
}