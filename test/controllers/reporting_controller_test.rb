require 'test_helper'

class ReportingControllerTest < ActionController::TestCase

  setup do
    @request.env['reseller'] = resellers(:reseller_one)
  end

  test 'should get reporting page if authenticated and have fleet device' do
    sign_in(users(:user_one))

    get :index

    assert_response :success
  end

  test 'admin cannot get reporting' do
    sign_in(users(:user_admin))

    get :index

    assert_response :not_found
  end

  test 'should not get reporting page if not authenticated' do
    get :index

    assert_response 302
  end
end
