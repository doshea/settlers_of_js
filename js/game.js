// Generated by CoffeeScript 1.7.1
(function() {
  var Hex, Player;

  window.game = {
    players: [],
    dev_cards: [],
    hexes: [],
    active_player: null,
    add_player: function() {
      return new Player;
    },
    find_player: function(id) {
      return this.players[parseInt(id) - 1];
    },
    add_hex: function() {
      return new Hex;
    },
    find_hex: function(id) {
      return this.hexes[parseInt(id) - 1];
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
      return box = $('<div>').addClass('player').data('player-id', this.id).css({
        'background-color': "rgb(" + (this.rgb()) + ")",
        'border-color': "rgb(" + (this.anti_rgb()) + ")"
      }).appendTo($('#players'));
    };

    Player.prototype.colored_el = function(el, content) {
      return "<" + el + " style='color: rgb(" + (this.rgb()) + ");'>" + content + "</" + el + ">";
    };

    return Player;

  })();

  Hex = (function() {
    function Hex() {
      this.dom_hex = this.build_hex();
    }

    Hex.prototype.build_hex = function() {
      var hex;
      return hex = $('<div>').addClass('hex').appendTo($('#board'));
    };

    return Hex;

  })();

  $(document).ready(function() {
    var hex, player, _i, _j;
    for (player = _i = 1; 1 <= STARTING_PLAYERS ? _i <= STARTING_PLAYERS : _i >= STARTING_PLAYERS; player = 1 <= STARTING_PLAYERS ? ++_i : --_i) {
      game.add_player();
    }
    for (hex = _j = 1; 1 <= HEX_COUNT ? _j <= HEX_COUNT : _j >= HEX_COUNT; hex = 1 <= HEX_COUNT ? ++_j : --_j) {
      game.add_hex();
    }
    return $('#players').on('click', '.player', function() {
      var id;
      $('.active').removeClass('active');
      $(this).addClass('active');
      id = $(this).data('player-id');
      return game.active_player = game.find_player(id);
    });
  });

}).call(this);
