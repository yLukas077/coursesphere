class User < ApplicationRecord
  has_secure_password

  has_many :created_courses, class_name: "Course", foreign_key: :creator_id, dependent: :destroy

  validates :name,  presence: true, length: { minimum: 2, maximum: 100 }
  validates :email, presence: true,
                    uniqueness: { case_sensitive: false },
                    format: { with: URI::MailTo::EMAIL_REGEXP }
  validates :password, length: { minimum: 6 }, if: -> { password.present? }

  before_save { self.email = email.downcase.strip }

  def generate_jwt
    JsonWebToken.encode(user_id: id)
  end
end
