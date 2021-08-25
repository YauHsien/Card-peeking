const CARD_PEEKING_INIT_PROF = new (function(){
    this.NAME = 'CARD_PEEKING_AREA';
    this.WIDTH = '300px';
    this.HEIGHT = '150px';
})();

let THE_CARD_PEEKING_ELEM;
let DEBUG_ELEM;

const RENDER_STATE_ENUM = new (function(){
    this.ACTIVA = '_activated';
    this.DISACT = '_disactivated';
})();
const FLIP_STATE_ENUM = new (function(){
    this.DISACT = '_disactivated';
    this.ACTIVA = '_activated';
    this.FLIPPI = '_flipping';
    this.RELEAS = '_released';
})();
const ACTION_ENUM = new (function(){
    this.TOUC = this.TOUCH = '_touch';
    this.MOVE = '_move';
    this.RELE = this.RELEASE = '_release';
})();
const CORNER_RANGE = new Size(20, 20);
const BASE_POSITION_1 = new Point(20, 20);
const BASE_POSITION_2 = new Point(20, 20);
const POKER_SIZE_1 = new Size(215, 300);
const POKER_SIZE_2 = new Size(300, 215);

/* Initialization */
//document.addEventListener('DOMContentLoaded', initCardPeeking);

/**
 * Example of initialization
 */
/*
function initCardPeeking (event) {
    const elem = new CardPeekingElement();
    let _card_1 = new PlayingCard(
        'c1',
        elem,
        new Point(20, 20),
        'face1.png',
        'back1.png'
    );
    let _card_2 = new PlayingCard(
        'c2',
        elem,
        new Point(150, 20),
        'face2.png',
        'back2.png'
    );
    THE_CARD_PEEKING_ELEM = elem;
}
*/

function CardPeekingElement() {
    const area = document.getElementById(CARD_PEEKING_INIT_PROF.NAME);
    if (!area) {
        console.error(`Element #${CARD_PEEKING_INIT_PROF.NAME} not found.`);
        return undefined;
    }
    area._state = RENDER_STATE_ENUM.DISACT;
    area.cardList = new CardList();
    area.render = function(event) {
        if (area._state === RENDER_STATE_ENUM.ACTIVA) {
            for (let i = 0; i < area.cardList.length; i++) {
                area.cardList[i].render(event);
            }
            area._state = RENDER_STATE_ENUM.DISACT;
        }
    };
    if (!area.style.width)
        area.style.width = CARD_PEEKING_INIT_PROF.WIDTH;
    if (!area.style.height)
        area.style.height = CARD_PEEKING_INIT_PROF.HEIGHT;
    const background = document.createElement('div');
    background.style.position = 'absolute';
    background.style.width = '' + area.clientWidth + 'px';
    background.style.height = '' + area.clientHeight + 'px';
    background.style.backgroundColor = 'navy';
    const viewport = document.createElement('div');
    viewport.classList.add('view-port');
    viewport.style.position = 'absolute';
    viewport.style.width = '' + area.clientWidth + 'px';
    viewport.style.height = '' + area.clientHeight + 'px';
    let debugview;
    if (area.getAttribute('debug') === 'true') {
        debugview = document.createElement('canvas');
        debugview._state = RENDER_STATE_ENUM.DISACT;
        debugview.style.position = 'absolute';
        debugview.setAttribute('width', area.clientWidth);
        debugview.setAttribute('height', area.clientHeight);
        debugview.render = function(event) {
            if (debugview._state === RENDER_STATE_ENUM.ACTIVA) {
                console.log('debug reander!');
                debugview._state = RENDER_STATE_ENUM.DISACT;
            }
        };
        debugview.addEventListener('touchstart', function(e) {
            e.preventDefault();
            this.render(e);
        });
        debugview.addEventListener('touchmove', function(e) {
            e.preventDefault();
            this.render(e);
        });
        debugview.addEventListener('touchend', function(e) {
            e.preventDefault();
            this.render(e);
        });
        debugview.addEventListener('mousedown', function(e) {
            e.preventDefault();
            this.render(e);
        });
        debugview.addEventListener('mousemove', function(e) {
            e.preventDefault();
            this.render(e);
        });
        debugview.addEventListener('mouseup', function(e) {
            e.preventDefault();
            this.render(e);
        });
    }
    const controlport = document.createElement('div');
    controlport.classList.add('control-port');
    if (area.getAttribute('debug') === 'true')
        controlport.style.position = 'inherit';
    else
        controlport.style.position = 'absolute';
    controlport.style.width = '' + area.clientWidth + 'px';
    controlport.style.height = '' + area.clientHeight + 'px';
    controlport.touch = undefined;
    controlport.addEventListener('touchstart', function(e) {
        if (area.getAttribute('debug') !== 'true')
            e.preventDefault();
        let controlled;
        if (e.targetTouches.length === 2) {
            let t1 = e.targetTouches.item(0),
                t2 = e.targetTouches.item(1);
            let p1 =
                new Point(
                    t1.clientX - area.getBoundingClientRect().left - area.clientLeft,
                    t1.clientY - area.getBoundingClientRect().top - area.clientTop
                ),
                p2 = new Point(
                    t2.clientX - area.getBoundingClientRect().left - area.clientLeft,
                    t2.clientY - area.getBoundingClientRect().top - area.clientTop
                );
            let a1, a2;
            for (let i = area.cardList.length-1; i > -1; i--) {
                let r = area.cardList[i].getRange();
                if (!a1 && p1.within(r)) {
                    a1 = t1.identifier;
                    controlled = area.cardList[i];
                }
                if (!a2 && p2.within(r)) {
                    a2 = t2.identifier;
                    controlled = area.cardList[i];
                }
            }
            if (a1 !== undefined && a2 && controlled) {
                let pt = midpoint(p1, p2);
                let cutLine = new CutLine(
                    controlled,
                    pt,
                    p1.getSlopeWith(p2)
                );
                let ct = controlled.getCenterPoint();
                if (cutLine.top && cutLine.down) {
                    if (cutLine.top.x < ct.x && cutLine.down.x < ct.x) {
                        this.touch = {
                            t1: t1,
                            t2: t2,
                            side: 'left',
                            touchPt: new Point(controlled.getLeftSide().x1, ct.y)
                        };
                    }
                    else if (ct.x < cutLine.top.x && ct.x < cutLine.down.x) {
                        this.touch = {
                            t1: t1,
                            t2: t2,
                            side: 'right',
                            touchPt: new Point(controlled.getRightSide().x1, ct.y)
                        };
                    }
                }
                else if (cutLine.left && cutLine.right) {
                    if (cutLine.left.y < ct.y && cutLine.right.y < ct.y) {
                        this.touch = {
                            t1: t1,
                            t2: t2,
                            side: 'top',
                            touchPt: new Point(ct.x, controlled.getTopSide().y1)
                        };
                    }
                    else if (ct.y < cutLine.left.y && ct.y < cutLine.right.y) {
                        this.touch = {
                            t1: t1,
                            t2: t2,
                            side: 'down',
                            touchPt: new Point(ct.x, controlled.getDownSide().y1)
                        };
                    }
                }
            }
        }
        else if (e.targetTouches.length === 1) {
            let pt =
                new Point(
                    e.targetTouches.item(0).clientX - area.getBoundingClientRect().left - area.clientLeft,
                    e.targetTouches.item(0).clientY - area.getBoundingClientRect().top - area.clientTop
                );
            this.touch = {
                t1: e.targetTouches.item(0),
                t2: undefined,
                side: undefined,
                touchPt: pt
            };
        }
        else
            this.touch = undefined;
        if (this.touch && this.touch.touchPt) {
            let evt = new MouseEvent('mousedown', {
                clientX: this.touch.touchPt.x + area.getBoundingClientRect().left + area.clientLeft,
                clientY: this.touch.touchPt.y + area.getBoundingClientRect().top + area.clientTop
            });
            this.dispatchEvent(evt);
        }
    });
    controlport.addEventListener('touchmove', function(e) {
        if (area.getAttribute('debug') !== 'true')
            e.preventDefault();
        if (this.touch
            && ((e.targetTouches.length === 2
                 && this.touch.t1
                 && this.touch.t2
                 && ((this.touch.t1.identifier === e.targetTouches.item(0).identifier
                      && this.touch.t2.identifier === e.targetTouches.item(1).identifier)
                     || (this.touch.t1.identifier === e.targetTouches.item(1).identifier
                         && this.touch.t2.identifier === e.targetTouches.item(0).identifier))
                 || (e.targetTouches.length === 1
                     && this.touch.t1
                     && this.touch.t1.identifier === e.targetTouches.item(0).identifier)))
           ) {
            let movePt;
            let evt;
            if (this.touch.t2)
                movePt = midpoint(
                    new Point(e.targetTouches.item(0).clientX, e.targetTouches.item(0).clientY),
                    new Point(e.targetTouches.item(1).clientX, e.targetTouches.item(1).clientY)
                );
            else
                movePt = new Point(e.targetTouches.item(0).clientX, e.targetTouches.item(0).clientY);
            evt = new MouseEvent('mousemove', {
                clientX: movePt.x,
                clientY: movePt.y
            });
            this.dispatchEvent(evt);
        }
    });
    controlport.addEventListener('touchend', function(e) {
        if (area.getAttribute('debug') !== 'true')
            e.preventDefault();
        this.dispatchEvent(new MouseEvent('mouseup', e));
    });
    controlport.addEventListener('mousedown', function(e) {
        if (area.getAttribute('debug') !== 'true')
            e.preventDefault();
        let latestTouched,
            gotBlocked = false;
        let i = 0;
        let pt = new Point(
            e.clientX - area.getBoundingClientRect().left - area.clientLeft,
            e.clientY - area.getBoundingClientRect().top - area.clientTop
        );
        for (i = area.cardList.length-1; i > -1; i--) {
            let cr = area.cardList[i];
            if (cr.isTouchable(pt)) {
                latestTouched = cr;
                break;
            }
            if (!cr._flip_state && pt.within(cr.getRange()))
                gotBlocked = true;
        }
        if (latestTouched && !gotBlocked) {
            area.cardList.bringToLatest(i);
            latestTouched.touch(pt);
        }
        area.render(e);
    });
    controlport.addEventListener('mousemove', function(e) {
        if (area.getAttribute('debug') !== 'true')
            e.preventDefault();
        let latestTouched = area.cardList[area.cardList.length-1];
        let pt = new Point(
            e.clientX - area.getBoundingClientRect().left - area.clientLeft,
            e.clientY - area.getBoundingClientRect().top - area.clientTop
        );
        if (latestTouched) {
            latestTouched.move(pt);
        }
        area.render(e);
    });
    controlport.addEventListener('mouseup', function(e) {
        if (area.getAttribute('debug') !== 'true')
            e.preventDefault();
        let pt = new Point(e.clientX, e.clientY);
        let latestTouched = area.cardList[area.cardList.length-1];
        if (latestTouched) {
            latestTouched.release();
        }
        area.render(e);
    });
    controlport.addEventListener('mouseout', function(e) {
        if (area.getAttribute('debug') !== 'true')
            e.preventDefault();
        this.dispatchEvent(new MouseEvent('mouseup', e));
    });
    area.appendChild(background);
    area.appendChild(viewport);
    if (area.getAttribute('debug') === 'true') {
        DEBUG_ELEM = debugview;
        controlport.appendChild(debugview);
        area.appendChild(controlport);
    }
    else
        area.appendChild(controlport);
    return area;
} /* End of function CardPeekingElement */

function PlayingCard(id,
                     parent,
                     basePoint = new Point(20, 20),
                     faceSrc,
                     backSrc,
                     cornerRange = new Size(20, 20)) {

    this.id = undefined;

    this._outer_border = undefined;
    this._inner_border = undefined;

    this.BORDER_WIDTH_RATE = 0.1;
    this._border_width = undefined;

    this._base_point = undefined;

    this._parent = undefined;
    this._flip_state = undefined;

    this._state = RENDER_STATE_ENUM.ACTIVA;

    this._face = undefined;
    this._back = undefined;

    this._top_side = undefined;
    this._down_side = undefined;
    this._left_side = undefined;
    this._right_side = undefined;
    this._center_point = undefined;
    this._top_left = undefined;
    this._top_right = undefined;
    this._down_left = undefined;
    this._down_right = undefined;

    this._corner_range = undefined;

    this.fingers = [];

    this.setParent = function(elem) {
        this._parent = elem;
    };

    this.setBasePt = function(pt = new Point(20, 20)) {
        this._base_point = pt;
    };

    this.setSrc = function(faceSrc, backSrc) {
        let face = document.createElement('img'),
            back = document.createElement('img');
        let faceloaded,
            backloaded,
            base = this;
        face.onload = function() {
            faceloaded = true;
            if (backloaded) {
                if (face.naturalWidth != back.naturalWidth
                    || face.naturalHeight != back.naturalHeight)
                    console.warn(`Factors not match: "${faceSrc}" and "${backSrc}"`);
                base._configure(face, back);
            }
        };
        back.onload = function() {
            backloaded = true;
            if (faceloaded) {
                if (face.naturalWidth != back.naturalWidth
                    || face.naturalHeight != back.naturalHeight)
                    console.warn(`Factors not match: "${faceSrc}" and "${backSrc}"`);
                base._configure(face, back);
            }
        };
        face.src = faceSrc;
        back.src = backSrc;
    };

    this.configure = function (id, parent, basePt, faceSrc, backSrc, cornerRange) {
        this.id = id;
        this._parent = parent;
        this._base_point = basePt;
        this._corner_range = cornerRange;
        this.setSrc(faceSrc, backSrc);
    };

    this._configure = function (faceElem, backElem) {
        this._face = faceElem;
        this._back = backElem;
        this._parent.cardList.push(this);
        this._get_sides();
        this._get_ranges();
        this.render();
    };

    this._get_sides = function() {
        this._top_side =
            new Line(this._base_point.x, this._base_point.y, this._base_point.x+this._face.naturalWidth, this._base_point.y);
        this._down_side =
            new Line(this._base_point.x, this._base_point.y+this._face.naturalHeight, this._base_point.x+this._face.naturalWidth, this._base_point.y+this._face.naturalHeight);
        this._left_side =
            new Line(this._base_point.x, this._base_point.y, this._base_point.x, this._base_point.y+this._face.naturalHeight);
        this._right_side =
            new Line(this._base_point.x+this._face.naturalWidth, this._base_point.y, this._base_point.x+this._face.naturalWidth, this._base_point.y+this._face.naturalHeight);
        this._center_point =
            midpoint(
                midpoint(new Point(this._top_side.x1,this._top_side.y1), new Point(this._top_side.x2,this._top_side.y2)),
                midpoint(new Point(this._down_side.x1,this._down_side.y1), new Point(this._down_side.x2,this._down_side.y2))
            );
        this._top_left = new Point(this._base_point.x, this._base_point.y);
        this._top_right = new Point(this._base_point.x+this._face.naturalWidth, this._base_point.y);
        this._down_left = new Point(this._base_point.x, this._base_point.y+this._face.naturalHeight);
        this._down_right = new Point(this._base_point.x+this._face.naturalWidth, this._base_point.y+this._face.naturalHeight);
    };

    this._get_ranges = function() {
        this._outer_border =
            new Range(this._base_point.x,
                      this._face.naturalWidth,
                      this._base_point.y,
                      this._face.naturalHeight);
        this._border_width = (this._face.naturalWidth > this._face.naturalHeight)
            ? (this._face.naturalWidth * this.BORDER_WIDTH_RATE)
            : (this._face.naturalHeight * this.BORDER_WIDTH_RATE);
        this._inner_border =
            new Range(this._base_point.x + this._border_width,
                      this._face.naturalWidth - this._border_width - this._border_width,
                      this._base_point.y + this._border_width,
                      this._face.naturalHeight - this._border_width - this._border_width);
    };

    this.collectFinger = function(pos = (new Point), touch) {
        if (pos.within(this._outer_border)) {
            this.fingers[this.fingers.length] = touch;
            return true;
        }
        else
            return false;
    };

    this.getArea = function() {
        return get_convex_polygon_area([this._top_left, this._top_right, this._down_right, this._down_left]);
    };

    this.getTopSide = function() {
        return this._top_side;
    };

    this.getDownSide = function() {
        return this._down_side;
    };

    this.getLeftSide = function() {
        return this._left_side;
    };

    this.getRightSide = function() {
        return this._right_side;
    };

    this.getTopLeftVertex = function() {
        return this._top_left;
    };

    this.getTopRightVertex = function() {
        return this._top_right;
    };

    this.getDownLeftVertex = function() {
        return this._down_left;
    };

    this.getDownRightVertex = function() {
        return this._down_right;
    };

    this.getRange = function() {
        return this._outer_border;
    };

    this.getCenterPoint = function () {
        return this._center_point;
    };

    this.isTouchable = function(pt = new Point()) {
        if (!this._flip_state)
            return (this._outer_border
                    && pt.within(this._outer_border)
                    && !pt.within(this._inner_border));
        else
            return !this._flip_state.isFullShown;
    };

    this.touch = function(pt = (new Point)) {
        if (this.isTouchable(pt)) {
            var state = new FlipState(this, pt);
            this._flip_state =
                this._parent._drag_path =
                state;
            this._state =
                this._parent._state =
                RENDER_STATE_ENUM.ACTIVA;
        }
    };

    this.move = function (toPt = (new Point)) {
        if (this._flip_state
            && !this._flip_state.isFullShown
            && !toPt.isSameAs(this._flip_state.touchPt)) {
            let [p1, p2] = [this._flip_state.dragPt,
                            this._flip_state.edgePt];
            this._flip_state.dragTo(toPt);
            if ((p1 && !p1.isSameAs(this._flip_state.dragPt))
                || (p2 && !p2.isSameAs(this._flip_state.edgePt))) {
                this._state =
                    this._parent._state =
                    RENDER_STATE_ENUM.ACTIVA;
            }
        }
    };

    this.release = function() {
        if (this._flip_state) {
            if (this._flip_state.getFaceArea() * 3 < this.getArea()) {
                this._flip_state = undefined;
            }
            else {
                this._flip_state.setIsFullShown(true);
            }
            this._state =
                this._parent._state =
                RENDER_STATE_ENUM.ACTIVA;
        }
    };

    this.render = function (event) {
        if (this._state === RENDER_STATE_ENUM.ACTIVA) {
            let viewArea = this._get_first_element_by_class_from(this._parent);
            if (viewArea) {
                /* Remove old one */
                let oldOne = this._get_first_element_by_id_from(viewArea, this.id);
                if (oldOne)
                    viewArea.removeChild(oldOne);
                /* Done of removing old one */
                /* Add new one */
                let newOne = document.createElement('div');
                newOne.setAttribute('id', this.id);
                newOne.style.position = 'inherit';
                newOne.style.width = 'inherit';
                newOne.style.height = 'inherit';
                if (!this._flip_state) {
                    let img = new ImageElement(this._base_point, this._back);
                    newOne.appendChild(img);
                }
                else {
                    let faceImg,
                        backImg;
                    if (this._flip_state.isFullShown) {
                        faceImg = new ImageElement(this._base_point, this._face);
                    }
                    else if (this._flip_state.cutLine
                             && this._flip_state.cutLine.anotherCenter) {
                        let corner = new Point(
                            this._flip_state.cutLine.anotherCenter.x - this._face.naturalWidth / 2,
                            this._flip_state.cutLine.anotherCenter.y - this._face.naturalHeight / 2
                        );
                        let slope = new Line(
                            this._flip_state.cutLine.anotherCenter.x,
                            this._flip_state.cutLine.anotherCenter.y,
                            this._center_point.x,
                            this._center_point.y
                        ).getSlope();
                        let rad = 2 * Math.atan(slope);
                        faceImg = new ImageElement(corner, this._face, rad, this._flip_state.faceShape);
                        backImg =
                            new ImageElement(this._base_point, this._back, undefined, this._flip_state.backShape);
                    }
                    else
                        backImg = new ImageElement(this._base_point, this._back);
                    if (backImg)
                        newOne.appendChild(backImg);
                    if (faceImg)
                        newOne.appendChild(faceImg);
                }
                viewArea.appendChild(newOne);
                /* Done of adding new one */
            }
            this._state = RENDER_STATE_ENUM.DISACT;
        }
    };

    this._get_first_element_by_class_from = function(elem) {
        let nodes = elem.getElementsByClassName('view-port');
        if (nodes.length === 0)
            return undefined;
        else
            return nodes[0];
    };

    this._get_first_element_by_id_from = function(elem, id) {
        for (let i = 0; i < elem.children.length; i++) {
            var child = elem.children[i];
            if (child.getAttribute('id') === id)
                return child;
        }
        return undefined;
    };

    this.configure(id, parent, basePoint, faceSrc, backSrc, cornerRange);
} /* End of function PlayingCard */

function CardList(arr = []) {
    var obj = arr;
    obj.bringToLatest = function(i = -1) {
        if (0 <= i && i < obj.length-1) {
            let newArray = [];
            for (let j = (i==0)?(1):(0); j < obj.length; (j==i-1)?(j+=2):(j++))
                newArray[newArray.length] = obj[j];
            newArray[newArray.length] = obj[i];
            for (let j = 0; j < obj.length; j++)
                obj[j] = newArray[j];
        }
    };
    return obj;
} /* End of function CardList */

function ImageElement(basePt, imgElem, rad = undefined, shapePoints = undefined) {
    let img = document.createElement('img');
    img.style.position = 'inherit';
    img.style.top = ''+basePt.y+'px';
    img.style.left = ''+basePt.x+'px';
    if (rad)
        img.style.transform = `rotate(${rad}rad)`;
    if (shapePoints) {
        img.style.clipPath =
            img.style.webkitClipPath =
            `polygon(${to_points_desc(shapePoints)})`;
    }
    img.src = imgElem.src;
    return img;
}

function to_points_desc(points = []) {
    let r = '';
    for (let i = 0; i < points.length; i++) {
        let pt = points[i];
        r = r + `, ${pt.x}px ${pt.y}px`;
    }
    return r.slice(2);
}

function FlipState(parent = (new PlayingCard), touchPt = new Point()) {
    this.touchPt = touchPt;
    this.dragPt = undefined;
    this.edgePt = undefined;
    this.edgeSide = undefined;
    this.midPt = undefined;
    this.isFullShown = false;
    this._parent = parent;
    this.cutLine = undefined;
    this.faceShape = undefined;
    this.backShape = undefined;
    this.dragTo = function (pt = new Point()) {
        let seek_sides =
            [ (pt.y === this.touchPt.y)? (undefined): ((pt.y > this.touchPt.y)? ('top'): ('down')),
              (pt.x === this.touchPt.x)? (undefined): ((pt.x > this.touchPt.x)? ('left'): ('right')) ];
        let link = new Line(this.touchPt.x, this.touchPt.y, pt.x, pt.y),
            sideWay,
            cross;
        for (let i = 0; i < seek_sides.length; i++) {
            let side;
            let seek_side = seek_sides[i];
            let done = true;
            switch (seek_side) {
            case 'top':
                side = this._parent.getTopSide();
                cross = link.seekVCrossOn(side);
                if (cross.sitsOn(side)) {
                    sideWay = 'top';
                }
                else
                    done = false;
                break;
            case 'down':
                side = this._parent.getDownSide();
                cross = link.seekVCrossOn(side);
                if (cross.sitsOn(side)) {
                    sideWay = 'down';
                }
                else
                    done = false;
                break;
            case 'left':
                side = this._parent.getLeftSide();
                cross = link.seekHCrossOn(side);
                if (cross.sitsOn(side)) {
                    sideWay = 'left';
                }
                else
                    done = false;
                break;
            case 'right':
                side = this._parent.getRightSide();
                cross = link.seekHCrossOn(side);
                if (cross.sitsOn(side)) {
                    sideWay = 'right';
                }
                else
                    done = false;
                break;
            default:
                done = false;
                break;
            }
            if (done)
                break;
        }
        let dist = this.touchPt.getDistanceTo(cross);
        if (dist <= this._parent._border_width) {
            this.dragPt = pt;
            this.edgePt = cross;
            this.edgeSide = sideWay;
            this.midPt = midpoint(cross, pt);
            let slope = new Line(pt.x, pt.y, cross.x, cross.y).getPerpendicularSlope();
            let cutLine = new CutLine(this._parent, this.midPt, slope);
            if (JSON.stringify(cutLine) !== '{}')
                this.cutLine = cutLine;
            let faceShape,
                backShape;
            if (cutLine.left && cutLine.down) {
                let s1 = [
                    this._parent.getTopLeftVertex(),
                    this._parent.getTopRightVertex(),
                    this._parent.getDownRightVertex(),
                    cutLine.down,
                    cutLine.left ],
                    s2 = [
                        cutLine.down,
                        cutLine.left,
                        this._parent.getDownLeftVertex()
                    ];
                if (sideWay == 'top' || sideWay == 'right') {
                    faceShape = s1;
                    backShape = s2;
                }
                else if (sideWay == 'down' || sideWay == 'left') {
                    faceShape = s2;
                    backShape = s1;
                }
            }
            else if (cutLine.right && cutLine.down) {
                let s1 = [
                    this._parent.getTopLeftVertex(),
                    this._parent.getTopRightVertex(),
                    cutLine.right,
                    cutLine.down,
                    this._parent.getDownLeftVertex() ],
                    s2 = [
                        cutLine.down,
                        cutLine.right,
                        this._parent.getDownRightVertex()
                    ];
                if (sideWay == 'top' || sideWay == 'left') {
                    faceShape = s1;
                    backShape = s2;
                }
                else if (sideWay == 'down' || sideWay == 'right') {
                    faceShape = s2;
                    backShape = s1;
                }
            }
            else if (cutLine.top && cutLine.left) {
                let s1 = [
                    this._parent.getTopLeftVertex(),
                    cutLine.top,
                    cutLine.left
                ],
                    s2 = [
                        cutLine.top,
                        cutLine.left,
                        this._parent.getDownLeftVertex(),
                        this._parent.getDownRightVertex(),
                        this._parent.getTopRightVertex()
                    ];
                if (sideWay == 'top' || sideWay == 'left') {
                    faceShape = s1;
                    backShape = s2;
                }
                else {
                    faceShape = s2;
                    backShape = s1;
                }
            }
            else if (cutLine.top && cutLine.right) {
                let s1 = [
                    this._parent.getTopRightVertex(),
                    cutLine.top,
                    cutLine.right
                ],
                    s2 = [
                        cutLine.top,
                        cutLine.right,
                        this._parent.getDownRightVertex(),
                        this._parent.getDownLeftVertex(),
                        this._parent.getTopLeftVertex()
                    ];
                if (sideWay == 'top' || sideWay == 'right') {
                    faceShape = s1;
                    backShape = s2;
                }
                else {
                    faceShape = s2;
                    backShape = s1;
                }
            }
            else if (cutLine.top && cutLine.down) {
                let s1 = [
                    this._parent.getTopLeftVertex(),
                    this._parent.getDownLeftVertex(),
                    cutLine.down,
                    cutLine.top
                ],
                    s2 = [
                        cutLine.down,
                        cutLine.top,
                        this._parent.getTopRightVertex(),
                        this._parent.getDownRightVertex()
                    ];
                if (sideWay == 'left' || (sideWay == 'top' && slope < 0) || (sideWay == 'down' && slope > 0)) {
                    faceShape = s1;
                    backShape = s2;
                }
                else {
                    faceShape = s2;
                    backShape = s1;
                }
            }
            else if (cutLine.left && cutLine.right) {
                let s1 = [
                    this._parent.getTopLeftVertex(),
                    this._parent.getTopRightVertex(),
                    cutLine.right,
                    cutLine.left
                ],
                    s2 = [
                        cutLine.right,
                        cutLine.left,
                        this._parent.getDownLeftVertex(),
                        this._parent.getDownRightVertex()
                    ];
                if (sideWay == 'top' || (sideWay == 'left' && slope < 0) || (sideWay == 'right' && slope > 0)) {
                    faceShape = s1;
                    backShape = s2;
                }
                else {
                    faceShape = s2;
                    backShape = s1;
                }
            }
            else if (!cutLine.left && !cutLine.right && !cutLine.top && !cutLine.down) {
                faceShape = [
                    this._parent.getTopLeftVertex(),
                    this._parent.getTopRightVertex(),
                    this._parent.getDownRightVertex(),
                    this._parent.getDownLeftVertex()
                ];
                backShape = [
                    this._parent.getTopLeftVertex(),
                    this._parent.getTopLeftVertex(),
                    this._parent.getTopLeftVertex(),
                    this._parent.getTopLeftVertex()
                ];
            }
            else {
                throw `Cut line not supported ${JSON.stringify(cutLine)}`;
            }
            let offset =
                new Size(-this._parent.getTopLeftVertex().x, -this._parent.getTopLeftVertex().y);
            faceShape = hFlipBy(this._parent.getCenterPoint(), faceShape);
            this.faceShape = moveBy(offset, faceShape);
            this.backShape = moveBy(offset, backShape);
        }
        else {
            //console.log('exceeding');
        }
    }; /* End of this.dragTo */
    this.setIsFullShown = function (value) {
        if (value)
            this.isFullShown = true;
        else
            this.isFullShown = false;
        let faceShape =
            [
                this._parent.getTopLeftVertex(),
                this._parent.getTopRightVertex(),
                this._parent.getDownRightVertex(),
                this._parent.getDownLeftVertex()
            ],
            backShape = [
                this._parent.getTopLeftVertex(),
                this._parent.getTopLeftVertex(),
                this._parent.getTopLeftVertex(),
                this._parent.getTopLeftVertex()
            ];
        let offset =
            new Size(-this._parent.getTopLeftVertex().x, -this._parent.getTopLeftVertex().y);
        faceShape = hFlipBy(this._parent.getCenterPoint(), faceShape);
        this.faceShape = moveBy(offset, faceShape);
        this.backShape = moveBy(offset, backShape);
    };
    this.getFaceArea = function () {
        return get_convex_polygon_area(this.faceShape);
    };
} /* End of function FlipState */

function hFlipBy(pivot = (new Point), shapePoints = []) {
    let r = [];
    for (let i = 0; i < shapePoints.length; i++) {
        let pt = shapePoints[i];
        let dx = pt.x - pivot.x;
        r[i] = new Point(pivot.x-dx, pt.y);
    }
    return r;
}

function vFlipBy(pivot = (new Point), shapePoints = []) {
    let r = [];
    for (let i = 0; i < shapePoints.length; i++) {
        let pt = shapePoints[i];
        let dy = pt.y - pivot.y;
        r[i] = new Point(pt.x, pivot.y-dy);
    }
    return r;
}

function moveBy(offset = (new Size), shapePoints = []) {
    let r = [];
    for (let i = 0; i < shapePoints.length; i++) {
        let pt = shapePoints[i];
        r[i] = new Point(pt.x+offset.w, pt.y+offset.h);
    }
    return r;
}

function contains(playing_card = new PlayingCard(), pt = { x: undefined, y: undefined }) {
    return (playing_card.MinX <= pt.x && pt.x <= playing_card.MaxX
            &&
            playing_card.MinY <= pt.y && pt.y <= playing_card.MaxY);
}

function touch(playing_card, pt) {
    if (playing_card.STATE === playing_card.DISACT && playing_card.contains(pt))
        playing_card.STATE = playing_card.ACTIVA;
}

function midpoint(apt = (new Point), bpt = (new Point)) {
    return new Point((apt.x+bpt.x)/2.0, (apt.y+bpt.y)/2.0);
}

function get_area(a = (new Point), b = (new Point), c = (new Point)) {
    let l1 = new Line(a.x, a.y, b.x, b.y).getDistance(),
        l2 = new Line(a.x, a.y, c.x, c.y).getDistance(),
        l3 = new Line(b.x, b.y, c.x, c.y).getDistance();
    let s = (l1+l2+l3)/2;
    return Math.sqrt(s*(s-l1)*(s-l2)*(s-l3));
}

function get_convex_polygon_area(shapePoints = []) {
    switch (shapePoints.length) {
    case 3:
        return get_area(shapePoints[0], shapePoints[1], shapePoints[2]);
    case 4:
        return get_area(shapePoints[0], shapePoints[1], shapePoints[2])
            + get_area(shapePoints[0], shapePoints[2], shapePoints[3]);
    case 5:
        return get_area(shapePoints[0], shapePoints[1], shapePoints[2])
            + get_area(shapePoints[0], shapePoints[2], shapePoints[3])
            + get_area(shapePoints[0], shapePoints[3], shapePoints[4]);
    default:
        return undefined;
    }
}

function Size(w, h) {
    this.w = w;
    this.h = h;
}

function Point(x, y) {
    this.x = x;
    this.y = y;
    this.within = function (range = (new Range)) {
        return (range && range.contains(this));
    };
    this.getDistanceTo = function(pt = new Point()) {
        let a = (this.x - pt.x);
        let b = (this.y - pt.y);
        return Math.sqrt(a*a + b*b);
    };
    this.getSlopeWith = function(pt = new Point()) {
        let dx = this.x - pt.x;
        let dy = this.y - pt.y;
        return dy / dx;
    };
    this.getDistancePoints = function(distance, slope) {
        if (slope == Infinity || slope == -Infinity) {
            return [new Point(this.x,this.y+distance), new Point(this.x,this.y-distance)];
        }
        else {
            let k = distance * Math.sqrt(1/(1+slope*slope));
            return [
                new Point(
                    this.x + k,
                    this.y + slope * k
                ),
                new Point(
                    this.x - k,
                    this.y - slope * k
                )
            ];
        }
    };
    this.isSameAs = function(pt = undefined) {
        return (pt
                && (pt.x === this.x)
                && (pt.y === this.y));
    };
    this.sitsOn = function(line = undefined) {
        return (line
                && line.contains(this)
               );
    };
} /* End of function Point */

function Range(x, w, y, h) {
    this.x = x;
    this.w = w;
    this.X = x + w;
    this.y = y;
    this.h = h;
    this.Y = y + h;
    this.contains = function(pt = (new Point)) {
        return (pt && this.x <= pt.x && pt.x <= this.X && this.y <= pt.y && pt.y <= this.Y);
    };
}

function Line(x1, y1, x2, y2) {
    this.x1 = x1;
    this.y1 = y1;
    this.x2 = x2;
    this.y2 = y2;
    this.getDistance = function() {
        let a = this.x1 - this.x2;
        let b = this.y1 - this.y2;
        return Math.sqrt(a*a + b*b);
    };
    this.getSlope = function() {
        return (this.y1-this.y2)/(this.x1-this.x2);
    };
    this.getPerpendicularSlope = function() {
        return - (this.x1-this.x2)/(this.y1-this.y2);
    };
    this.isHorizontal = function() {
        return this.y1 === this.y2;
    };
    this.isVertical = function() {
        return this.x1 === this.x2;
    };
    this.tan = (y1-y2) / (x1-x2);
    this.seekVCrossOn = function(hSide = (new Line)) {
        if (!hSide.isHorizontal()) {
            throw `Non-horizontal-line ${hSide} not supported.`;
        }
        else {
            /*
              (hSide.y1-this.y1) / (x-this.x1) == (y1-y2) / (x1-x2)
              (x-this.x1) = (hSide.y1-this.y1)*(x1-x2) / (y1-y2)
            */
            let x = (hSide.y1-this.y1)*(this.x1-this.x2) / (this.y1-this.y2) + this.x1;
            return new Point(x, hSide.y1);
        }
    };
    this.seekHCrossOn = function(vSide = (new Line)) {
        if (!vSide.isVertical()) {
            throw `Non-vertical-line ${vSide} not supported.`;
        }
        else {
            /*
              (y-this.y1) / (vSide.x-this.x1) == (y1-y2) / (x1-x2)
              (y-this.y1) = (vSide.x-this.x1) * (y1-y2)/(x1-x2)
            */
            let y = (vSide.x1-this.x1) * (this.y1-this.y2)/(this.x1-this.x2) + this.y1;
            return new Point(vSide.x1, y);
        }
    };
    this.contains = function(pt = undefined) {
        return (pt
                && (((this.x1 === this.x2)
                     ? ((this.y1 <= pt.y && pt.y <= this.y2)
                        || (this.y2 <= pt.y && pt.y <= this.y1))
                     : (this._f_eq(
                         new Line(this.x1,this.y1,pt.x,pt.y).getSlope(),
                         new Line(pt.x,pt.y,this.x2,this.y2).getSlope())
                        && ((this.x1 <= pt.x && pt.x <= this.x2)
                            || (this.x2 <= pt.x && pt.x <= this.x1))
                        && (((this.y1 <= pt.y && pt.y <= this.y2)
                             || (this.y2 <= pt.y && pt.y <= this.y1)))
                       )
                    || ((this.y1 === this.y2)
                        ? ((this.x1 <= pt.x && pt.x <= this.x2)
                           || (this.x2 <= pt.x && pt.x <= this.x1))
                        : (this._f_eq(
                            new Line(this.x1,this.y1,pt.x,pt.y).getSlope(),
                            new Line(pt.x,pt.y,this.x2,this.y2).getSlope())
                           && ((this.x1 <= pt.x && pt.x <= this.x2)
                               || (this.x2 <= pt.x && pt.x <= this.x1))
                           && (((this.y1 <= pt.y && pt.y <= this.y2)
                                || (this.y2 <= pt.y && pt.y <= this.y1)))
                          ))
                    )));
    };
    this._f_eq = function(f1, f2) {
        return (Math.abs(f1-f2) < 1e-9);
    };
} /* End of function Line */

function CutLine(card = (new PlayingCard), pt = (new Point), slope = (1/0)) {
    /**
     * CutLine is a line crossing the point `pt` with `slope`,
     * then it cuts the `card` on two points.
     */
    this.top = undefined;
    this.left = undefined;
    this.down = undefined;
    this.right = undefined;
    this._perpendicualr_point_from_center = undefined;
    this.anotherCenter = undefined;
    this._p1 = undefined;
    this._p2 = undefined;
    this._f_eq = function(f1, f2) {
        return (Math.abs(f1-f2) < 1e-9);
    };
    /* Configuration */ {
        let p;
        /**
         * Seek cut points.
         */
        if (slope == Infinity || slope == -Infinity) {
            this.top = new Point(pt.x, card.getTopSide().y1);
            this.down = new Point(pt.x, card.getDownSide().y1);
        }
        else if (slope == 0 || slope == -0) {
            this.left = new Point(card.getLeftSide().x1, pt.y);
            this.right = new Point(card.getRightSide().x1, pt.y);
        }
        else {
            let m = Math.sqrt(1/(1+slope*slope));
            let a =
                { x: pt.x + m,
                  y: pt.y + slope * m },
                b =
                { x: pt.x - m,
                  y: pt.y - slope * m };
            let line = new Line(a.x, a.y, b.x, b.y);
            if (line.getSlope() < 0) {
                p = line.seekHCrossOn(card.getLeftSide());
                if (p.sitsOn(card.getLeftSide())) {
                    this.left = p;
                }
                else {
                    p = line.seekVCrossOn(card.getDownSide());
                    if (p.sitsOn(card.getDownSide()))
                        this.down = p;
                }
                p = line.seekVCrossOn(card.getTopSide());
                if (p.sitsOn(card.getTopSide())) {
                    this.top = p;
                }
                else {
                    p = line.seekHCrossOn(card.getRightSide());
                    if (p.sitsOn(card.getRightSide()))
                        this.right = p;
                }
            }
            else {
                p = line.seekVCrossOn(card.getTopSide());
                if (p.sitsOn(card.getTopSide())) {
                    this.top = p;
                }
                else {
                    p = line.seekHCrossOn(card.getLeftSide());
                    if (p.sitsOn(card.getLeftSide()))
                        this.left = p;
                }
                p = line.seekVCrossOn(card.getDownSide());
                if (p.sitsOn(card.getDownSide())) {
                    this.down = p;
                }
                else {
                    p = line.seekHCrossOn(card.getRightSide());
                    if (p.sitsOn(card.getRightSide()))
                        this.right = p;
                }
            }
        }
        // End of cut-points seeking
        /**
         * Seek perpendicular point by card center
         */
        let pcross;
        if (slope == 0 || slope == -0) {
            pcross = midpoint(this.left, this.right);
            this._p1 = new Point(this.left.x, pt.y);
            this._p2 = new Point(this.right.x, pt.y);
        }
        else if (slope == Infinity || slope == -Infinity) {
            pcross = midpoint(this.top, this.down);
            this._p1 = new Point(pt.x, this.top.y);
            this._p2 = new Point(pt.x, this.down.y);
        }
        else {
            let cp = card.getCenterPoint();
            let line,
                p1,
                p2;
            if (this.top) {
                line = new Line(cp.x, cp.y, p.x, p.y);
                if (!p1)
                    p1 = this.top;
                else if (!p2)
                    p2 = this.top;
            }
            if (this.left) {
                line = new Line(cp.x, cp.y, p.x, p.y);
                if (!p1)
                    p1 = this.left;
                else if (!p2)
                    p2 = this.left;
            }
            if (this.right) {
                line = new Line(cp.x, cp.y, p.x, p.y);
                if (!p1)
                    p1 = this.right;
                else if (!p2)
                    p2 = this.right;
            }
            if (this.down) {
                line = new Line(cp.x, cp.y, p.x, p.y);
                if (!p1)
                    p1 = this.down;
                else if (!p2)
                    p2 = this.down;
            }
            if (p1 && p2) {
                let area = get_area(cp, p1, p2);
                let len = new Line(p1.x, p1.y, p2.x, p2.y).getDistance();
                let height = 2 * area / len;
                let [d1, d2] = cp.getDistancePoints(height, -1/slope);
                let [dt1, dt2] = [ d1.getDistanceTo(pt), d2.getDistanceTo(pt) ];
                if (dt1 < dt2)
                    pcross = d1;
                else
                    pcross = d2;
                this._p1 = p1;
                this._p2 = p2;
            }
        }
        this._perpendicular_point_from_center = pcross;
        /* End of perpendicular-cross-point seeking */
        /**
         * Seek another card center
         */
        let line1;
        if (this._perpendicular_point_from_center) {
            let cp = card.getCenterPoint();
            line1 = new Line(
                this._perpendicular_point_from_center.x,
                this._perpendicular_point_from_center.y,
                cp.x,
                cp.y
            );
            let [d1, d2] = this._perpendicular_point_from_center.getDistancePoints(
                line1.getDistance(),
                line1.getSlope()
            );
            let [dt1, dt2] = [ d1.getDistanceTo(cp), d2.getDistanceTo(cp) ];
            if (dt1 < dt2)
                this.anotherCenter = d2;
            else
                this.anotherCenter = d1;
        }
        /* End of another card center */
        /* DEBUG */ {
            if (DEBUG_ELEM) {
                let rleft = THE_CARD_PEEKING_ELEM.getBoundingClientRect().left + THE_CARD_PEEKING_ELEM.clientLeft,
                    rtop = THE_CARD_PEEKING_ELEM.getBoundingClientRect().top + THE_CARD_PEEKING_ELEM.clientTop;
                let ctx = DEBUG_ELEM.getContext('2d');
                let center = card.getCenterPoint();
                ctx.clearRect(0, 0, DEBUG_ELEM.width, DEBUG_ELEM.height);
                ctx.beginPath();
                if (this._p2)
                    ctx.moveTo(this._p2.x, this._p2.y);
                if (this._p1)
                    ctx.lineTo(this._p1.x, this._p1.y);
                ctx.lineTo(center.x, center.y);
                if (this._perpendicular_point_from_center)
                    ctx.lineTo(this._perpendicular_point_from_center.x, this._perpendicular_point_from_center.y);
                ctx.strokeStyle = 'black';
                ctx.stroke();
                ctx.closePath();
                ctx.beginPath();
                if (this._perpendicular_point_from_center)
                    ctx.moveTo(this._perpendicular_point_from_center.x, this._perpendicular_point_from_center.y);
                if (this.anotherCenter)
                    ctx.lineTo(this.anotherCenter.x, this.anotherCenter.y);
                ctx.strokeStyle = '#ff0000';
                ctx.stroke();
            }
        } /* End of debug */
    } /* End of configuration */
} /* End of function CutLine */
