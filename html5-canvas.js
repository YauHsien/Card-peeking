const base_corner = { x: 20, y: 20 };
const poker_size = { w: 215, h: 300 };
const corner_range = { w: 20, h: 20 };

function PlayingCard(
    baseCornerPt = { x: 0, y: 0},
    cardSize = { w: 215, h: 300 },
    cornerRange = { w: 20, h: 20 }
) {
    const _disactivated = '_disactivated', _activated = '_activated', _flipping = '_flipping', _released = '_relased';
    const _flip_state = [_disactivated, _activated, _flipping, _released];
    var obj = {
        DISACT: _disactivated,
        ACTIVA: _activated,
        FLIPPI: _flipping,
        RELEAS: _released,
        //-------------------
        BaseCorner: baseCornerPt,
        CardSize: cardSize,
        CornerRange: cornerRange,
        MaxX: baseCornerPt.x + cardSize.w -1,
        MaxY: baseCornerPt.y + cardSize.h -1,
        MinX: baseCornerPt.x,
        MinY: baseCornerPt.y,
        STATE: _disactivated,
        contains: function(pt = { x: baseCornerPt.y-1, y: baseCornerPt.y-1 }) { return contains(obj, pt); },
        isActivated: function() { return obj.STATE !== obj.DISACT; },
        touch: function(pt = { x: baseCornerPt.x-1, y: baseCornerPt.y-1 }) { touch(obj, pt); },
    };
    return obj;
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
