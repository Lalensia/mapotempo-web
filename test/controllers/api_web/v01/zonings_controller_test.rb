require 'test_helper'
require 'pp'

class ApiWeb::V01::ZoningsControllerTest < ActionController::TestCase
  setup do
    @request.env['reseller'] = resellers(:reseller_one)
    @zoning = zonings(:zoning_one)
    sign_in users(:user_one)
  end

  test 'user can only view zonings from its customer' do
    ability = Ability.new(users(:user_one))
    assert ability.can? :manage, @zoning
    ability = Ability.new(users(:user_three))
    assert ability.cannot? :manage, @zoning

    assert @controller.can?(:edit, @zoning)
    assert @controller.cannot?(:edit, zonings(:zoning_three))

    get :edit, id: zonings(:zoning_three)
    assert_response :not_found
  end

  test 'should sign in with api_key' do
    sign_out users(:user_one)
    get :edit, id: @zoning, api_key: 'testkey1'
    assert_response :success
    assert_not_nil assigns(:zoning)
  end

  test 'should get edit' do
    get :edit, id: @zoning
    assert_response :success
    assert_valid response
  end

  test 'should update zoning' do
    patch :update, id: @zoning, zoning: { name: @zoning.name }
    assert_redirected_to api_web_v01_edit_zoning_path(assigns(:zoning))
  end
end
