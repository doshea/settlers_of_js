window.game =
  stage: STAGES[0]
  phase: null
  players: []
  dev_cards: []  
  hexes: []
  roads: []
  planting_round: null
  planting_order: []
  buildings: []
  rows: 0
  active_player: null
  rolling: false

  add_player: ->
    new_player = new Player
  find_player: (id) ->
    @players[parseInt(id)]

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
    @hexes[parseInt(id)]
  find_road: (id) ->
    @roads[parseInt(id)]
  find_building: (id) ->
    @buildings[parseInt(id)]
  find_hex_rc: (row, col) ->
    matching = _.filter @hexes, (hex) ->
      (hex.row == row) and (hex.col == col)
    matching[0]
  non_sea_hexes: ->
    non_sea_hexes = _.filter game.hexes, (hex) ->
      hex.type != 'sea'
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
  populate_buildings: ->
    for hex in game.non_sea_hexes()
      for i in [0..5]
        hex.gain_new_building(i)
  finish_setup: ->
    @stage = STAGES[1]
    $('#setup, #planting').toggleClass('inactive')
    $('.building').addClass('plantable')
    player_copy = game.players.slice(0)
    @planting_order = game.players.concat(player_copy.reverse())
    @planting_round = 1
    @next_planter()
  next_planter: ->
    if @planting_order.length is 0
      @finish_planting()
    else
      current = @active_player
      next = @planting_order.shift()
      if current is next
        @planting_round += 1
      next.activate()
      $('.road').removeClass('plantable')
      $('.building.unowned').addClass('plantable')



  finish_planting: ->
    $('.plantable').removeClass('plantable')
    @planting_round = null
    @stage = STAGES[2]
    @phase = PHASES[0]
    $('#planting, #dice').toggleClass('inactive')
  finish_rolling: ->
    switch dice.roll
      when 7 then @phase = PHASES[1]
      else @phase = PHASES[2]
  


class Player
  @MAX_PLAYERS = 6
  constructor: ->
    unless game.players.length >= @constructor.MAX_PLAYERS
      @id = game.players.length
      game.players.push @
      
      @name = "Player #{@id+1}"
      @buildings = []
      @roads = []
      @unplaced_settlements = STARTING_SETTLEMENTS;
      @unplaced_roads = STARTING_SETTLEMENTS;

      [@red, @green, @blue] = PLAYER_COLORS[@id]
      @make_css_rules()

      @dom_box = @build()
      @victory_points = 0
      log.msg("#{@name_span()} has joined the game.")
    else
      alert 'Max Players reached'
  rgb: ->
    "rgb(#{@red},#{@green},#{@blue})"
  make_css_rules: ->
    # Thanks to http://davidwalsh.name/add-rules-stylesheets
    DYNAMIC_STYLESHEET.insertRule(".player-#{@id}-bg { background: #{@rgb()} }", 0)
    DYNAMIC_STYLESHEET.insertRule(".player-#{@id}-color { color: #{@rgb()} }", 0)
  build: ->
    tab = $('<li>')
      .addClass("player player-#{@id}")
    box = $('<div>')
      .addClass('flag')
      .data('player-id', @id)
      .addClass("player-#{@id}-bg")
      .appendTo(tab)
    name = $('<span>')
      .text(@name)
      .appendTo(tab)
    tab.appendTo($('#players'))
    box

  activate: ->
    game.active_player = @
    $('.flag').removeClass('active')
    @dom_box.addClass('active')
    @
  name_span: ->
    "<span class='player-#{@id}-color'>#{@name}</span>"

class Hex
  @POSITIONS = [
    {'pos': 0, 'rel_row': -1, 'rel_col': -1},
    {'pos': 1, 'rel_row': -2, 'rel_col': 0},
    {'pos': 2, 'rel_row': -1, 'rel_col': +1},
    {'pos': 3, 'rel_row': 1, 'rel_col': +1},
    {'pos': 4, 'rel_row': 2, 'rel_col': 0},
    {'pos': 5, 'rel_row': 1, 'rel_col': -1}
  ]

  constructor: (dom_row, row, col)->
    @id = game.hexes.length
    game.hexes.push this
    
    @row = row
    @col = col
    @type = @roll = @dots = null

    @dom_hex = @build(dom_row)
    @dom_prob = null
    @adj_hexes = new Array(6)
    @roads = new Array(6)
    @buildings = new Array(6)
    @robbed = false;

  build: (row)->
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

  gain_new_building: (pos) ->
    unless @buildings[pos]
      triad = _.compact([@, @adj_hexes[pos], @adj_hexes[next_pos(pos)]])
      #check if any of the bordering hexes are non-sea
      triad_nonsea = _.map triad, (hex) ->
        hex.type != 'sea'
      #if any are, a building can be placed
      if true in triad_nonsea
        new_building = new Building(@, pos)
        @buildings[pos] = new_building
        new_building.hexes[opp_pos(pos)] = @
        neighbors = [@adj_hexes[pos], @adj_hexes[next_pos(pos)]]
        for neighbor, i in neighbors
          if neighbor
            new_pos = offset_pos(pos, 2*(i+1))
            neighbor.gain_existing_building(new_building, new_pos)
        new_building.associate_roads()
    @

  gain_existing_building: (building, pos) ->
    unless @buildings[pos]
      @buildings[pos] = building
      building.hexes[opp_pos(pos)] = @
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
    for pos in [0..5]
      unless @buildings[pos]
        we_three_hexes = [@, @adj_hexes[pos], @adj_hexes[next_pos(pos)]]


class Ownable
  constructor: (hex, pos, collection) ->
    @hex = hex
    @pos = pos
    @player = null
    @id = collection.length
    collection.push @
  owned_by: (player) ->
    unless @player
      @player = player
      @dom_rep
        .addClass("player-#{player.id}-bg player-#{player.id}-color owned")
        .removeClass('unowned')

class Road extends Ownable
  constructor: (hex, pos) ->
    super(hex, pos, game.roads)
    @buildings = new Array(6)
    @hexes = [hex, hex.adj_hexes[pos]]
    @dom_rep = @build()

  build: ->
    new_road = $('<div>')
      .addClass("road pos-#{@pos} unowned")
      .appendTo(@hex.dom_hex)
      .data('id', @id)
  owned_by: (player) ->
    unless @player
      super(player)
      player.roads.push @

class Building extends Ownable
  constructor: (hex, pos) ->
    super(hex, pos, game.buildings)
    @hexes = new Array(6)
    @roads = new Array(2)
    @upgrade_level = 0
    
    @dom_rep = @build()
  associate_roads: ->
    for hex, i in @hexes
      if hex
        unless @roads[next_pos(i)]
          @roads[next_pos(i)] = hex.roads[opp_pos(i)]
          if @roads[next_pos(i)]
            @roads[next_pos(i)].buildings[opp_pos(next_pos(i))] = @
  existing_hexes: ->
    _.compact(@hexes)
  build: ->
    new_building = $('<div>')
      .addClass("building circle pos-#{@pos} unowned")
      .appendTo(@hex.dom_hex)
      .data('id', @id)
  owned_by: (player) ->
    unless @player
      new_span = $('<span>').addClass('city')
      super(player).append(new_span)
      player.buildings.push @

  upgrade: ->
    switch @upgrade_level
      when 0 then log.msg(5)
      when 1 then log.msg(5)
      when 2 then log.msg(5)
