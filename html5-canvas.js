const CARD_PEEKING_INIT_PROF = new (function(){
    this.NAME = 'CARD_PEEKING_AREA';
    this.WIDTH = '300px';
    this.HEIGHT = '150px';
})();

let THE_CARD_PEEKING_ELEM;

const RENDER_STATE_ENUM = new RenderStateEnum();
const FLIP_STATE_ENUM = new FlipStateEnum();
const ACTION_ENUM = new ActionEnum();
const CORNER_RANGE = new Size(20, 20);
const BASE_POSITION_1 = new Point(20, 20);
const BASE_POSITION_2 = new Point(20, 20);
const POKER_SIZE_1 = new Size(215, 300);
const POKER_SIZE_2 = new Size(300, 215);

/* Initialization */
//document.addEventListener('DOMContentLoaded', initCardPeeking);

function initCardPeeking () {
    const elem = new CardPeekingElement();
    let card_1 = new PlayingCard();
    card_1.setBasePt(new Point(20, 20));
    card_1.setSrc('face1.png', 'back1.png');
    let card_2 = new PlayingCard();
    card_2.setBasePt(new Point(150, 20));
    card_2.setSrc('face2.png', 'back2.png');
    elem.cardList.push(card_1);
    elem.cardList.push(card_2);
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
    area.cardList.push = (function(_super){
        return function() {
            for (const k in arguments)
                arguments[k].setParent(area);
            return _super.apply(this, arguments);
        };
    })(area.cardList.push);
    area.render = function() {
        if (area._state === RENDER_STATE_ENUM.ACTIVA) {
            console.log('area reander!');
            area._state = RENDER_STATE_ENUM.DISACT;
        }
    };
    if (!area.style.width)
        area.style.width = CARD_PEEKING_INIT_PROF.WIDTH;
    if (!area.style.height)
        area.style.height = CARD_PEEKING_INIT_PROF.HEIGHT;
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
        debugview.render = function() {
            if (debugview._state === RENDER_STATE_ENUM.ACTIVA) {
                console.log('debug reander!');
                debugview._state = RENDER_STATE_ENUM.DISACT;
            }
        };
        debugview.addEventListener('touchstart', function(e) {
            e.preventDefault();
            this.render();
        });
        debugview.addEventListener('touchmove', function(e) {
            e.preventDefault();
            this.render();
        });
        debugview.addEventListener('touchend', function(e) {
            e.preventDefault();
            this.render();
        });
        debugview.addEventListener('mousedown', function(e) {
            e.preventDefault();
            this.render();
        });
        debugview.addEventListener('mousemove', function(e) {
            e.preventDefault();
            this.render();
        });
        debugview.addEventListener('mouseup', function(e) {
            e.preventDefault();
            this.render();
        });
    }
    const controlport = document.createElement('div');
    controlport.classList.add('control-port');
    controlport.style.position = 'absolute';
    controlport.style.width = '' + area.clientWidth + 'px';
    controlport.style.height = '' + area.clientHeight + 'px';
    controlport.addEventListener('touchstart', function(e) {
        if (area.getAttribute('debug') !== 'true')
            e.preventDefault();
        area.render();
    });
    controlport.addEventListener('touchmove', function(e) {
        if (area.getAttribute('debug') !== 'true')
            e.preventDefault();
        area.render();
    });
    controlport.addEventListener('touchend', function(e) {
        if (area.getAttribute('debug') !== 'true')
            e.preventDefault();
        area.render();
    });
    controlport.addEventListener('mousedown', function(e) {
        if (area.getAttribute('debug') !== 'true')
            e.preventDefault();
        let pt = new Point(e.ClientX, e.clientY);
        let latestTouched;
        let i = 0;
        for (i = area.cardList.length-1; i > -1; i--) {
            let cr = area.cardList[i];
            if (cr.isTouchable(pt)) {
                latestTouched = cr;
                break;
            }
        }
        if (latestTouched) {
            area.cardList.bringToLatest(i);
            latestTouched.touch(pt);
        }
        area.render();
   });
    controlport.addEventListener('mousemove', function(e) {
        if (area.getAttribute('debug') !== 'true')
            e.preventDefault();
        area.render();
    });
    controlport.addEventListener('mouseup', function(e) {
        if (area.getAttribute('debug') !== 'true')
            e.preventDefault();
        area.render();
    });
    area.appendChild(viewport);
    if (area.getAttribute('debug') === 'true') {
        debugview.appendChild(controlport);
        area.appendChild(debugview);
    }
    else
        area.appendChild(controlport);
    return area;
} /* End of function CardPeekingElement */

function PlayingCard(basePoint = new Point(20, 20),
                     cardSize = new Size(215, 300),
                     cornerRange = new Size(20, 20)) {

    this._outer_border = new Range();
    this._inner_border = new Range();

    this.BORDER_WIDTH_RATE = 0.1;

    this._base_point = new Point();
    this._touch_point = new Point();

    this._parent = undefined;

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
                base.configure(base._base_point, face, back);
            }
        };
        back.onload = function() {
            backloaded = true;
            if (faceloaded) {
                if (face.naturalWidth != back.naturalWidth
                    || face.naturalHeight != back.naturalHeight)
                    console.warn(`Factors not match: "${faceSrc}" and "${backSrc}"`);
                base.configure(base._base_point, face, back);
            }
        };
        face.src = faceSrc;
        back.src = backSrc;
    };

    this.configure = function (basePt, faceElem, backElem) {
        this._face = faceElem;
        this._back = backElem;
        let bo_wi = (faceElem.naturalWidth > faceElem.naturalHeight)
            ? (faceElem.naturalWidth * this.BORDER_WIDTH_RATE)
            : (faceElem.naturalHeight * this.BORDER_WIDTH_RATE);
        this._outer_border.x = basePt.x;
        this._outer_border.w = faceElem.naturalWidth;
        this._outer_border.X = basePt.x + faceElem.naturalWidth;
        this._outer_border.y = basePt.y;
        this._outer_border.h = faceElem.naturalHeight;
        this._outer_border.Y = basePt.y + faceElem.naturalHeight;
        this._inner_border.x = basePt.x + bo_wi;
        this._inner_border.w = faceElem.naturalWidth - bo_wi - bo_wi;
        this._inner_border.X = basePt.x + faceElem.naturalWidth - bo_wi;
        this._inner_border.y = basePt.y + bo_wi;
        this._inner_border.h = faceElem.naturalHeight - bo_wi - bo_wi;
        this._inner_border.Y = basePt.y + faceElem.naturalHeight - bo_wi;
    };

    this.isTouchable = function(pt = new Point()) {
        return (pt.within(this._outer_border)
                && !pt.within(this._inner_border));
    };

    this.touch = function(pt = new Point()) {
        if (this.isTouchable(pt)) {
            this._touch_point = pt;
            this._parent._state = RENDER_STATE_ENUM.ACTIVA;
        }
    };

    this.CARD_RANGE = new Range(basePoint.x, cardSize.w, basePoint.y, cardSize.h);
    this.CORNER_RANGE_1 = new Range(basePoint.x, cornerRange.w, basePoint.y, cornerRange.h);
    this.CORNER_RANGE_2 = new Range(basePoint.x+cardSize.w-cornerRange.w, cornerRange.w, basePoint.y, cornerRange.h);
    this.CORNER_RANGE_3 = new Range(basePoint.x, cornerRange.w, basePoint.y+cardSize.h-cornerRange.h, cornerRange.h);
    this.CORNER_RANGE_4 = new Range(basePoint.x+cardSize.w-cornerRange.w, cornerRange.w, basePoint.y+cardSize.h-cornerRange.h, cornerRange.h);
    this.STATE = FLIP_STATE_ENUM.DISACT;

    this._touchPoint = undefined;
    this._toPoint = undefined;
    //this.touch = function (pt = undefined) {
    //    /* From any state */ {
    //        this._touchPoint = pt;
    //        this.STATE = nextState(this.STATE, ACTION_ENUM.TOUCH, (pt&&pt.within(this.CARD_RANGE)));
    //    }
    //    return this;
    //};
    this.move = function (toPt = undefined) {
        /* From any state */ {
            this.STATE = nextState(this.STATE, ACTION_ENUM.MOVE, (pt&&pt.within(this.CARD_RANGE)));
            if (this.STATE === FLIP_STATE_ENUM.FLIPPI) {
                this._toPoint = toPt;
            }
        };
        return this;
    };
    this.release = function() {
        /* From any state */ {
            this.STATE = nextState(this.STATE, ACTION_ENUM.RELEASE);
            if (this.STATE === FLIP_STATE_ENUM.RELEAS) {
                // TODO: put animation player
            }
        };
        return this;
    };
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

function ActionEnum() {
    this.TOUC = this.TOUCH = '_touch';
    this.MOVE = '_move';
    this.RELE = this.RELEASE = '_release';
}

function FlipStateEnum() {
    this.DISACT = '_disactivated';
    this.ACTIVA = '_activated';
    this.FLIPPI = '_flipping';
    this.RELEAS = '_released';
}

function RenderStateEnum() {
    this.ACTIVA = '_activated';
    this.DISACT = '_disactivated';
}

function nextState(oldState = undefined, action = undefined, actionWithin = true) {
    if (oldState === FLIP_STATE_ENUM.DISACT && action === ACTION_ENUM.TOUC && actionWithin)
        return FLIP_STATE_ENUM.ACTIVA;
    else if (oldState === FLIP_STATE_ENUM.DISACT && action === ACTION_ENUM.TOUC)
        return FLIP_STATE_ENUM.DISACT;
    else if (oldState === FLIP_STATE_ENUM.DISACT && action === ACTION_ENUM.MOVE)
        return FLIP_STATE_ENUM.DISACT;
    else if (oldState === FLIP_STATE_ENUM.DISACT && action === ACTION_ENUM.RELE)
        return FLIP_STATE_ENUM.DISACT;
    else if (oldState === FLIP_STATE_ENUM.ACTIVA && action === ACTION_ENUM.TOUC && actionWithin)
        return FLIP_STATE_ENUM.ACTIVA;
    else if (oldState === FLIP_STATE_ENUM.ACTIVA && action === ACTION_ENUM.TOUC)
        return FLIP_STATE_ENUM.DISACT;
    else if (oldState === FLIP_STATE_ENUM.ACTIVA && action === ACTION_ENUM.MOVE)
        return FLIP_STATE_ENUM.FLIPPI;
    else if (oldState === FLIP_STATE_ENUM.ACTIVA && action === ACTION_ENUM.RELE)
        return FLIP_STATE_ENUM.RELEAS;
    else if (oldState === FLIP_STATE_ENUM.FLIPPI && action === ACTION_ENUM.TOUC && actionWithin)
        return FLIP_STATE_ENUM.FLIPPI;
    else if (oldState === FLIP_STATE_ENUM.FLIPPI && action === ACTION_ENUM.TOUC)
        return FLIP_STATE_ENUM.RELEAS;
    else if (oldState === FLIP_STATE_ENUM.FLIPPI && action === ACTION_ENUM.MOVE)
        return FLIP_STATE_ENUM.FLIPPI;
    else if (oldState === FLIP_STATE_ENUM.FLIPPI && action === ACTION_ENUM.RELE)
        return FLIP_STATE_ENUM.RELEAS;
    else if (oldState === FLIP_STATE_ENUM.RELEAS && action === ACTION_ENUM.TOUC && actionWithin)
        return FLIP_STATE_ENUM.ACTIVA;
    else if (oldState === FLIP_STATE_ENUM.RELEAS && action === ACTION_ENUM.TOUC)
        return FLIP_STATE_ENUM.RELEAS;
    else if (oldState === FLIP_STATE_ENUM.RELEAS && action === ACTION_ENUM.MOVE)
        return FLIP_STATE_ENUM.FLIPPI;
    else if (oldState === FLIP_STATE_ENUM.RELEAS && action === ACTION_ENUM.RELE)
        return FLIP_STATE_ENUM.RELEAS;
    else
        return undefined;
}

function Size(w, h) {
    this.w = w;
    this.h = h;
}

function Point(x, y) {
    this.x = x;
    this.y = y;
    this.isVertex = false;
    this.within = function (range = undefined) {
        return (x && range && range.x <= x && x <= range.X && range.y <= y && y <= range.Y);
    };
}

function Vertex(x, y) {
    var p =  new Point(x, y);
    p.isVertex = true;
    return p;
}

function Range(x, w, y, h) {
    this.x = x;
    this.w = w;
    this.X = x + w;
    this.y = y;
    this.h = h;
    this.Y = y + h;
}
