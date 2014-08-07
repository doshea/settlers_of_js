$(document).ready ->
  # begin with two players
  game.add_player() for player in [1..STARTING_PLAYERS]
  game.add_row(row) for row in HEX_ROWS
  game.populate_hexes()
  game.populate_roads() #REMOVE
  game.populate_buildings() #REMOVE

  $('#board-pane').on 'click', '.building.unowned.clickable, .road.unowned.clickable', ->
    id = $(@).data('id')
    is_road = $(@).hasClass('road')
    if is_road
      associated_object = game.find_road(id)
    else
      associated_object = game.find_building(id)
    associated_object.owned_by game.active_player
    

  $('#board-pane').on 'click', '.plantable.road', ->
    id = $(@).data('id')
    player = game.active_player
    road = game.find_road(id)
    player.unplaced_roads -= 1
    road.owned_by(player)
    game.next_planter()

  $('#board-pane').on 'click', '.plantable.building', ->
    id = $(@).data('id')
    building = game.find_building(id)
    player = game.active_player
    player.unplaced_settlements -= 1
    building.owned_by(player)
    $('.building').removeClass('plantable')
    $('.road.unowned').addClass('plantable')

  $('#log form').on 'submit', (e) ->
    e.preventDefault()
    field = $('form input')
    message = field.val()
    if message != ''
      if game.active_player
        log.msg("#{game.active_player.name_span()}: #{message}")
      field.val('')




  $('#board-pane').on 'click', '.building.owned.clickable', ->
    id = $(@).data('id')
    game.find_building(id).upgrade()