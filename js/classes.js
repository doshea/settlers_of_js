// Generated by CoffeeScript 1.7.1
(function() {
  var Building, Hex, Ownable, Player, Road,
    __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  window.game = {
    players: [],
    dev_cards: [],
    hexes: [],
    roads: [],
    buildings: [],
    rows: 0,
    die_roll: null,
    active_player: null,
    add_player: function() {
      var new_player;
      new_player = new Player;
      if (!this.active_player) {
        return new_player.activate();
      }
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
    find_buildings: function(id) {
      return this.buildings[parseInt(id)];
    },
    find_hex_rc: function(row, col) {
      var matching;
      matching = _.filter(this.hexes, function(hex) {
        return (hex.row === row) && (hex.col === col);
      });
      return matching[0];
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
      _ref = game.hexes;
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
    roll_dice: function() {
      var die, roll, roller, _i, _len, _ref;
      this.die_roll = 0;
      _ref = $('.die span');
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        die = _ref[_i];
        roll = Math.floor(Math.random() * 5);
        this.die_roll += roll + 1;
        $(die).html("&#x268" + roll + ";");
      }
      roller = game.active_player;
      return log.msg("" + (roller.name_span()) + " rolled <b>" + this.die_roll + "</b>.");
    }
  };

  Player = (function() {
    function Player() {
      this.id = game.players.length;
      game.players.push(this);
      this.name = "Player " + (this.id + 1);
      this.red = this.random_color();
      this.green = this.random_color();
      this.blue = this.random_color();
      this.make_css_rules();
      this.dom_box = this.build();
      this.victory_points = 0;
      log.msg("" + (this.name_span()) + " has joined the game.");
    }

    Player.prototype.random_color = function() {
      return Math.floor(Math.random() * 256);
    };

    Player.prototype.rgb = function() {
      return "rgb(" + this.red + "," + this.green + "," + this.blue + ")";
    };

    Player.prototype.anti_rgb = function() {
      return "rgb(" + (256 - this.red) + "," + (256 - this.green) + "," + (256 - this.blue) + ")";
    };

    Player.prototype.make_css_rules = function() {
      DYNAMIC_STYLESHEET.insertRule(".player-" + this.id + "-bg { background: " + (this.rgb()) + " }", 0);
      DYNAMIC_STYLESHEET.insertRule(".player-" + this.id + "-color { color: " + (this.rgb()) + " }", 0);
      return DYNAMIC_STYLESHEET.insertRule(".player-" + this.id + "-anti-border { border: 2px solid " + (this.anti_rgb()) + " }", 0);
    };

    Player.prototype.build = function() {
      var box;
      return box = $('<div>').addClass('player').data('player-id', this.id).addClass("player-" + this.id + "-bg player-" + this.id + "-anti-border").appendTo($('#players'));
    };

    Player.prototype.activate = function() {
      game.active_player = this;
      $('.player').removeClass('active');
      this.dom_box.addClass('active');
      return this;
    };

    Player.prototype.name_span = function() {
      return "<span class='player-" + this.id + "-color'>" + this.name + "</span>";
    };

    return Player;

  })();

  Hex = (function() {
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
        if (__indexOf.call(triad_types, true) >= 0) {
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
      this.player = player;
      return this.dom_representation.addClass("player-" + player.id + "-bg owned");
    };

    Ownable.prototype.disown = function() {
      this.dom_representation.removeClass("player-" + this.player.id + "-bg owned");
      return this.player = null;
    };

    return Ownable;

  })();

  Road = (function(_super) {
    __extends(Road, _super);

    function Road(hex, pos) {
      Road.__super__.constructor.call(this, hex, pos, game.roads);
      this.buildings = new Array(6);
      this.hexes = [hex, hex.adj_hexes[pos]];
      this.dom_representation = this.build();
    }

    Road.prototype.build = function() {
      var new_road;
      return new_road = $('<div>').addClass("road pos-" + this.pos).appendTo(this.hex.dom_hex);
    };

    return Road;

  })(Ownable);

  Building = (function(_super) {
    __extends(Building, _super);

    function Building(hex, pos) {
      Building.__super__.constructor.call(this, hex, pos, game.buildings);
      this.hexes = new Array(6);
      this.roads = new Array(2);
      this.dom_representation = this.build();
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
      return new_building = $('<div>').addClass("building circle pos-" + this.pos).appendTo(this.hex.dom_hex);
    };

    return Building;

  })(Ownable);

}).call(this);