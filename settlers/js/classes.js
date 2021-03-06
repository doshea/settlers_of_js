// Generated by CoffeeScript 1.7.1
(function() {
  var Building, Hex, Ownable, Player, Road,
    __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  window.game = {
    stage: STAGES[0],
    phase: null,
    players: [],
    dev_cards: [],
    hexes: [],
    roads: [],
    planting_round: null,
    planting_order: [],
    buildings: [],
    rows: 0,
    active_player: null,
    rolling: false,
    add_player: function() {
      var new_player;
      return new_player = new Player;
    },
    find_player: function(id) {
      return this.players[parseInt(id)];
    },
    add_row: function(row) {
      var col, new_hex, new_row, row_pos, _i, _ref, _results;
      this.rows += 1;
      new_row = $('<div>').addClass('hex-row').appendTo('#board');
      _results = [];
      for (row_pos = _i = 1, _ref = row['hexes']; 1 <= _ref ? _i <= _ref : _i >= _ref; row_pos = 1 <= _ref ? ++_i : --_i) {
        col = MAX_ROW_LENGTH - row['hexes'] + 1 + (2 * (row_pos - 1));
        new_hex = new Hex(new_row, this.rows, col);
        if (!row['landlocked']) {
          if ((row_pos === 1) || (row_pos === row['hexes'])) {
            _results.push(new_hex.set_type('sea'));
          } else {
            _results.push(void 0);
          }
        } else {
          _results.push(void 0);
        }
      }
      return _results;
    },
    find_hex: function(id) {
      return this.hexes[parseInt(id)];
    },
    find_road: function(id) {
      return this.roads[parseInt(id)];
    },
    find_building: function(id) {
      return this.buildings[parseInt(id)];
    },
    find_hex_rc: function(row, col) {
      var matching;
      matching = _.filter(this.hexes, function(hex) {
        return (hex.row === row) && (hex.col === col);
      });
      return matching[0];
    },
    non_sea_hexes: function() {
      var non_sea_hexes;
      return non_sea_hexes = _.filter(game.hexes, function(hex) {
        return hex.type !== 'sea';
      });
    },
    populate_hexes: function() {
      var hex, shuffled_hexes, _i, _len, _ref;
      shuffled_hexes = _.shuffle(HEX_DECK);
      _ref = game.hexes;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        hex = _ref[_i];
        if (hex.type !== 'sea') {
          hex.set_type(shuffled_hexes.pop());
        }
        hex.associate_hexes();
      }
      this.populate_probabilities();
      return log.msg('Populated hexes.');
    },
    populate_probabilities: function() {
      var drawn_prob, hex, shuffled_probs, _i, _len, _ref, _ref1;
      shuffled_probs = _.shuffle(PROBABILITY_DECK);
      _ref = game.hexes;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        hex = _ref[_i];
        if ((_ref1 = hex.type) !== 'sea' && _ref1 !== 'desert') {
          drawn_prob = shuffled_probs.pop();
          hex.set_roll(drawn_prob['roll']);
          hex.set_dots(drawn_prob['dots']);
        }
      }
      return stats.calculate_yields();
    },
    populate_roads: function() {
      var hex, _i, _len, _ref, _results;
      _ref = game.hexes;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        hex = _ref[_i];
        _results.push(hex.surround_with_roads());
      }
      return _results;
    },
    populate_buildings: function() {
      var hex, i, _i, _len, _ref, _results;
      _ref = game.non_sea_hexes();
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        hex = _ref[_i];
        _results.push((function() {
          var _j, _results1;
          _results1 = [];
          for (i = _j = 0; _j <= 5; i = ++_j) {
            _results1.push(hex.gain_new_building(i));
          }
          return _results1;
        })());
      }
      return _results;
    },
    finish_setup: function() {
      var player_copy;
      this.stage = STAGES[1];
      $('.setup').remove();
      $('#setup, #planting').toggleClass('inactive');
      $('.building').addClass('plantable');
      player_copy = game.players.slice(0);
      this.planting_order = game.players.concat(player_copy.reverse());
      this.planting_round = 1;
      return this.next_planter();
    },
    next_planter: function() {
      var current, next;
      if (this.planting_order.length === 0) {
        return this.finish_planting();
      } else {
        current = this.active_player;
        next = this.planting_order.shift();
        if (current === next) {
          this.planting_round += 1;
        }
        next.activate();
        $('.road').removeClass('plantable');
        return $('.building.unowned').addClass('plantable');
      }
    },
    finish_planting: function() {
      $('.plantable').removeClass('plantable');
      $('.planting').remove();
      this.planting_round = null;
      this.stage = STAGES[2];
      this.phase = PHASES[0];
      return $('#planting, #dice').toggleClass('inactive');
    },
    finish_rolling: function() {
      switch (dice.roll) {
        case 7:
          return this.phase = PHASES[1];
        default:
          return this.phase = PHASES[2];
      }
    }
  };

  Player = (function() {
    Player.MAX_PLAYERS = 6;

    function Player() {
      var _ref;
      if (!(game.players.length >= this.constructor.MAX_PLAYERS)) {
        this.id = game.players.length;
        game.players.push(this);
        this.name = "Player " + (this.id + 1);
        this.resources = {
          brick: 0,
          ore: 0,
          wheat: 0,
          wood: 0,
          sheep: 0
        };
        this.buildings = [];
        this.roads = [];
        this.army = 0;
        this.unplaced_settlements = STARTING_SETTLEMENTS;
        this.unplaced_roads = STARTING_SETTLEMENTS;
        _ref = PLAYER_COLORS[this.id], this.red = _ref[0], this.green = _ref[1], this.blue = _ref[2];
        this.make_css_rules();
        this.dom_rep = this.build();
        this.victory_points = 0;
        log.msg("" + (this.name_span()) + " has joined the game.");
      } else {
        alert('Max Players reached');
      }
    }

    Player.prototype.rgb = function() {
      return "rgb(" + this.red + "," + this.green + "," + this.blue + ")";
    };

    Player.prototype.make_css_rules = function() {
      DYNAMIC_STYLESHEET.insertRule(".player-" + this.id + "-bg { background: " + (this.rgb()) + " }", 0);
      return DYNAMIC_STYLESHEET.insertRule(".player-" + this.id + "-color { color: " + (this.rgb()) + " }", 0);
    };

    Player.prototype.build = function() {
      var tab;
      tab = $(PLAYER_NODE).addClass("player player-" + this.id);
      tab.find('.flag').data('player-id', this.id).addClass("player-" + this.id + "-bg");
      tab.find('.name').text(this.name);
      return tab.appendTo($('#players'));
    };

    Player.prototype.activate = function() {
      if (game.active_player) {
        game.active_player.deactivate();
      }
      game.active_player = this;
      this.dom_rep.addClass('active');
      return this;
    };

    Player.prototype.deactivate = function() {
      return this.dom_rep.removeClass('active');
    };

    Player.prototype.name_span = function() {
      return "<span class='player-" + this.id + "-color'>" + this.name + "</span>";
    };

    Player.prototype.gain_resource = function(resource_str) {
      var hand_size, key, new_card, resources, value, _ref;
      if (this.resources[resource_str] !== void 0) {
        this.resources[resource_str] += 1;
        hand_size = 0;
        _ref = this.resources;
        for (key in _ref) {
          value = _ref[key];
          hand_size += value;
        }
        new_card = $('<div>').addClass('card');
        resources = this.dom_rep.find('.resources');
        resources.append(new_card).find('.hand-no').text(hand_size);
        if (hand_size > 7) {
          return resources.addClass('over-max');
        } else {
          return resources.removeClass('over-max');
        }
      }
    };

    Player.prototype.move_robber = function() {
      return console.log('does nothign yet');
    };

    Player.prototype.play_knight = function() {
      var army, new_card;
      this.move_robber();
      this.army += 1;
      new_card = $('<div>').addClass('card');
      army = this.dom_rep.find('.army');
      return army.append(new_card).find('span').text(this.army);
    };

    Player.prototype.buy = function() {};

    return Player;

  })();

  Hex = (function() {
    Hex.POSITIONS = [
      {
        'pos': 0,
        'rel_row': -1,
        'rel_col': -1
      }, {
        'pos': 1,
        'rel_row': -2,
        'rel_col': 0
      }, {
        'pos': 2,
        'rel_row': -1,
        'rel_col': +1
      }, {
        'pos': 3,
        'rel_row': 1,
        'rel_col': +1
      }, {
        'pos': 4,
        'rel_row': 2,
        'rel_col': 0
      }, {
        'pos': 5,
        'rel_row': 1,
        'rel_col': -1
      }
    ];

    function Hex(dom_row, row, col) {
      this.id = game.hexes.length;
      game.hexes.push(this);
      this.row = row;
      this.col = col;
      this.type = this.roll = this.dots = null;
      this.dom_hex = this.build(dom_row);
      this.dom_prob = null;
      this.adj_hexes = new Array(6);
      this.roads = new Array(6);
      this.buildings = new Array(6);
      this.robbed = false;
    }

    Hex.prototype.build = function(row) {
      var hex;
      return hex = $(HEX_NODE).data('hex-id', this.id).appendTo(row);
    };

    Hex.prototype.clear = function() {
      this.type = this.roll = this.dots = null;
      return this;
    };

    Hex.prototype.set_type = function(new_type) {
      this.type = new_type;
      if (this.type === 'desert') {
        this.gain_robber();
      }
      this.dom_hex.removeClass(HEX_CLASSES).addClass(new_type);
      this.add_remove_probability();
      return this;
    };

    Hex.prototype.add_remove_probability = function() {
      var _ref;
      if ((_ref = this.type) === 'sea' || _ref === 'desert') {
        if (this.dom_prob) {
          this.dom_prob.remove();
          this.dom_prob = null;
        }
      } else if (this.dom_hex.find('.probability').length === 0) {
        this.dom_hex.append(PROBABILITY_NODE);
        this.dom_prob = this.dom_hex.find('.probability');
      }
      return this;
    };

    Hex.prototype.set_dots = function(new_dots) {
      var dot_string, i, _i;
      this.dots = new_dots;
      dot_string = '';
      for (i = _i = 1; 1 <= new_dots ? _i <= new_dots : _i >= new_dots; i = 1 <= new_dots ? ++_i : --_i) {
        dot_string = dot_string + '&bull;';
      }
      this.dom_hex.find('.dots').html(dot_string);
      return this;
    };

    Hex.prototype.set_roll = function(new_roll) {
      this.roll = new_roll;
      this.dom_hex.find('.roll').text(this.roll);
      return this;
    };

    Hex.prototype.gain_robber = function() {
      this.robbed = true;
      $('#robber-container').appendTo(this.dom_hex);
      return this;
    };

    Hex.prototype.gain_road = function(pos) {
      var neighbor, new_road;
      if (!this.roads[pos]) {
        new_road = new Road(this, pos);
        this.roads[pos] = new_road;
        neighbor = this.adj_hexes[pos];
        if (neighbor) {
          neighbor.roads[opp_pos(pos)] = new_road;
        }
      }
      return this;
    };

    Hex.prototype.gain_new_building = function(pos) {
      var i, neighbor, neighbors, new_building, new_pos, triad, triad_nonsea, _i, _len;
      if (!this.buildings[pos]) {
        triad = _.compact([this, this.adj_hexes[pos], this.adj_hexes[next_pos(pos)]]);
        triad_nonsea = _.map(triad, function(hex) {
          return hex.type !== 'sea';
        });
        if (__indexOf.call(triad_nonsea, true) >= 0) {
          new_building = new Building(this, pos);
          this.buildings[pos] = new_building;
          new_building.hexes[opp_pos(pos)] = this;
          neighbors = [this.adj_hexes[pos], this.adj_hexes[next_pos(pos)]];
          for (i = _i = 0, _len = neighbors.length; _i < _len; i = ++_i) {
            neighbor = neighbors[i];
            if (neighbor) {
              new_pos = offset_pos(pos, 2 * (i + 1));
              neighbor.gain_existing_building(new_building, new_pos);
            }
          }
          new_building.associate_roads();
        }
      }
      return this;
    };

    Hex.prototype.gain_existing_building = function(building, pos) {
      if (!this.buildings[pos]) {
        this.buildings[pos] = building;
        building.hexes[opp_pos(pos)] = this;
      }
      return this;
    };

    Hex.prototype.associate_hexes = function() {
      var pos, position, rel_col, rel_row, _i, _len, _ref, _results;
      _results = [];
      for (_i = 0, _len = HEX_POSITIONS.length; _i < _len; _i++) {
        position = HEX_POSITIONS[_i];
        _ref = [position['pos'], position['rel_row'], position['rel_col']], pos = _ref[0], rel_row = _ref[1], rel_col = _ref[2];
        if (!this.adj_hexes[pos]) {
          this.adj_hexes[pos] = game.find_hex_rc(this.row + rel_row, this.col + rel_col);
          if (this.adj_hexes[pos]) {
            _results.push(this.adj_hexes[pos].adj_hexes[opp_pos(pos)] = this);
          } else {
            _results.push(void 0);
          }
        } else {
          _results.push(void 0);
        }
      }
      return _results;
    };

    Hex.prototype.surround_with_roads = function() {
      var hex, i, _i, _len, _ref, _results;
      _ref = this.adj_hexes;
      _results = [];
      for (i = _i = 0, _len = _ref.length; _i < _len; i = ++_i) {
        hex = _ref[i];
        if (hex) {
          if (!this.roads[i]) {
            if ((hex.type !== 'sea') || (this.type !== 'sea')) {
              _results.push(this.gain_road(i));
            } else {
              _results.push(void 0);
            }
          } else {
            _results.push(void 0);
          }
        } else {
          _results.push(void 0);
        }
      }
      return _results;
    };

    Hex.prototype.surround_with_buildings = function() {
      var pos, we_three_hexes, _i, _results;
      _results = [];
      for (pos = _i = 0; _i <= 5; pos = ++_i) {
        if (!this.buildings[pos]) {
          _results.push(we_three_hexes = [this, this.adj_hexes[pos], this.adj_hexes[next_pos(pos)]]);
        } else {
          _results.push(void 0);
        }
      }
      return _results;
    };

    return Hex;

  })();

  Ownable = (function() {
    function Ownable(hex, pos, collection) {
      this.hex = hex;
      this.pos = pos;
      this.player = null;
      this.id = collection.length;
      collection.push(this);
    }

    Ownable.prototype.owned_by = function(player) {
      if (!this.player) {
        this.player = player;
        return this.dom_rep.addClass("player-" + player.id + "-bg player-" + player.id + "-color owned").removeClass('unowned');
      }
    };

    return Ownable;

  })();

  Road = (function(_super) {
    __extends(Road, _super);

    function Road(hex, pos) {
      Road.__super__.constructor.call(this, hex, pos, game.roads);
      this.buildings = new Array(6);
      this.hexes = [hex, hex.adj_hexes[pos]];
      this.dom_rep = this.build();
    }

    Road.prototype.build = function() {
      var new_road;
      return new_road = $('<div>').addClass("road pos-" + this.pos + " unowned").appendTo(this.hex.dom_hex).data('id', this.id);
    };

    Road.prototype.owned_by = function(player) {
      if (!this.player) {
        Road.__super__.owned_by.call(this, player);
        return player.roads.push(this);
      }
    };

    return Road;

  })(Ownable);

  Building = (function(_super) {
    __extends(Building, _super);

    function Building(hex, pos) {
      Building.__super__.constructor.call(this, hex, pos, game.buildings);
      this.hexes = new Array(6);
      this.roads = new Array(2);
      this.upgrade_level = 0;
      this.dom_rep = this.build();
    }

    Building.prototype.associate_roads = function() {
      var hex, i, _i, _len, _ref, _results;
      _ref = this.hexes;
      _results = [];
      for (i = _i = 0, _len = _ref.length; _i < _len; i = ++_i) {
        hex = _ref[i];
        if (hex) {
          if (!this.roads[next_pos(i)]) {
            this.roads[next_pos(i)] = hex.roads[opp_pos(i)];
            if (this.roads[next_pos(i)]) {
              _results.push(this.roads[next_pos(i)].buildings[opp_pos(next_pos(i))] = this);
            } else {
              _results.push(void 0);
            }
          } else {
            _results.push(void 0);
          }
        } else {
          _results.push(void 0);
        }
      }
      return _results;
    };

    Building.prototype.existing_hexes = function() {
      return _.compact(this.hexes);
    };

    Building.prototype.build = function() {
      var new_building;
      return new_building = $('<div>').addClass("building circle pos-" + this.pos + " unowned").appendTo(this.hex.dom_hex).data('id', this.id);
    };

    Building.prototype.owned_by = function(player) {
      var new_span;
      if (!this.player) {
        new_span = $('<span>').addClass('city');
        Building.__super__.owned_by.call(this, player).append(new_span);
        return player.buildings.push(this);
      }
    };

    Building.prototype.upgrade = function() {
      switch (this.upgrade_level) {
        case 0:
          return log.msg(5);
        case 1:
          return log.msg(5);
        case 2:
          return log.msg(5);
      }
    };

    return Building;

  })(Ownable);

}).call(this);
