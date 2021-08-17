const CARD_PEEKING_INIT_PROF = new (function(){
    this.NAME = 'CARD_PEEKING_AREA';
    this.WIDTH = '300px';
    this.HEIGHT = '150px';
})();

let THE_CARD_PEEKING_ELEM;

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
        debugview.style.width = '' + area.clientWidth + 'px';
        debugview.style.height = '' + area.clientHeight + 'px';
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
    controlport.addEventListener('touchstart', function(e) {
        if (area.getAttribute('debug') !== 'true')
            e.preventDefault();
        // let pt = new Point(...);
        /// ...
        // if (latestTouched) {
        //     latestTouched.touch(pt);
        // }
        area.render(e);
    });
    controlport.addEventListener('touchmove', function(e) {
        if (area.getAttribute('debug') !== 'true')
            e.preventDefault();
        // let pt = new Point(...);
        // ...
        // if (latestTouched) {
        //     latestTouched.move(pt);
        // }
        area.render(e);
    });
    controlport.addEventListener('touchend', function(e) {
        if (area.getAttribute('debug') !== 'true')
            e.preventDefault();
        // let pt = new Point(...);
        // ...
        // if (latestTouched) {
        //     latestTouched.release();
        // }
        area.render(e);
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
        /*
        let pt = new Point(e.clientX, e.clientY);
        let latestTouched = area.cardList[area.cardList.length-1];
        if (latestTouched) {
            latestTouched.release();
        }
        */
        area.render(e);
    });
    area.appendChild(background);
    area.appendChild(viewport);
    if (area.getAttribute('debug') === 'true') {
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

    this._corner_range = undefined;

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
    };

    this._get_ranges = function() {
        this._outer_border =
            new Range(this._base_point.x,
                      this._face.naturalWidth,
                      this._base_point.y,
                      this._face.naturalHeight);
        let bo_wi = (this._face.naturalWidth > this._face.naturalHeight)
            ? (this._face.naturalWidth * this.BORDER_WIDTH_RATE)
            : (this._face.naturalHeight * this.BORDER_WIDTH_RATE);
        this._inner_border =
            new Range(this._base_point.x + bo_wi,
                      this._face.naturalWidth - bo_wi - bo_wi,
                      this._base_point.y + bo_wi,
                      this._face.naturalHeight - bo_wi - bo_wi);
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

    this.getRange = function() {
        return this._outer_border;
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
            && !toPt.isSameAs(this._flip_state.touchPt)) {
            let [p1, p2] = [this._flip_state.dragPt,
                            this._flip_state.edgePt];
            this._flip_state.dragTo(toPt);
            console.log(this._flip_state.edgeSide);
            if ((p1 && !p1.isSameAs(this._flip_state.dragPt))
                || (p2 && !p2.isSameAs(this._flip_state.edgePt))) {
                this._state =
                    this._parent_state =
                    RENDER_STATE_ENUM.ACTIVA;
            }
        }
    };

    this.release = function() {
        if (this._flip_state) {
            let o = this._flip_state.isFullShown;
            this._flip_state.isFullShown = true;
            if (o === this._flip_state.isFullShown) {
                this._state =
                    this._parent_state =
                    RENDER_STATE_ENUM.ACTIVA;
            }
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
                    let way;
                    let img = new ImageElement(this._base_point, this._back, way);
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

function ImageElement(basePt, imgElem, way) {
    let img = document.createElement('img');
    img.style.position = 'inherit';
    img.style.top = ''+basePt.y+'px';
    img.style.left = ''+basePt.x+'px';
    img.src = imgElem.src;
    return img;
}

function FlipState(parent = (new PlayingCard), touchPt = new Point()) {
    this.touchPt = touchPt;
    this.dragPt = undefined;
    this.edgePt = undefined;
    this.edgeSide = undefined;
    this.isFullShown = false;
    this._parent = parent;
    this.dragTo = function (pt = new Point()) {
        let seek_sides =
            [ (pt.y === touchPt.y)? (undefined): ((pt.y > touchPt.y)? ('top'): ('down')),
              (pt.x === touchPt.x)? (undefined): ((pt.x > touchPt.x)? ('left'): ('right')) ];
        let link = new Line(touchPt.x, touchPt.y, pt.x, pt.y),
            side,
            cross;
        for (let i = 0; i < seek_sides.length; i++) {
            let seek_side = seek_sides[i];
            let done = true;
            switch (seek_side) {
            case 'top':
                side = this._parent.getTopSide();
                cross = link.seekVCrossOn(side);
                if (cross.sitsOn(side)) {
                    this.edgePt = cross;
                    this.edgeSide = 'top';
                }
                else
                    done = false;
                break;
            case 'down':
                side = this._parent.getDownSide();
                cross = link.seekVCrossOn(side);
                if (cross.sitsOn(side)) {
                    this.edgePt = cross;
                    this.edgeSide = 'down';
                }
                else
                    done = false;
                break;
            case 'left':
                side = this._parent.getLeftSide();
                cross = link.seekHCrossOn(side);
                if (cross.sitsOn(side)) {
                    this.edgePt = cross;
                    this.edgeSide = 'left';
                }
                else
                    done = false;
                break;
            case 'right':
                side = this._parent.getRightSide();
                cross = link.seekHCrossOn(side);
                if (cross.sitsOn(side)) {
                    this.edgePt = cross;
                    this.edgeSide = 'right';
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

        let Q1_dist = touchPt.getDistanceTo(pt);
        let Q2_slope = touchPt.getSlopeWith(pt);
    };
} /* End of function FlipState */

function contains(playing_card = new PlayingCard(), pt = { x: undefined, y: undefined }) {
    return (playing_card.MinX <= pt.x && pt.x <= playing_card.MaxX
            &&
            playing_card.MinY <= pt.y && pt.y <= playing_card.MaxY);
}

function touch(playing_card, pt) {
    if (playing_card.STATE === playing_card.DISACT && playing_card.contains(pt))
        playing_card.STATE = playing_card.ACTIVA;
}

function midpoint(apt = { x: 0, y: 5 }, bpt = { x: 5, y: 0 }) {
    return { x: (apt.x+bpt.x)/2.0, y: (apt.y+bpt.y)/2.0 };
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
}

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
            return new Point(x, hSide.y);
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
            return new Point(vSide.x, y);
        }
    };
    this.contains = function(pt = undefined) {
        return (pt
                && (((this.x1 === this.x2)
                     ? ((this.y1 <= pt.y && pt.y <= this.y2) || (this.y2 <= pt.y && pt.y <= this.y1))
                     : (undefined/*TODO: a point sitting on a slope.*/))
                    || ((this.y1 === this.y2)
                        ? ((this.x1 <= pt.x && pt.x <= this.x2) || (this.x2 <= pt.x && pt.x <= this.x1))
                        : (undefined/*TODO: a point sitting on a slope.*/)))
               );
    };
}
