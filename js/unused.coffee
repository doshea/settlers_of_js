window.graph_richness = (n) ->
  for i in [1..n]
    game.populate_hexes()
    r = stats.calculate_richness()
    if richnesses[r]
      richnesses[r] += 1
    else
      richnesses[r] = 1
  richness_keys = _.keys(richnesses)
  richness_values = _.values(richnesses)
  current_richness_as_array = _.map richnesses, (v, k) ->
    kint = parseInt(k)
    (kint == stats.calculate_richness())*(_.max(richnesses))

  data =
    labels: richness_keys
    datasets: [
      {
        label: 'Richness Distribution'
        data: richness_values
      },
      {
        label: 'Current Richness'
        fillColor: "rgba(151,187,205,1)"
        pointColor: '#666'
        data: current_richness_as_array
      }
    ]
  ctx = document.getElementById("myChart").getContext("2d")
  myBarChart = new Chart(ctx).Line(data, {'bezierCurve': false})