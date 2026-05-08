import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { Lesson } from "@/lib/types";

export interface LessonInput {
  title: string;
  status: "draft" | "published";
  video_url?: string;
}

export function useLessons(courseId: number | string | undefined, status?: string) {
  return useQuery<Lesson[]>({
    queryKey: ["lessons", courseId, status],
    enabled: !!courseId,
    queryFn: async () =>
      (await api.get(`/courses/${courseId}/lessons`, { params: { status: status || undefined } })).data.data,
  });
}

export function useCreateLesson(courseId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: LessonInput) =>
      (await api.post(`/courses/${courseId}/lessons`, { lesson: input })).data.data as Lesson,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["lessons", courseId] });
      qc.invalidateQueries({ queryKey: ["course", courseId] });
    },
  });
}

export function useDeleteLesson(courseId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => api.delete(`/lessons/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["lessons", courseId] }),
  });
}
