var HEX_ROWS = [
                {'hexes': 1, 'landlocked': false},
                {'hexes': 2, 'landlocked': false},
                {'hexes': 3, 'landlocked': false},
                {'hexes': 4, 'landlocked': false},
                {'hexes': 3, 'landlocked': true},
                {'hexes': 4, 'landlocked': false},
                {'hexes': 3, 'landlocked': true},
                {'hexes': 4, 'landlocked': false},
                {'hexes': 3, 'landlocked': true},
                {'hexes': 4, 'landlocked': false},
                {'hexes': 3, 'landlocked': false},
                {'hexes': 2, 'landlocked': false},
                {'hexes': 1, 'landlocked': false}
              ]

var HEX_WIDTH_EM = 9.375;
var HEX_SPACING = 0.5;
var HEX_VALUES = {
                  'brick': 3,
                  'ore': 3,
                  'wood': 4,
                  'wheat': 4,
                  'sheep': 4,
                  'desert': 1
                  };
var HEX_DECK = [];
_.each(HEX_VALUES, function(val, key){
  for(i=0; i<val; i++){
    HEX_DECK.push(key);
  }
})

var STARTING_PLAYERS = 2;
var RESOURCE_MAX = 19;

var MAX_HAND_SIZE = 7;

var HEXAGON_NODE = "<div class='hex'><div class='hex-1 h'><div class='hex-2 h'><div class='hex-3 h'><div class='hex-image h'></div></div></div></div></div>"