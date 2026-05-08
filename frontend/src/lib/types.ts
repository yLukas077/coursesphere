export interface User {
  id: number;
  name: string;
  email: string;
}

export interface Course {
  id: number;
  name: string;
  description: string | null;
  start_date: string;
  end_date: string;
  creator_id: number;
  lessons_count: number;
  editable: boolean;
  creator?: { id: number; name: string };
}

export interface Lesson {
  id: number;
  title: string;
  status: "draft" | "published";
  video_url: string | null;
  course_id: number;
  editable: boolean;
}

export interface Paginated<T> {
  data: T[];
  meta: { page: number; per_page: number; total: number };
}
