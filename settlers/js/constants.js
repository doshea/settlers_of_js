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
var PROBABILITY_NODE = "<div class='probability circle'><div class='roll'></div><div class='dots'></div>";
var PLAYER_NODE = "<li class='player'><div class='flag'></div><span class='name'></span><div class='resources row'>Hand: <span class='hand-no'>0</span><div class='card'></div></div><div class='dev row'>Dev Cards: <span class='dev-no'>0</span><div class='card'></div></div><div class='army row'>Army: <span class='army-no'>0</span><div class='card'></div></div><div class='vp'>0</div></li>";

var SHEETS = document.styleSheets
var DYNAMIC_STYLESHEET = SHEETS[SHEETS.length-1]

var STAGES = ['setting up', 'planting', 'playing', 'winning']
var PHASES = ['rolling', 'robbing', 'building']

var PLAYER_COLORS = [
                    [255, 0 ,0], //red
                    [0, 0, 255], //blue
                    [255, 255, 0], //yellow
                    [0, 255, 0], //green
                    [0,0,0], //black
                    [255,0,255] //purple
                    ];
var STARTING_SETTLEMENTS = 2;

var COSTS = {
  'road': {'brick': 1, 'wood': 1},
  'settlement': {'brick': 1, 'wood': 1, 'wheat': 1, 'sheep': 1},
  'city': {'wheat': 2, 'ore': 3},
  'dev_card': {'wheat': 1, 'sheep': 1, 'ore': 1}
};




