module Api
  module V1
    class CoursesController < BaseController
      before_action :set_course,    only: [:show, :update, :destroy]
      before_action :authorize_owner!, only: [:update, :destroy]

      def index
        page     = (params[:page] || 1).to_i
        per_page = (params[:per_page] || 10).to_i.clamp(1, 50)

        scope = Course.search_by_name(params[:q]).order(created_at: :desc)
        total = scope.count
        courses = scope.offset((page - 1) * per_page).limit(per_page)

        render json: {
          data: courses.map { |c| serialize_course(c) },
          meta: { page: page, per_page: per_page, total: total }
        }
      end

      def show
        render json: { data: serialize_course(@course, include_creator: true) }
      end

      def create
        course = current_user.created_courses.build(course_params)
        if course.save
          render json: { data: serialize_course(course) }, status: :created
        else
          render json: { errors: course.errors.full_messages }, status: :unprocessable_entity
        end
      end

      def update
        if @course.update(course_params)
          render json: { data: serialize_course(@course) }
        else
          render json: { errors: @course.errors.full_messages }, status: :unprocessable_entity
        end
      end

      def destroy
        @course.destroy
        head :no_content
      end

      private

      def set_course
        @course = Course.find(params[:id])
      end

      def authorize_owner!
        return if @course.editable_by?(current_user)
        render json: { errors: ["Forbidden"] }, status: :forbidden
      end

      def course_params
        params.require(:course).permit(:name, :description, :start_date, :end_date)
      end

      def serialize_course(course, include_creator: false)
        data = {
          id: course.id,
          name: course.name,
          description: course.description,
          start_date: course.start_date,
          end_date: course.end_date,
          creator_id: course.creator_id,
          lessons_count: course.lessons.size,
          editable: course.editable_by?(current_user)
        }
        if include_creator
          data[:creator] = { id: course.creator.id, name: course.creator.name }
        end
        data
      end
    end
  end
end
