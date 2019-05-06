require 'test_helper'

class UsersControllerTest < ActionController::TestCase

  setup do
    @request.env['reseller'] = resellers(:reseller_one)
    @user = users(:user_one)
    sign_in users(:user_one)
  end

  test 'user can only manage itself' do
    ability = Ability.new(@user)
    assert ability.can? :edit, @user
    assert ability.can? :update, @user
    ability = Ability.new(users(:user_three))
    assert ability.cannot? :manage, @user

    get :edit, id: users(:user_three)
    assert_response :not_found
  end

  test 'admin user can only manage users from its customer' do
    ability = Ability.new(users(:user_admin))
    assert ability.can? :manage, users(:user_one)
    assert ability.cannot? :manage, users(:user_three)
  end

  test 'should get edit' do
    get :edit, id: @user
    assert_response :success
    assert_valid response
  end

  test 'should get edit as admin' do
    @user = users(:user_admin)
    sign_in(@user)

    get :edit, id: @user
    assert_response :success
    assert_valid response
  end

  test 'should update user' do
    patch :update, id: @user, user: { layer_id: @user.layer.id }
    assert_redirected_to edit_user_path(@user)
  end

  test 'should update user as admin' do
    @user = users(:user_admin)
    sign_in(@user)

    patch :update, id: @user, user: { layer_id: @user.layer.id }
    assert_redirected_to edit_user_path(@user)
  end

  test 'should get edit password' do
    sign_out(@user)
    user = users(:unconfirmed_user)
    get :password, id: user.id, token: user.confirmation_token
    assert_response :success
    assert_valid response
  end

  test 'should update user password' do
    sign_out(@user)
    @user = users(:unconfirmed_user)
    assert !@user.confirmed?
    patch :set_password, id: @user.id, token: @user.confirmation_token, user: { password: "abcd1212", password_confirmation: "abcd1212" }
    assert assigns(:user).confirmed?
    assert_redirected_to edit_user_path(@user)
  end

  test 'should update user password and set the trackable fields' do
    sign_out(@user)
    @user = users(:unconfirmed_user)
    assert !@user.confirmed?
    patch :set_password, id: @user.id, token: @user.confirmation_token, user: {password: 'abcd1212', password_confirmation: 'abcd1212'}

    assert assigns(:user).confirmed?
    assert_redirected_to edit_user_path(@user)

    @user.reload
    assert_not_nil @user.sign_in_count
    assert_not_nil @user.current_sign_in_at
    assert_not_nil @user.last_sign_in_at
    assert_not_nil @user.current_sign_in_ip
    assert_not_nil @user.last_sign_in_ip
  end
end
