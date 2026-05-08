class ApplicationController < ActionController::API
  rescue_from ActiveRecord::RecordNotFound,    with: :not_found
  rescue_from ActiveRecord::RecordInvalid,     with: :unprocessable
  rescue_from ActionController::ParameterMissing, with: :bad_request

  private

  def not_found(error)
    render json: { errors: [error.message] }, status: :not_found
  end

  def unprocessable(error)
    render json: { errors: error.record.errors.full_messages }, status: :unprocessable_entity
  end

  def bad_request(error)
    render json: { errors: [error.message] }, status: :bad_request
  end
end
