require "rails_helper"

RSpec.describe "Api::V1::Lessons", type: :request do
  let(:user)   { create(:user) }
  let(:other)  { create(:user) }
  let(:course) { create(:course, creator: user) }

  describe "GET /api/v1/courses/:course_id/lessons" do
    before do
      create(:lesson, course: course, status: "draft")
      create(:lesson, course: course, status: "published")
    end

    it "lists lessons" do
      get "/api/v1/courses/#{course.id}/lessons", headers: auth_headers(user)
      expect(response).to have_http_status(:ok)
      expect(json["data"].size).to eq(2)
    end

    it "filters by status" do
      get "/api/v1/courses/#{course.id}/lessons",
          params: { status: "published" }, headers: auth_headers(user)
      expect(json["data"].size).to eq(1)
      expect(json["data"].first["status"]).to eq("published")
    end
  end

  describe "POST /api/v1/courses/:course_id/lessons" do
    it "creator can create lessons" do
      post "/api/v1/courses/#{course.id}/lessons",
           params: { lesson: { title: "New Lesson", status: "draft" } },
           headers: auth_headers(user)
      expect(response).to have_http_status(:created)
    end

    it "non-creator gets 403" do
      post "/api/v1/courses/#{course.id}/lessons",
           params: { lesson: { title: "X", status: "draft" } },
           headers: auth_headers(other)
      expect(response).to have_http_status(:forbidden)
    end
  end

  describe "DELETE /api/v1/lessons/:id" do
    let!(:lesson) { create(:lesson, course: course) }

    it "creator can delete" do
      delete "/api/v1/lessons/#{lesson.id}", headers: auth_headers(user)
      expect(response).to have_http_status(:no_content)
    end

    it "non-creator gets 403" do
      delete "/api/v1/lessons/#{lesson.id}", headers: auth_headers(other)
      expect(response).to have_http_status(:forbidden)
    end
  end
end
