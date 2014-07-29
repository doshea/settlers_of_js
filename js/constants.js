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
var HEX_PROBABILITIES = [
                {roll: 2, dots: 1, count: 1},
                {roll: 3, dots: 2, count: 2},
                {roll: 4, dots: 3, count: 2},
                {roll: 5, dots: 4, count: 2},
                {roll: 6, dots: 5, count: 2},
                {roll: 8, dots: 5, count: 2},
                {roll: 9, dots: 4, count: 2},
                {roll: 10, dots: 3, count: 2},
                {roll: 11, dots: 2, count: 2},
                {roll: 12, dots: 1, count: 1},
              ]
var HEX_CLASSES = 'brick ore wood wheat sheep desert sea'
var PROBABILITY_DECK = []
_.each(HEX_PROBABILITIES, function(prob){
  for(i=0; i<prob['count']; i++){
    PROBABILITY_DECK.push({'roll': prob['roll'], 'dots': prob['dots']});
  }
})

var HEX_WIDTH_EM = 9.375;
var HEX_SPACING = 0.5;
var RESOURCES = ['wood', 'brick', 'wheat', 'ore', 'sheep']
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

var HEXAGON_NODE = "<div class='hex'><div class='hex-1 h'><div class='hex-2 h'><div class='hex-3 h'><div class='hex-image h'></div></div></div></div></div></div>"
var PROBABILITY_NODE = "<div class='probability circle'><div class='roll'></div><div class='dots'></div>"