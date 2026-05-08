module Authenticatable
  extend ActiveSupport::Concern

  included do
    before_action :authenticate_user!
  end

  private

  def authenticate_user!
    render json: { errors: ["Unauthorized"] }, status: :unauthorized and return unless current_user
  end

  def current_user
    @current_user ||= begin
      header = request.headers["Authorization"]
      token = header&.split(" ")&.last
      payload = token && JsonWebToken.decode(token)
      User.find_by(id: payload[:user_id]) if payload
    end
  end
end
