window.offset_pos = (i, offset) ->
  (i + offset)%6
window.opp_pos = (i) ->
  offset_pos(i, 3)
window.next_pos = (i) ->
  offset_pos(i, 1)
window.prev_pos = (i) ->
  offset_pos(i, 5)
window.hex_type = (hex) ->
  if hex
    hex.type
  else
    hex

window.rotate_board = ->
  value = $('#board-rotation').val()
  $('#board').css('transform', "rotate(#{value}deg)")
  $('.probability').css('transform', "rotate(#{-value}deg)")

window.stats = 
  calculate_yields: ->
    $('#resource-yields tbody').empty()
    hexes_by_resource = _.map RESOURCES, (resource) ->
      _.filter(game.hexes, (hex) -> hex.type is resource)
    binned_hexes = _.object(RESOURCES, hexes_by_resource)
    _.each binned_hexes, (v,k) ->
      total_dots = _.reduce(v, (memo, hex) ->
        memo + hex.dots; 
      , 0)
      row = $('<tr>')
      resource_name = $('<td>').text(k).appendTo(row)
      hex_count = $('<td>').text(v.length).appendTo(row)
      dot_count = $('<td>').text(total_dots).appendTo(row)
      row.appendTo($('#resource-yields tbody'))
  player_stats: (player) ->
    id = player.id
    table = $('#player-stats')
    row = table.find(".player-#{id}")
    if row.length is 0
      row = $('<td>').addClass("player-#{id}")
      if id is 0
        table.prepend(row)
      else
        table.find(".player-#{id-1}").after(row)
    color = $('<td>').addClass("player-#{id}-bg").appendTo(row)




window.bank =
  sheep: RESOURCE_MAX
  wheat: RESOURCE_MAX
  brick: RESOURCE_MAX
  wood: RESOURCE_MAX
  ore: RESOURCE_MAX

window.dice =
  roll: null
  FAKEOUT_FREQ: 100;
  ROLL_TIME: 1000;
  CODES: ['&#x2680;', '&#x2681;', '&#x2682', '&#x2683;', '&#x2684;', '&#x2685;']

  start_roll: ->
    unless @rolling
      @rolling = true
      fakeout_caller = window.setInterval ->
        for die in $('.die span')
          temp_roll = _.random(5)
          $(die).html(dice.CODES[temp_roll])
      , @FAKEOUT_FREQ
      fakeout_stopper = window.setTimeout ->
        window.clearInterval(fakeout_caller)
        dice.end_roll()
      , @ROLL_TIME

  end_roll: ->
      @roll = 0
      for die in $('.die span')
        temp_roll = _.random(5)
        @roll += (temp_roll+1)
        $(die).html(dice.CODES[temp_roll])
      roller = game.active_player
      log.msg("#{roller.name_span()} rolled <b>#{@roll}</b>.")
      @rolling = false


window.log = 
  msg: (content) ->
    new_msg = $('<li>')
      .addClass('log-msg')
      .html(content)
      .appendTo($('#log-msgs'))
    $('#log-msgs').scrollTop($('#log-msgs').height())