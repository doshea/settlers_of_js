// Generated by CoffeeScript 1.7.1
(function() {
  window.offset_pos = function(i, offset) {
    return (i + offset) % 6;
  };

  window.opp_pos = function(i) {
    return offset_pos(i, 3);
  };

  window.next_pos = function(i) {
    return offset_pos(i, 1);
  };

  window.prev_pos = function(i) {
    return offset_pos(i, 5);
  };

  window.hex_type = function(hex) {
    if (hex) {
      return hex.type;
    } else {
      return hex;
    }
  };

  window.rotate_board = function() {
    var value;
    value = $('#board-rotation').val();
    $('#board').css('transform', "rotate(" + value + "deg)");
    return $('.probability').css('transform', "rotate(" + (-value) + "deg)");
  };

  window.all_dots = [];

  window.stats = {
    calculate_yields: function() {
      var binned_hexes, hexes_by_resource, row, rows, _i, _len, _results;
      $('#resource-yields tbody').empty();
      rows = [];
      hexes_by_resource = _.map(RESOURCES, function(resource) {
        return _.filter(game.hexes, function(hex) {
          return hex.type === resource;
        });
      });
      binned_hexes = _.object(RESOURCES, hexes_by_resource);
      _.each(binned_hexes, function(v, k) {
        var dot_count, hex_count, resource_name, row, total_dots;
        total_dots = _.reduce(v, function(memo, hex) {
          return memo + hex.dots;
        }, 0);
        all_dots.push(total_dots);
        row = $('<tr>');
        resource_name = $('<td>').text(k).appendTo(row);
        hex_count = $('<td>').text(v.length).appendTo(row);
        dot_count = $('<td>').addClass('dot-count').text(total_dots).appendTo(row);
        if (total_dots < 9) {
          row.css('background', 'tomato');
        }
        if (total_dots > 14) {
          row.css('background', 'lightgreen');
        }
        return rows.push(row);
      });
      rows = _.sortBy(rows, function(row) {
        return parseInt($(row).find('.dot-count').text()) * -1;
      });
      _results = [];
      for (_i = 0, _len = rows.length; _i < _len; _i++) {
        row = rows[_i];
        _results.push(row.appendTo($('#resource-yields tbody')));
      }
      return _results;
    },
    player_stats: function(player) {
      var color, id, row, table;
      id = player.id;
      table = $('#player-stats');
      row = table.find(".player-" + id);
      if (row.length === 0) {
        row = $('<td>').addClass("player-" + id);
        if (id === 0) {
          table.prepend(row);
        } else {
          table.find(".player-" + (id - 1)).after(row);
        }
      }
      return color = $('<td>').addClass("player-" + id + "-bg").appendTo(row);
    },
    calculate_richness: function() {
      var b, h, resource_richness, _i, _j, _len, _len1, _ref, _ref1;
      resource_richness = 0;
      _ref = game.buildings;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        b = _ref[_i];
        _ref1 = b.existing_hexes();
        for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
          h = _ref1[_j];
          resource_richness += h.dots;
        }
      }
      return resource_richness;
    }
  };

  window.bank = {
    sheep: RESOURCE_MAX,
    wheat: RESOURCE_MAX,
    brick: RESOURCE_MAX,
    wood: RESOURCE_MAX,
    ore: RESOURCE_MAX
  };

  window.dice = {
    roll: null,
    FAKEOUT_FREQ: 100,
    ROLL_TIME: 1000,
    CODES: ['&#x2680;', '&#x2681;', '&#x2682', '&#x2683;', '&#x2684;', '&#x2685;'],
    start_roll: function() {
      var fakeout_caller, fakeout_stopper;
      if (!this.rolling) {
        this.rolling = true;
        fakeout_caller = window.setInterval(function() {
          var die, temp_roll, _i, _len, _ref, _results;
          _ref = $('.die span');
          _results = [];
          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            die = _ref[_i];
            temp_roll = _.random(5);
            _results.push($(die).html(dice.CODES[temp_roll]));
          }
          return _results;
        }, this.FAKEOUT_FREQ);
        return fakeout_stopper = window.setTimeout(function() {
          window.clearInterval(fakeout_caller);
          return dice.end_roll();
        }, this.ROLL_TIME);
      }
    },
    end_roll: function() {
      var die, roller, temp_roll, _i, _len, _ref;
      this.roll = 0;
      _ref = $('.die span');
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        die = _ref[_i];
        temp_roll = _.random(5);
        this.roll += temp_roll + 1;
        $(die).html(dice.CODES[temp_roll]);
      }
      roller = game.active_player;
      log.msg("" + (roller.name_span()) + " rolled <b>" + this.roll + "</b>.");
      return this.rolling = false;
    }
  };

  window.log = {
    msg: function(content) {
      var new_msg;
      new_msg = $('<li>').addClass('log-msg').html(content).appendTo($('#log-msgs'));
      return $('#log-msgs').scrollTop($('#log-msgs').height());
    }
  };

  window.richnesses = {};

}).call(this);
