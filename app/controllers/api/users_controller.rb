class Api::UsersController < ApplicationController
  wrap_parameters format: []
  skip_before_action :authorize, only: :create

  def create
    user = User.create!(user_params)
    session[:user_id] = user.id
    UserMailer.with(user: user).send_signup_confirmation_email.deliver_later
    render json: user, status: :created
  end

  def show
    if @current_user
      render json: @current_user, status: :ok
    else
      render json: { errors: ["User Not Found"] }, status: 404
    end
  end

  private

  def user_params
    params.permit(:full_name, :email_address, :password, :password_confirmation)
  end
end
