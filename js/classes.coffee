window.game =
  players: []
  dev_cards: []  
  hexes: []
  roads: []
  buildings: []
  rows: 0
  die_roll: null
  active_player: null

  add_player: ->
    new_player = new Player
    unless @active_player
      new_player.activate()

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
  find_buildings: (id) ->
    @buildings[parseInt(id)]
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
  populate_buildings: ->
    non_sea_hexes = _.filter game.hexes, (hex) ->
      hex.type != 'sea'
    for hex in non_sea_hexes
      for i in [0..5]
        hex.gain_new_building(i)
  roll_dice: ->
    @die_roll = 0
    for die in $('.die span')
      roll = Math.floor(Math.random()*5)
      @die_roll += (roll+1)
      $(die).html("&#x268#{roll};")
    roller = game.active_player
    log.msg("#{roller.name_span()} rolled <b>#{@die_roll}</b>.")

class Player
  constructor: ->
    @id = game.players.length
    game.players.push @
    
    @name = "Player #{@id+1}"

    @red = @random_color()
    @green = @random_color()
    @blue = @random_color()
    @make_css_rules()

    @dom_box = @build()
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
  build: ->
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

class Hex
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
    @player = player
    @dom_representation.addClass("player-#{player.id}-bg owned")
  disown: ->
    @dom_representation.removeClass("player-#{@player.id}-bg owned")
    @player = null

class Road extends Ownable
  constructor: (hex, pos) ->
    super(hex, pos, game.roads)
    @buildings = new Array(6)
    @hexes = [hex, hex.adj_hexes[pos]]
    @dom_representation = @build()

  build: ->
    new_road = $('<div>')
      .addClass("road pos-#{@pos}")
      .appendTo(@hex.dom_hex)

class Building extends Ownable
  constructor: (hex, pos) ->
    super(hex, pos, game.buildings)
    @hexes = new Array(6)
    @roads = new Array(2)
    # @associate_hexes()
    
    @dom_representation = @build()
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
      .addClass("building circle pos-#{@pos}")
      .appendTo(@hex.dom_hex)