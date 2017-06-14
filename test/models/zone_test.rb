require 'test_helper'

class ZoneTest < ActiveSupport::TestCase

  test 'should not save' do
    zone = Zone.new
    assert_not zone.save, 'Saved without required fields'
  end

  test 'should touch planning changed' do
    zone = zones(:zone_one)
    assert_not zone.zoning.plannings[0].zoning_outdated
    zone.polygon = '{"plop": "plop"}'
    zone.save!
    assert zone.zoning.plannings[0].zoning_outdated
  end

  test 'should touch planning collection changed' do
    zone = zones(:zone_one)
    assert_not zone.zoning.plannings[0].zoning_outdated
    assert zone.vehicle
    zone.vehicle = nil
    zone.save!
    zone.zoning.save!
    zone.reload
    assert zone.zoning.plannings[0].zoning_outdated
  end

  test 'calculate distance between point and simple polygon' do
    zone = zones(:zone_one)
    assert_equal 0.0014045718474348943, zone.inside_distance(49.538, -0.976)
  end

  test 'calculate distance between point and isochrone' do
    zone = zones(:zone_three)
    assert_equal 0.12526897460455758, zone.inside_distance(44.8414, -0.581)
  end

  test 'calculate distance between point and multipolygon' do
    zone = zones(:zone_three)
    zone.polygon = "{\"type\":\"Feature\",\"geometry\":{\"type\":\"MultiPolygon\",\"coordinates\":[[[[-0.5955,44.8405],[-0.5956,44.8403],[-0.5956,44.8402],[-0.5957,44.84],[-0.5958,44.8399],[-0.596,44.8398],[-0.5962,44.8397],[-0.5964,44.8396],[-0.5967,44.8396],[-0.5969,44.8396],[-0.5971,44.8397],[-0.5973,44.8397],[-0.5975,44.8398],[-0.5976,44.8399],[-0.5978,44.8401],[-0.5978,44.8402],[-0.5979,44.8404],[-0.5979,44.8406],[-0.5978,44.8407],[-0.5977,44.8409],[-0.5976,44.841],[-0.5974,44.8411],[-0.5972,44.8412],[-0.597,44.8412],[-0.5968,44.8413],[-0.5965,44.8413],[-0.5963,44.8412],[-0.5961,44.8411],[-0.5959,44.841],[-0.5958,44.8409],[-0.5957,44.8408],[-0.5956,44.8406],[-0.5955,44.8405]]],[[[-0.5884,44.8516],[-0.5884,44.8515],[-0.5885,44.8513],[-0.5886,44.8511],[-0.5887,44.851],[-0.5889,44.8508],[-0.5892,44.8507],[-0.5894,44.8507],[-0.5897,44.8506],[-0.5899,44.8506],[-0.5902,44.8507],[-0.5904,44.8508],[-0.5906,44.8509],[-0.5908,44.851],[-0.591,44.8512],[-0.591,44.8514],[-0.5911,44.8516],[-0.5911,44.8517],[-0.591,44.8519],[-0.5909,44.8521],[-0.5907,44.8522],[-0.5905,44.8524],[-0.5903,44.8525],[-0.5901,44.8525],[-0.5898,44.8526],[-0.5895,44.8525],[-0.5893,44.8525],[-0.589,44.8524],[-0.5888,44.8523],[-0.5887,44.8522],[-0.5885,44.852],[-0.5884,44.8518],[-0.5884,44.8516]]],[[[-0.5833,44.8362],[-0.5835,44.8362],[-0.5837,44.8363],[-0.5845,44.8364],[-0.5852,44.8366],[-0.5858,44.837],[-0.5864,44.8374],[-0.5868,44.8379],[-0.587,44.8383],[-0.5876,44.8383],[-0.5884,44.8385],[-0.5891,44.8387],[-0.5897,44.8391],[-0.5903,44.8395],[-0.5907,44.84],[-0.5909,44.8403],[-0.5909,44.8402],[-0.5911,44.84],[-0.5913,44.8398],[-0.5916,44.8396],[-0.592,44.8394],[-0.5923,44.8393],[-0.5927,44.8393],[-0.5931,44.8393],[-0.5935,44.8394],[-0.5939,44.8395],[-0.5942,44.8397],[-0.5945,44.8399],[-0.5947,44.8401],[-0.5948,44.8404],[-0.5949,44.8407],[-0.5949,44.841],[-0.5948,44.8412],[-0.5946,44.8415],[-0.5943,44.8417],[-0.594,44.8419],[-0.5937,44.8421],[-0.5933,44.8422],[-0.5929,44.8422],[-0.5925,44.8422],[-0.5921,44.8421],[-0.5918,44.842],[-0.5914,44.8418],[-0.5912,44.8416],[-0.591,44.8414],[-0.591,44.8416],[-0.5908,44.8421],[-0.5905,44.8426],[-0.5907,44.8429],[-0.5908,44.8435],[-0.5907,44.844],[-0.5908,44.8442],[-0.5907,44.8447],[-0.5905,44.8453],[-0.5902,44.8458],[-0.5897,44.8462],[-0.5891,44.8466],[-0.5889,44.8467],[-0.5889,44.8467],[-0.5884,44.8472],[-0.5878,44.8476],[-0.5872,44.8479],[-0.5864,44.848],[-0.5861,44.8481],[-0.5861,44.8481],[-0.5862,44.8484],[-0.5866,44.8485],[-0.587,44.8486],[-0.5873,44.8488],[-0.5876,44.849],[-0.5879,44.8493],[-0.588,44.8496],[-0.5881,44.8499],[-0.5881,44.8503],[-0.588,44.8506],[-0.5878,44.8509],[-0.5875,44.8511],[-0.5872,44.8513],[-0.5868,44.8515],[-0.5863,44.8516],[-0.5859,44.8517],[-0.5854,44.8516],[-0.585,44.8516],[-0.5846,44.8514],[-0.5842,44.8512],[-0.5839,44.851],[-0.5836,44.8511],[-0.583,44.851],[-0.5825,44.8509],[-0.582,44.8508],[-0.5815,44.8505],[-0.5811,44.8502],[-0.5809,44.8499],[-0.5807,44.8495],[-0.5806,44.8492],[-0.5798,44.8492],[-0.5791,44.8492],[-0.5783,44.8491],[-0.5778,44.8489],[-0.5776,44.849],[-0.577,44.849],[-0.5764,44.849],[-0.5758,44.8489],[-0.5752,44.8487],[-0.5747,44.8484],[-0.5743,44.8481],[-0.574,44.8477],[-0.5738,44.8473],[-0.5737,44.8469],[-0.5737,44.8464],[-0.5737,44.8463],[-0.5737,44.8463],[-0.5736,44.846],[-0.5736,44.846],[-0.5732,44.846],[-0.5729,44.8459],[-0.5725,44.8457],[-0.5723,44.8455],[-0.5721,44.8452],[-0.5719,44.845],[-0.5719,44.8447],[-0.5719,44.8444],[-0.572,44.8441],[-0.5722,44.8439],[-0.5724,44.8437],[-0.5727,44.8435],[-0.573,44.8433],[-0.5734,44.8432],[-0.5738,44.8432],[-0.5742,44.8432],[-0.5746,44.8433],[-0.5748,44.8431],[-0.5753,44.8428],[-0.5752,44.8428],[-0.5748,44.8423],[-0.5746,44.8417],[-0.5744,44.8412],[-0.5745,44.841],[-0.5744,44.8408],[-0.5743,44.8402],[-0.5743,44.8397],[-0.5745,44.8391],[-0.5748,44.8386],[-0.5753,44.8382],[-0.5759,44.8378],[-0.5766,44.8375],[-0.5773,44.8373],[-0.5781,44.8373],[-0.5783,44.8373],[-0.5787,44.8369],[-0.5788,44.8368],[-0.5788,44.8367],[-0.5788,44.8364],[-0.5789,44.8361],[-0.5791,44.8358],[-0.5794,44.8355],[-0.5797,44.8353],[-0.5801,44.8351],[-0.5806,44.835],[-0.581,44.835],[-0.5815,44.835],[-0.5819,44.8351],[-0.5823,44.8352],[-0.5827,44.8354],[-0.583,44.8356],[-0.5832,44.8359],[-0.5833,44.8362]]]]},\"properties\":{\"Time\":240},\"id\":\"fid--4753c941_14f4b8b40e2_-7ffe\"}"
    assert_equal 0.00490917508345431, zone.inside_distance(44.8414, -0.581)
  end
end
