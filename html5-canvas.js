const FLIP_STATE_ENUM = new FlipStateEnum();
const ACTION_ENUM = new ActionEnum();
const CORNER_RANGE = new Size(20, 20);
const BASE_POSITION_1 = new Point(20, 20);
const BASE_POSITION_2 = new Point(20, 20);
const POKER_SIZE_1 = new Size(215, 300);
const POKER_SIZE_2 = new Size(300, 215);

function PlayingCard(basePoint = new Point(20, 20),
                     cardSize = new Size(215, 300),
                     cornerRange = new Size(20, 20)) {
    this.CARD_RANGE = new Range(basePoint.x, cardSize.w, basePoint.y, cardSize.h);
    this.CORNER_RANGE_1 = new Range(basePoint.x, cornerRange.w, basePoint.y, cornerRange.h);
    this.CORNER_RANGE_2 = new Range(basePoint.x+cardSize.w-cornerRange.w, cornerRange.w, basePoint.y, cornerRange.h);
    this.CORNER_RANGE_3 = new Range(basePoint.x, cornerRange.w, basePoint.y+cardSize.h-cornerRange.h, cornerRange.h);
    this.CORNER_RANGE_4 = new Range(basePoint.x+cardSize.w-cornerRange.w, cornerRange.w, basePoint.y+cardSize.h-cornerRange.h, cornerRange.h);
    this.STATE = FLIP_STATE_ENUM.DISACT;
    this._touchPoint = undefined;
    this._toPoint = undefined;
    this.touch = function (pt = undefined) {
        /* From any state */ {
            this._touchPoint = pt;
            this.STATE = nextState(this.STATE, ACTION_ENUM.TOUCH, (pt&&pt.within(this.CARD_RANGE)));
        }
        return this;
    };
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
