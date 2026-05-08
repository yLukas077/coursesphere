require "rails_helper"

RSpec.describe "Api::V1::Courses", type: :request do
  let(:user)  { create(:user) }
  let(:other) { create(:user) }

  describe "GET /api/v1/courses" do
    before { create_list(:course, 3, creator: user) }

    it "lists courses with pagination meta" do
      get "/api/v1/courses", headers: auth_headers(user)
      expect(response).to have_http_status(:ok)
      expect(json["data"].size).to eq(3)
      expect(json["meta"]["total"]).to eq(3)
    end

    it "filters by name" do
      create(:course, name: "Unique Match Course", creator: user)
      get "/api/v1/courses", params: { q: "unique" }, headers: auth_headers(user)
      expect(json["data"].size).to eq(1)
    end

    it "requires auth" do
      get "/api/v1/courses"
      expect(response).to have_http_status(:unauthorized)
    end
  end

  describe "POST /api/v1/courses" do
    it "creates a course owned by current_user" do
      post "/api/v1/courses",
           params: { course: { name: "New Course", start_date: Date.today, end_date: Date.today + 1 } },
           headers: auth_headers(user)
      expect(response).to have_http_status(:created)
      expect(json["data"]["creator_id"]).to eq(user.id)
    end
  end

  describe "PUT /api/v1/courses/:id" do
    let!(:course) { create(:course, creator: user) }

    it "creator can update" do
      put "/api/v1/courses/#{course.id}",
          params: { course: { name: "Updated" } },
          headers: auth_headers(user)
      expect(response).to have_http_status(:ok)
      expect(json["data"]["name"]).to eq("Updated")
    end

    it "non-creator gets 403" do
      put "/api/v1/courses/#{course.id}",
          params: { course: { name: "Hacked" } },
          headers: auth_headers(other)
      expect(response).to have_http_status(:forbidden)
    end
  end

  describe "DELETE /api/v1/courses/:id" do
    let!(:course) { create(:course, creator: user) }

    it "creator can delete" do
      delete "/api/v1/courses/#{course.id}", headers: auth_headers(user)
      expect(response).to have_http_status(:no_content)
    end

    it "non-creator gets 403" do
      delete "/api/v1/courses/#{course.id}", headers: auth_headers(other)
      expect(response).to have_http_status(:forbidden)
    end
  end
end
