import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { Course, Paginated } from "@/lib/types";

export interface CourseInput {
  name: string;
  description?: string;
  start_date: string;
  end_date: string;
}

export function useCourses(params: { q?: string; page?: number; per_page?: number } = {}) {
  return useQuery<Paginated<Course>>({
    queryKey: ["courses", params],
    queryFn: async () => (await api.get("/courses", { params })).data,
  });
}

export function useCourse(id: number | string | undefined) {
  return useQuery<Course>({
    queryKey: ["course", id],
    enabled: !!id,
    queryFn: async () => (await api.get(`/courses/${id}`)).data.data,
  });
}

export function useCreateCourse() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: CourseInput) => (await api.post("/courses", { course: input })).data.data as Course,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["courses"] }),
  });
}

export function useUpdateCourse(id: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: CourseInput) =>
      (await api.put(`/courses/${id}`, { course: input })).data.data as Course,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["courses"] });
      qc.invalidateQueries({ queryKey: ["course", id] });
    },
  });
}

export function useDeleteCourse() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => api.delete(`/courses/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["courses"] }),
  });
}
