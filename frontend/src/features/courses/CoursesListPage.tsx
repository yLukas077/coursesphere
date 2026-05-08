import { useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { Plus, Search, Calendar, BookOpen } from "lucide-react";
import { useCourses, useCreateCourse, type CourseInput } from "./api";
import { CourseForm } from "./CourseForm";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/Card";
import { extractApiError } from "@/lib/api";
import { formatDate } from "@/lib/utils";

export default function CoursesListPage() {
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const { data, isLoading } = useCourses({ q, page, per_page: 9 });
  const create = useCreateCourse();

  async function handleCreate(input: CourseInput) {
    try {
      await create.mutateAsync(input);
      toast.success("Curso criado!");
      setModalOpen(false);
    } catch (err) {
      toast.error(extractApiError(err, "Erro ao criar curso"));
    }
  }

  const totalPages = Math.max(1, Math.ceil((data?.meta.total ?? 0) / (data?.meta.per_page ?? 9)));

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Cursos</h1>
          <p className="text-muted-foreground">Gerencie seus cursos e aulas.</p>
        </div>
        <Button onClick={() => setModalOpen(true)}>
          <Plus className="h-4 w-4 mr-2" /> Novo curso
        </Button>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar por nome..."
          className="pl-9"
          value={q}
          onChange={(e) => {
            setPage(1);
            setQ(e.target.value);
          }}
        />
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-muted-foreground">Carregando cursos...</div>
      ) : data?.data.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            Nenhum curso encontrado. Clique em "Novo curso" pra começar.
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {data?.data.map((c) => (
              <Card key={c.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <CardTitle className="line-clamp-1">{c.name}</CardTitle>
                  <CardDescription className="line-clamp-2 min-h-[2.5rem]">
                    {c.description || "Sem descrição"}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    {formatDate(c.start_date)} → {formatDate(c.end_date)}
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <BookOpen className="h-4 w-4" />
                    {c.lessons_count} {c.lessons_count === 1 ? "aula" : "aulas"}
                  </div>
                </CardContent>
                <CardFooter>
                  <Button asChild variant="outline" size="sm" className="w-full">
                    <Link to={`/courses/${c.id}`}>Ver detalhes</Link>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 pt-4">
              <Button
                variant="outline"
                size="sm"
                disabled={page === 1}
                onClick={() => setPage((p) => p - 1)}
              >
                Anterior
              </Button>
              <span className="text-sm text-muted-foreground px-2">
                Página {page} de {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                Próxima
              </Button>
            </div>
          )}
        </>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Novo curso">
        <CourseForm onSubmit={handleCreate} onCancel={() => setModalOpen(false)} submitting={create.isPending} />
      </Modal>
    </div>
  );
}
