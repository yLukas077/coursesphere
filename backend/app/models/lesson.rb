class Lesson < ApplicationRecord
  STATUSES = %w[draft published].freeze

  belongs_to :course

  validates :title,  presence: true, length: { minimum: 3, maximum: 150 }
  validates :status, inclusion: { in: STATUSES }
  validates :video_url, format: { with: URI::DEFAULT_PARSER.make_regexp(%w[http https]) },
                        allow_blank: true

  scope :by_status, ->(status) {
    return all if status.blank?
    where(status: status)
  }

  def editable_by?(user)
    course.editable_by?(user)
  end
end
