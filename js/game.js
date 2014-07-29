// Generated by CoffeeScript 1.7.1
(function() {
  var Hex, Player, Road;

  window.game = {
    players: [],
    dev_cards: [],
    hexes: [],
    roads: [],
    active_player: null,
    add_player: function() {
      return new Player;
    },
    find_player: function(id) {
      return this.players[parseInt(id) - 1];
    },
    add_row: function(row) {
      var i, new_hex, new_row, _i, _ref, _results;
      new_row = $('<div>').addClass('hex-row').appendTo('#board');
      _results = [];
      for (i = _i = 1, _ref = row['hexes']; 1 <= _ref ? _i <= _ref : _i >= _ref; i = 1 <= _ref ? ++_i : --_i) {
        new_hex = new Hex(new_row);
        if (!row['landlocked']) {
          if ((i === 1) || (i === row['hexes'])) {
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
      return this.hexes[parseInt(id) - 1];
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
      }
      this.populate_probabilities();
      return log.msg('Populated hexes.');
    },
    populate_probabilities: function() {
      var drawn_prob, hex, shuffled_probs, _i, _len, _ref;
      shuffled_probs = _.shuffle(PROBABILITY_DECK);
      _ref = game.hexes;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        hex = _ref[_i];
        if (!_.contains(['sea', 'desert'], hex.type)) {
          drawn_prob = shuffled_probs.pop();
          hex.set_roll(drawn_prob['roll']);
          hex.set_dots(drawn_prob['dots']);
        }
      }
      return stats.calculate_yields();
    }
  };

  window.bank = {
    sheep: RESOURCE_MAX,
    wheat: RESOURCE_MAX,
    brick: RESOURCE_MAX,
    wood: RESOURCE_MAX,
    ore: RESOURCE_MAX
  };

  window.log = {
    msg: function(content) {
      var new_msg;
      return new_msg = $('<li>').addClass('log-msg').html(content).appendTo($('#log-msgs'));
    }
  };

  Player = (function() {
    function Player() {
      game.players.push(this);
      this.id = game.players.length;
      this.name = "Player " + this.id;
      this.red = this.random_color();
      this.green = this.random_color();
      this.blue = this.random_color();
      this.dom_box = this.build_box();
      this.victory_points = 0;
      log.msg("" + (this.colored_el('span', this.name)) + " has joined the game.");
    }

    Player.prototype.random_color = function() {
      return Math.floor(Math.random() * 256);
    };

    Player.prototype.rgb = function() {
      return "" + this.red + "," + this.green + "," + this.blue;
    };

    Player.prototype.anti_rgb = function() {
      return "" + (256 - this.red) + "," + (256 - this.green) + "," + (256 - this.blue);
    };

    Player.prototype.build_box = function() {
      var box;
      box = $('<div>').addClass('player').data('player-id', this.id).css({
        'background-color': "rgb(" + (this.rgb()) + ")",
        'border-color': "rgb(" + (this.anti_rgb()) + ")"
      }).appendTo($('#players'));
      return this;
    };

    Player.prototype.colored_el = function(el, content) {
      return "<" + el + " style='color: rgb(" + (this.rgb()) + ");'>" + content + "</" + el + ">";
    };

    return Player;

  })();

  window.stats = {
    calculate_yields: function() {
      var binned_hexes, hexes_by_resource;
      $('#resource-yields tbody').empty();
      hexes_by_resource = _.map(RESOURCES, function(resource) {
        return _.filter(game.hexes, function(hex) {
          return hex.type === resource;
        });
      });
      binned_hexes = _.object(RESOURCES, hexes_by_resource);
      return _.each(binned_hexes, function(v, k) {
        var dot_count, hex_count, resource_name, row, total_dots;
        total_dots = _.reduce(v, function(memo, hex) {
          return memo + hex.dots;
        }, 0);
        row = $('<tr>');
        resource_name = $('<td>').text(k).appendTo(row);
        hex_count = $('<td>').text(v.length).appendTo(row);
        dot_count = $('<td>').text(total_dots).appendTo(row);
        return row.appendTo($('#resource-yields tbody'));
      });
    }
  };

  Hex = (function() {
    function Hex(row) {
      game.hexes.push(this);
      this.id = game.hexes.length;
      this.type = this.roll = this.dots = null;
      this.dom_hex = this.build_hex(row);
      this.dom_prob;
      this.roads = new Array(6);
      this.vertices = new Array(6);
    }

    Hex.prototype.build_hex = function(row) {
      var hex;
      return hex = $(HEXAGON_NODE).data('hex-id', this.id).appendTo(row);
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
      this.dom_hex.find('.hex-image').removeClass(HEX_CLASSES).addClass(new_type);
      this.add_remove_probability();
      return this;
    };

    Hex.prototype.add_remove_probability = function() {
      if (_.contains(['sea', 'desert'], this.type)) {
        if (this.dom_prob) {
          this.dom_prob.remove();
          this.dom_prob = null;
        }
      } else if (this.dom_hex.find('.probability').length === 0) {
        this.dom_hex.find('.hex-image').append(PROBABILITY_NODE);
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
      return $('#robber-container').appendTo(this.dom_hex);
    };

    return Hex;

  })();

  Road = (function() {
    function Road(hex, position) {
      game.roads.push(this);
      this.player;
      this.dom_road;
      if (position < 3) {
        this.above_hex = hex;
      } else {
        this.below_hex = hex;
      }
    }

    Road.prototype.build_road = function() {};

    return Road;

  })();

  $(document).ready(function() {
    var player, row, _i, _j, _len;
    for (player = _i = 1; 1 <= STARTING_PLAYERS ? _i <= STARTING_PLAYERS : _i >= STARTING_PLAYERS; player = 1 <= STARTING_PLAYERS ? ++_i : --_i) {
      game.add_player();
    }
    for (_j = 0, _len = HEX_ROWS.length; _j < _len; _j++) {
      row = HEX_ROWS[_j];
      game.add_row(row);
    }
    game.populate_hexes();
    return $('#players').on('click', '.player', function() {
      var id;
      $('.active').removeClass('active');
      $(this).addClass('active');
      id = $(this).data('player-id');
      return game.active_player = game.find_player(id);
    });
  });

}).call(this);
