module Api
  module V1
    class LessonsController < BaseController
      before_action :set_course,  only: [:index, :create]
      before_action :set_lesson,  only: [:show, :update, :destroy]
      before_action :authorize_course_owner!, only: [:create]
      before_action :authorize_lesson_owner!, only: [:update, :destroy]

      def index
        lessons = @course.lessons.by_status(params[:status]).order(created_at: :asc)
        render json: { data: lessons.map { |l| serialize_lesson(l) } }
      end

      def show
        render json: { data: serialize_lesson(@lesson) }
      end

      def create
        lesson = @course.lessons.build(lesson_params)
        if lesson.save
          render json: { data: serialize_lesson(lesson) }, status: :created
        else
          render json: { errors: lesson.errors.full_messages }, status: :unprocessable_entity
        end
      end

      def update
        if @lesson.update(lesson_params)
          render json: { data: serialize_lesson(@lesson) }
        else
          render json: { errors: @lesson.errors.full_messages }, status: :unprocessable_entity
        end
      end

      def destroy
        @lesson.destroy
        head :no_content
      end

      private

      def set_course
        @course = Course.find(params[:course_id])
      end

      def set_lesson
        @lesson = Lesson.find(params[:id])
      end

      def authorize_course_owner!
        return if @course.editable_by?(current_user)
        render json: { errors: ["Forbidden"] }, status: :forbidden
      end

      def authorize_lesson_owner!
        return if @lesson.editable_by?(current_user)
        render json: { errors: ["Forbidden"] }, status: :forbidden
      end

      def lesson_params
        params.require(:lesson).permit(:title, :status, :video_url)
      end

      def serialize_lesson(lesson)
        {
          id: lesson.id,
          title: lesson.title,
          status: lesson.status,
          video_url: lesson.video_url,
          course_id: lesson.course_id,
          editable: lesson.editable_by?(current_user)
        }
      end
    end
  end
end
