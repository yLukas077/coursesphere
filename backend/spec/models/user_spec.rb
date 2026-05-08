require "rails_helper"

RSpec.describe User, type: :model do
  it "is valid with valid attributes" do
    expect(build(:user)).to be_valid
  end

  it "requires name" do
    user = build(:user, name: nil)
    expect(user).not_to be_valid
  end

  it "requires unique email" do
    create(:user, email: "x@y.com")
    expect(build(:user, email: "x@y.com")).not_to be_valid
  end

  it "downcases email on save" do
    user = create(:user, email: "FOO@BAR.com")
    expect(user.email).to eq("foo@bar.com")
  end

  it "rejects short password" do
    expect(build(:user, password: "123")).not_to be_valid
  end

  it "generates a JWT" do
    user = create(:user)
    token = user.generate_jwt
    payload = JsonWebToken.decode(token)
    expect(payload[:user_id]).to eq(user.id)
  end
end
