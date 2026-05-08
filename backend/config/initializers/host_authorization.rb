if Rails.env.production?
  hosts = ENV.fetch("ALLOWED_HOSTS", "").split(",").map(&:strip).reject(&:empty?)
  Rails.application.config.hosts.concat(hosts) if hosts.any?
  Rails.application.config.host_authorization = { exclude: ->(request) { request.path == "/up" } }
end