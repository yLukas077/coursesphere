module RequestHelpers
  def auth_headers(user)
    { "Authorization" => "Bearer #{user.generate_jwt}" }
  end

  def json
    JSON.parse(response.body)
  end
end
