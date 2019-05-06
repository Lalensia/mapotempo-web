# Copyright © Mapotempo, 2013-2016
#
# This file is part of Mapotempo.
#
# Mapotempo is free software. You can redistribute it and/or
# modify since you respect the terms of the GNU Affero General
# Public License as published by the Free Software Foundation,
# either version 3 of the License, or (at your option) any later version.
#
# Mapotempo is distributed in the hope that it will be useful, but WITHOUT
# ANY WARRANTY; without even the implied warranty of MERCHANTABILITY
# or FITNESS FOR A PARTICULAR PURPOSE.  See the Licenses for more details.
#
# You should have received a copy of the GNU Affero General Public License
# along with Mapotempo. If not, see:
# <http://www.gnu.org/licenses/agpl.html>
#
class UsersController < ApplicationController
  layout 'registration', only: [:password, :set_password]

  load_and_authorize_resource except: [:password, :set_password]
  load_and_authorize_resource find_by: :confirmation_token,
                              id_param: :token,
                              if: ->{ params[:token].present? },
                              only: [:password, :set_password]

  def edit
    if !@user
      redirect_to unauthenticated_root_path, alert: t('users.edit.edit_user')
    end
  end

  def update
    if @user.update user_params
      redirect_to_default
    else
      render action: :edit
    end
  end

  # bypass_sign_in argument is depreciated, we must use bypass_sign_in method instead
  def password
    if current_user != @user
      sign_out :user
      bypass_sign_in(@user)
    end
  end

  def set_password
    if @user.update user_password_params
      @user.confirm! if !@user.confirmed?
      bypass_sign_in(@user)
      redirect_to_default
    else
      render action: :password
    end
  end

  private

  def redirect_to_default
    # @user in case of token auth
    redirect_to edit_user_path(current_user || @user), notice: t("users.#{action_name}.success")
  end

  def user_password_params
    params.require(:user).permit :password, :password_confirmation
  end

  def user_params
    params.require(:user).permit :layer_id, :url_click2call, :time_zone, :prefered_unit
  end
end
