require "rails_helper"

RSpec.describe Lesson, type: :model do
  it "is valid with valid attributes" do
    expect(build(:lesson)).to be_valid
  end

  it "requires status in allowed list" do
    expect(build(:lesson, status: "weird")).not_to be_valid
  end

  it "rejects invalid video_url" do
    expect(build(:lesson, video_url: "not-a-url")).not_to be_valid
  end

  it "accepts blank video_url" do
    expect(build(:lesson, video_url: nil)).to be_valid
  end
end
