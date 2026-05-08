require "rails_helper"

RSpec.describe Course, type: :model do
  it "is valid with valid attributes" do
    expect(build(:course)).to be_valid
  end

  it "requires name >= 3 chars" do
    expect(build(:course, name: "ab")).not_to be_valid
  end

  it "rejects end_date before start_date" do
    course = build(:course, start_date: Date.today, end_date: Date.today - 1)
    expect(course).not_to be_valid
    expect(course.errors[:end_date]).to be_present
  end

  it "allows end_date == start_date" do
    expect(build(:course, start_date: Date.today, end_date: Date.today)).to be_valid
  end

  describe "#editable_by?" do
    let(:user)    { create(:user) }
    let(:other)   { create(:user) }
    let(:course)  { create(:course, creator: user) }

    it "true for creator" do
      expect(course.editable_by?(user)).to be true
    end

    it "false for other user" do
      expect(course.editable_by?(other)).to be false
    end
  end

  describe ".search_by_name" do
    it "filters case-insensitive" do
      create(:course, name: "Ruby on Rails")
      create(:course, name: "Python Basics")
      expect(Course.search_by_name("ruby").count).to eq(1)
    end
  end
end
