class Course < ApplicationRecord
  belongs_to :creator, class_name: "User"
  has_many :lessons, dependent: :destroy

  validates :name,       presence: true, length: { minimum: 3, maximum: 150 }
  validates :start_date, presence: true
  validates :end_date,   presence: true
  validate  :end_date_after_or_equal_start_date

  scope :search_by_name, ->(query) {
    return all if query.blank?
    where("LOWER(name) LIKE ?", "%#{query.downcase}%")
  }

  def editable_by?(user)
    user.present? && creator_id == user.id
  end

  private

  def end_date_after_or_equal_start_date
    return if end_date.blank? || start_date.blank?
    errors.add(:end_date, "must be on or after start date") if end_date < start_date
  end
end
