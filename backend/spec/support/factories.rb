FactoryBot.define do
  factory :user do
    sequence(:name)  { |n| "User #{n}" }
    sequence(:email) { |n| "user#{n}@test.dev" }
    password         { "password123" }
  end

  factory :course do
    sequence(:name) { |n| "Course #{n}" }
    description     { "A great course" }
    start_date      { Date.today }
    end_date        { Date.today + 30 }
    association     :creator, factory: :user
  end

  factory :lesson do
    sequence(:title) { |n| "Lesson #{n}" }
    status           { "draft" }
    association      :course
  end
end
