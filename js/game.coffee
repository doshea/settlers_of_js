window.game =
  players: []
  dev_cards: []  
  hexes: []
  active_player: null

  add_player: ->
    new Player

  find_player: (id) ->
    @players[parseInt(id)-1]

  add_row: (row) ->
    indent_cols = _.max(_.pluck(HEX_ROWS, 'hexes')) - row['hexes']
    adjustment = 0
    if indent_cols > 0
      adjustment = indent_cols * (0.9 * HEX_WIDTH_EM + HEX_SPACING)
    new_row = $('<div>')
      .addClass('hex-row')
      .css('margin-left', "#{adjustment}em")
      .appendTo('#board')
    for hex in [1..row['hexes']]
      new Hex(new_row)
    unless row['landlocked']
      new_row.children(':first-child, :last-child').addClass('sea').find('.hex-image').addClass('sea')


  find_hex: (id) ->
    @hexes[parseInt(id)-1]

  populate_hexes: ->
    shuffled_hexes = _.shuffle(HEX_DECK)
    $('.hex:not(.sea)')
      .removeClass('brick ore wood wheat sheep desert')
      .find('.hex-image')
      .removeClass('brick ore wood wheat sheep desert')
    for hex in $('.hex:not(.sea)')
      resource = shuffled_hexes.pop()
      $(hex).addClass(resource)
      $(hex).find('.hex-image').addClass(resource)
    log.msg('Populated hexes.')


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

class Player
  constructor: ->
    game.players.push this
    @id = game.players.length
    @name = "Player #{@id}"

    @red = @random_color()
    @green = @random_color()
    @blue = @random_color()

    @dom_box = @build_box()
    @victory_points = 0
    log.msg("#{@colored_el('span', @name)} has joined the game.")

  random_color: ->
    Math.floor(Math.random()*256)
  rgb: ->
    "#{@red},#{@green},#{@blue}"
  anti_rgb: ->
    "#{256-@red},#{256-@green},#{256-@blue}"
  build_box: ->
    box = $('<div>')
      .addClass('player')
      .data('player-id', @id)
      .css
        'background-color': "rgb(#{@rgb()})"
        'border-color': "rgb(#{@anti_rgb()})"
      .appendTo($('#players'))
  colored_el: (el, content) ->
    "<#{el} style='color: rgb(#{@rgb()});'>#{content}</#{el}>"

class Hex
  constructor: (row)->
    @dom_hex = @build_hex(row)

  build_hex: (row)->
    hex = $(HEXAGON_NODE)
      .appendTo(row)


$(document).ready ->
  # begin with two players
  game.add_player() for player in [1..STARTING_PLAYERS]
  game.add_row(row) for row in HEX_ROWS
  game.populate_hexes()
  


  $('#players').on 'click', '.player', ->
    $('.active').removeClass('active')
    $(this).addClass('active')
    id = $(this).data('player-id')
    game.active_player = game.find_player(id)