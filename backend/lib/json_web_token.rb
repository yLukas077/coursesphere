require "jwt"

class JsonWebToken
  SECRET = ENV.fetch("JWT_SECRET") { Rails.application.secret_key_base }
  ALGORITHM = "HS256".freeze
  EXPIRATION = 7.days

  class << self
    def encode(payload)
      payload = payload.dup
      payload[:exp] = EXPIRATION.from_now.to_i
      JWT.encode(payload, SECRET, ALGORITHM)
    end

    def decode(token)
      decoded, = JWT.decode(token, SECRET, true, algorithm: ALGORITHM)
      HashWithIndifferentAccess.new(decoded)
    rescue JWT::DecodeError, JWT::ExpiredSignature
      nil
    end
  end
end
