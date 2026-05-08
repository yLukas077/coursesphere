require "rails_helper"

RSpec.describe "Api::V1::Auth", type: :request do
  describe "POST /api/v1/auth/register" do
    it "creates user and returns token" do
      post "/api/v1/auth/register", params: {
        user: { name: "John", email: "john@x.com", password: "password123" }
      }
      expect(response).to have_http_status(:created)
      expect(json["token"]).to be_present
      expect(json["user"]["email"]).to eq("john@x.com")
    end

    it "returns errors on invalid data" do
      post "/api/v1/auth/register", params: { user: { name: "", email: "bad", password: "1" } }
      expect(response).to have_http_status(:unprocessable_entity)
      expect(json["errors"]).to be_an(Array)
    end
  end

  describe "POST /api/v1/auth/login" do
    let!(:user) { create(:user, email: "a@b.com", password: "password123") }

    it "returns token on valid credentials" do
      post "/api/v1/auth/login", params: { email: "a@b.com", password: "password123" }
      expect(response).to have_http_status(:ok)
      expect(json["token"]).to be_present
    end

    it "rejects bad password" do
      post "/api/v1/auth/login", params: { email: "a@b.com", password: "wrong" }
      expect(response).to have_http_status(:unauthorized)
    end
  end

  describe "GET /api/v1/auth/me" do
    let(:user) { create(:user) }

    it "returns current user with valid token" do
      get "/api/v1/auth/me", headers: auth_headers(user)
      expect(response).to have_http_status(:ok)
      expect(json["user"]["id"]).to eq(user.id)
    end

    it "returns 401 without token" do
      get "/api/v1/auth/me"
      expect(response).to have_http_status(:unauthorized)
    end
  end
end
