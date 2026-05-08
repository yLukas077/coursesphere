import { useQuery } from "@tanstack/react-query";
import axios from "axios";

export interface GuestInstructor {
  name: string;
  email: string;
  picture: string;
  country: string;
}

// Usa o ID do curso como seed pra ter consistência entre reloads
export function useGuestInstructor(courseId: number | string | undefined) {
  return useQuery<GuestInstructor>({
    queryKey: ["guest-instructor", courseId],
    enabled: !!courseId,
    staleTime: Infinity,
    queryFn: async () => {
      const r = await axios.get(`https://randomuser.me/api/?seed=course-${courseId}&nat=br,us,gb`);
      const u = r.data.results[0];
      return {
        name: `${u.name.first} ${u.name.last}`,
        email: u.email,
        picture: u.picture.large,
        country: u.location.country,
      };
    },
  });
}
