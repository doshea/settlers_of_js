window.game =
  players: []
  dev_cards: []  
  hexes: []
  roads: []
  rows: 0
  die_roll: null
  active_player: null

  add_player: ->
    new_player = new Player
    unless @active_player
      new_player.activate()

  find_player: (id) ->
    @players[parseInt(id)-1]

  add_row: (row) ->
    @rows += 1
    new_row = $('<div>')
      .addClass('hex-row')
      .appendTo('#board')
    for row_pos in [1..row['hexes']]
      col = MAX_ROW_LENGTH - row['hexes'] + 1 + (2 * (row_pos-1))
      new_hex = new Hex(new_row, @rows, col)
      unless row['landlocked']
        if (row_pos is 1) or (row_pos is row['hexes'])
          new_hex.set_type('sea')
  find_hex: (id) ->
    @hexes[parseInt(id)-1]
  find_hex_rc: (row, col) ->
    matching = _.filter @hexes, (hex) ->
      (hex.row == row) and (hex.col == col)
    matching[0]
  populate_hexes: ->
    shuffled_hexes = _.shuffle(HEX_DECK)
    for hex in game.hexes
      unless hex.type is 'sea'
        hex.set_type(shuffled_hexes.pop())
      hex.associate_hexes()
    @populate_probabilities()
    log.msg('Populated hexes.')
  populate_probabilities: ->
    shuffled_probs = _.shuffle(PROBABILITY_DECK)
    for hex in game.hexes
      unless hex.type in ['sea', 'desert']
        drawn_prob = shuffled_probs.pop()
        hex.set_roll(drawn_prob['roll'])
        hex.set_dots(drawn_prob['dots'])
    stats.calculate_yields()
  populate_roads: ->
    for hex in game.hexes
      hex.surround_with_roads()
  roll_dice: ->
    @die_roll = 0
    for die in $('.die span')
      roll = Math.floor(Math.random()*5)
      @die_roll += (roll+1)
      $(die).html("&#x268#{roll};")
    roller = game.active_player
    log.msg("#{roller.name_span()} rolled <b>#{@die_roll}</b>.")

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
    game.players.push @
    @id = game.players.length
    @name = "Player #{@id}"

    @red = @random_color()
    @green = @random_color()
    @blue = @random_color()
    @make_css_rules()

    @dom_box = @build_box()
    @victory_points = 0
    log.msg("#{@name_span()} has joined the game.")

  random_color: ->
    Math.floor(Math.random()*256)
  rgb: ->
    "rgb(#{@red},#{@green},#{@blue})"
  anti_rgb: ->
    "rgb(#{256-@red},#{256-@green},#{256-@blue})"
  make_css_rules: ->
    # Thanks to http://davidwalsh.name/add-rules-stylesheets
    DYNAMIC_STYLESHEET.insertRule(".player-#{@id}-bg { background: #{@rgb()} }", 0)
    DYNAMIC_STYLESHEET.insertRule(".player-#{@id}-color { color: #{@rgb()} }", 0)
    DYNAMIC_STYLESHEET.insertRule(".player-#{@id}-anti-border { border: 2px solid #{@anti_rgb()} }", 0)
  build_box: ->
    box = $('<div>')
      .addClass('player')
      .data('player-id', @id)
      .addClass("player-#{@id}-bg player-#{@id}-anti-border")
      .appendTo($('#players'))
  activate: ->
    game.active_player = @
    $('.player').removeClass('active')
    @dom_box.addClass('active')
    @
  name_span: ->
    "<span class='player-#{@id}-color'>#{@name}</span>"

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

class Hex
  constructor: (dom_row, row, col)->
    game.hexes.push this
    @id = game.hexes.length
    @row = row
    @col = col
    @type = @roll = @dots = null

    @dom_hex = @build_hex(dom_row)
    @dom_prob = null
    @adj_hexes = new Array(6)
    @roads = new Array(6)
    @vertices = new Array(6)
    @robbed = false;

  build_hex: (row)->
    hex = $(HEX_NODE)
      .data('hex-id', @id)
      .appendTo(row)
  clear: ->
    @type = @roll = @dots = null
    @
  set_type: (new_type) ->
    @type = new_type
    if @type is 'desert'
      @gain_robber()
    @dom_hex.removeClass(HEX_CLASSES).addClass(new_type)
    @add_remove_probability()
    @
  add_remove_probability: ->
    if @type in ['sea','desert']
      if @dom_prob
        @dom_prob.remove()
        @dom_prob = null
    else if @dom_hex.find('.probability').length is 0
      @dom_hex.append(PROBABILITY_NODE)
      @dom_prob = @dom_hex.find('.probability')
    @
  set_dots: (new_dots) ->
    @dots = new_dots
    dot_string = ''
    for i in [1..new_dots]
      dot_string = dot_string + '&bull;'
    @dom_hex.find('.dots').html(dot_string)
    @
  set_roll: (new_roll) ->
    @roll = new_roll
    @dom_hex.find('.roll').text(@roll)
    @
  gain_robber: ->
    @robbed = true
    $('#robber-container').appendTo(@dom_hex)
    @
  gain_road: (pos) ->
    unless @roads[pos]
      new_road = new Road(@, pos)
      @roads[pos] = new_road
      neighbor = @adj_hexes[pos]
      if neighbor
        neighbor.roads[opp_pos(pos)] = new_road
    @
  gain_building: (pos) ->
    @buildings[pos] = new Building(@, pos)
    @
  associate_hexes: ->
    for position in HEX_POSITIONS
      [pos, rel_row, rel_col] = [position['pos'], position['rel_row'], position['rel_col']]
      unless @adj_hexes[pos]
        @adj_hexes[pos] = game.find_hex_rc(@row + rel_row , @col + rel_col)
        if @adj_hexes[pos]
          @adj_hexes[pos].adj_hexes[opp_pos(pos)] = @
  surround_with_roads: ->
    #only run after hexes are associated
    for hex, i in @adj_hexes
      if hex
        unless @roads[i]
          if (hex.type != 'sea') || (@type != 'sea')
            @gain_road(i)
  surround_with_buildings: ->
    true



class Road
  constructor: (hex, pos) ->
    game.roads.push @
    @id = game.roads.length
    @player = null
    @hex = hex
    @pos = pos

    @dom_road = @build_road()

  build_road: ->
    new_road = $('<div>')
      .addClass("road pos-#{@pos}")
      .appendTo(@hex.dom_hex)

class Building
  constructor: (hex, pos) ->
    @hex = hex
    @ur_hex = null
    @left_hex = null
    @lr_hex = null
  build_building: ->
    new_building = $('<div>')
      .addClass("building pos-#{pos}")
      .appendTo(@hex.dom_hex)

$(document).ready ->
  # begin with two players
  game.add_player() for player in [1..STARTING_PLAYERS]
  game.add_row(row) for row in HEX_ROWS
  game.populate_hexes()
  game.populate_roads() #REMOVE
  


  $('#players').on 'click', '.player', ->
    $('.active').removeClass('active')
    $(this).addClass('active')
    id = $(this).data('player-id')
    game.active_player = game.find_player(id)