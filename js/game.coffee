window.game =
  players: []
  dev_cards: []  
  hexes: []
  active_player: null

  add_player: ->
    new Player

  find_player: (id) ->
    @players[parseInt(id)-1]

  add_row: (hex_count) ->
    indent_cols = Math.max.apply( Math, HEX_ROWS ) - hex_count
    adjustment = 0
    if indent_cols > 0
      adjustment = (indent_cols - 0.5)*HEX_WIDTH_EM
    new_row = $('<div>')
      .addClass('hex-row')
      .appendTo('#board')
      .css('margin-left', "#{adjustment}em")
    game.add_hex(new_row) for hex in [1..hex_count]

  add_hex: (row) ->
    new Hex

  find_hex: (id) ->
    @hexes[parseInt(id)-1]


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
  constructor: ->
    @dom_hex = @build_hex()

  build_hex: ->
    hex = $('<div>')
      .addClass('hex')
      .appendTo($('#board'))


$(document).ready ->
  # begin with two players
  game.add_player() for player in [1..STARTING_PLAYERS]
  game.add_row() for row in HEX_ROWS
  


  $('#players').on 'click', '.player', ->
    $('.active').removeClass('active')
    $(this).addClass('active')
    id = $(this).data('player-id')
    game.active_player = game.find_player(id)