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
    for i in [1..row['hexes']]
      new_hex = new Hex(new_row)
      unless row['landlocked']
        if (i is 1) or (i is row['hexes'])
          new_hex.set_type('sea')

  find_hex: (id) ->
    @hexes[parseInt(id)-1]

  populate_hexes: ->
    shuffled_hexes = _.shuffle(HEX_DECK)
    for hex in game.hexes
      unless hex.type is 'sea'
        hex.set_type(shuffled_hexes.pop())
    @populate_probabilities()
    log.msg('Populated hexes.')
  populate_probabilities: ->
    shuffled_probs = _.shuffle(PROBABILITY_DECK)
    for hex in game.hexes
      unless _.contains(['sea', 'desert'], hex.type)
        drawn_prob = shuffled_probs.pop()
        hex.set_roll(drawn_prob['roll'])
        hex.set_dots(drawn_prob['dots'])

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

window.stats = 
  calculate_yields: ->
    resource_hexes = $('.hex:not(.sea, .desert)')
    bricks = resource_hexes.filter('.brick')
    ore = resource_hexes.filter('.ore')
    wood = resource_hexes.filter('.wood')
    wheat = resource_hexes.filter('.wheat')
    sheep = resource_hexes.filter('.sheep')



class Hex
  constructor: (row)->
    game.hexes.push this
    @id = game.hexes.length
    @type = @roll = @dots = null

    @dom_hex = @build_hex(row)
  find_hex: (id) ->
    @hexes[parseInt(id)-1]
  build_hex: (row)->
    hex = $(HEXAGON_NODE)
      .data('hex-id', @id)
      .appendTo(row)
  clear: ->
    @type = @roll = @dots = null
    @
  set_type: (new_type) ->
    @type = new_type
    @dom_hex.find('.hex-image').removeClass(HEX_CLASSES).addClass(new_type)
    @add_remove_probability()
    @
  add_remove_probability: ->
    if _.contains(['sea','desert'], @type)
      @dom_hex.find('.probability').remove()
    else if @dom_hex.find('.probability').length is 0
      @dom_hex.find('.hex-image').append(PROBABILITY_NODE)
    @
  circularize_probability: ->
    prob = @dom_hex.find('.probability')
    max_dim = _.max([prob.width(),prob.height()])
    prob.css
      'width':'auto'
      'height':'auto'
    prob.width(max_dim)
    prob.height(max_dim)
    @
  set_dots: (new_dots) ->
    @dots = new_dots
    dot_string = ''
    for i in [1..new_dots]
      dot_string = dot_string + '&bull;'
    @dom_hex.find('.dots').html(dot_string)
    @circularize_probability()
    @
  set_roll: (new_roll) ->
    @roll = new_roll
    @dom_hex.find('.roll').text(@roll)
    @circularize_probability()
    @

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