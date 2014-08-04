$(document).ready ->
  # begin with two players
  game.add_player() for player in [1..STARTING_PLAYERS]
  game.add_row(row) for row in HEX_ROWS
  game.populate_hexes()
  game.populate_roads() #REMOVE
  game.populate_buildings() #REMOVE

  $('#players').on 'click', '.player', ->
    $('.active').removeClass('active')
    $(@).addClass('active')
    id = $(@).data('player-id')
    game.active_player = game.find_player(id)

  $('input').on 'change', (e) ->
    value = $(@).val()
    $('#board-pane').css('transform', "rotate(#{value}deg)")
    $('.probability').css('transform', "rotate(#{-value}deg)")

  $('#board-pane').on 'click', '.building, .road', ->
    id = $(@).data('id')
    if $(@).hasClass('road')
      associated_object = game.find_road(id)
    else
      associated_object = game.find_building(id)
    associated_object.owned_by(game.active_player)