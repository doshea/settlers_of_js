$(document).ready ->
  # begin with two players
  game.add_player() for player in [1..STARTING_PLAYERS]
  game.add_row(row) for row in HEX_ROWS
  game.populate_hexes()
  game.populate_roads() #REMOVE
  game.populate_buildings() #REMOVE

  $('#players').on 'click', '.player', ->
    $('.active').removeClass('active')
    $(this).addClass('active')
    id = $(this).data('player-id')
    game.active_player = game.find_player(id)

  $('input').on 'change', (e) ->
    value = $(this).val()
    $('#board-pane').css('transform', "rotate(#{value}deg)")
    $('.probability').css('transform', "rotate(#{-value}deg)")