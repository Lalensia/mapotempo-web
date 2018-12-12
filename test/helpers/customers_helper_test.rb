require 'test_helper'

class CustomersHelperTest < ActionView::TestCase

  test 'display warning information if at least one vehicle have unauthorized router for profile' do
    vehicle = vehicles(:vehicle_one)
    vehicle.update_attribute(:router_id, routers(:router_two).id)

    assert has_vehicle_with_unauthorized_router(customers(:customer_one))
  end

  test 'display warning information if at least one user have unauthorized layer for profile' do
    assert has_user_with_unauthorized_layer(customers(:customer_one))
  end
end
