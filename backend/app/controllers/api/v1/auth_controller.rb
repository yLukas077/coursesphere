module Api
  module V1
    class AuthController < ApplicationController
      include Authenticatable
      skip_before_action :authenticate_user!, only: [:register, :login]

      def register
        user = User.new(user_params)
        if user.save
          render json: { user: serialize_user(user), token: user.generate_jwt }, status: :created
        else
          render json: { errors: user.errors.full_messages }, status: :unprocessable_entity
        end
      end

      def login
        user = User.find_by(email: params[:email].to_s.downcase.strip)
        if user&.authenticate(params[:password])
          render json: { user: serialize_user(user), token: user.generate_jwt }
        else
          render json: { errors: ["Invalid email or password"] }, status: :unauthorized
        end
      end

      def me
        render json: { user: serialize_user(current_user) }
      end

      private

      def user_params
        params.require(:user).permit(:name, :email, :password)
      end

      def serialize_user(user)
        { id: user.id, name: user.name, email: user.email }
      end
    end
  end
end
