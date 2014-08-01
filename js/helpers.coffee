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

window.bank =
  sheep: RESOURCE_MAX
  wheat: RESOURCE_MAX
  brick: RESOURCE_MAX
  wood: RESOURCE_MAX
  ore: RESOURCE_MAX

window.log = 
  msg: (content) ->
    new_msg = $('<li>')
      .addClass('log-msg')
      .html(content)
      .appendTo($('#log-msgs'))