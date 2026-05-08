class CreateLessons < ActiveRecord::Migration[7.1]
  def change
    create_table :lessons do |t|
      t.string :title, null: false
      t.string :status, null: false, default: "draft"
      t.string :video_url
      t.references :course, null: false, foreign_key: true
      t.timestamps
    end

    add_index :lessons, :status
  end
end
