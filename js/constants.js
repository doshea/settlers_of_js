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
var HEX_POSITIONS = 
  [
    {'pos': 0, 'rel_row': -1, 'rel_col': -1},
    {'pos': 1, 'rel_row': -2, 'rel_col': 0},
    {'pos': 2, 'rel_row': -1, 'rel_col': +1},
    {'pos': 3, 'rel_row': 1, 'rel_col': +1},
    {'pos': 4, 'rel_row': 2, 'rel_col': 0},
    {'pos': 5, 'rel_row': 1, 'rel_col': -1}
  ];

function offset_pos(i, offset){
  return (i + offset)%6;
}
function opp_pos(i){
  return offset_pos(i, 3)
}
function next_pos(i){
  return offset_pos(i, 1)
}
function prev_pos(i){
  return offset_pos(i, 5)
}

var MAX_ROW_LENGTH = _.max(_.pluck(HEX_ROWS, 'hexes'))
var COLUMNS = (MAX_ROW_LENGTH * 2) - 1

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

var RESOURCES = ['wood', 'brick', 'wheat', 'ore', 'sheep']
var HEX_COUNTS = {
                  'brick': 3,
                  'ore': 3,
                  'wood': 4,
                  'wheat': 4,
                  'sheep': 4,
                  'desert': 1
                  };
var HEX_DECK = [];
_.each(HEX_COUNTS, function(val, key){
  for(i=0; i<val; i++){
    HEX_DECK.push(key);
  }
})

var STARTING_PLAYERS = 2;
var RESOURCE_MAX = 19;

var MAX_HAND_SIZE = 7;

var HEX_NODE = "<div class='hex'></div>";
var PROBABILITY_NODE = "<div class='probability circle'><div class='roll'></div><div class='dots'></div>"

var SHEETS = document.styleSheets
var DYNAMIC_STYLESHEET = SHEETS[SHEETS.length-1]