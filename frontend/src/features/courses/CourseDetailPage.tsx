import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { toast } from "sonner";
import { ArrowLeft, Pencil, Trash2, Plus, Calendar, ExternalLink, UserCircle } from "lucide-react";
import { useCourse, useUpdateCourse, useDeleteCourse, type CourseInput } from "./api";
import { useLessons, useCreateLesson, useDeleteLesson, type LessonInput } from "../lessons/api";
import { useGuestInstructor } from "./randomuser";
import { CourseForm } from "./CourseForm";
import { LessonForm } from "../lessons/LessonForm";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Select } from "@/components/ui/Select";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { extractApiError } from "@/lib/api";
import { formatDate } from "@/lib/utils";

export default function CourseDetailPage() {
  const { id } = useParams();
  const courseId = Number(id);
  const navigate = useNavigate();

  const [statusFilter, setStatusFilter] = useState("");
  const [editOpen, setEditOpen] = useState(false);
  const [newLessonOpen, setNewLessonOpen] = useState(false);

  const { data: course, isLoading } = useCourse(courseId);
  const { data: lessons } = useLessons(courseId, statusFilter);
  const { data: guest } = useGuestInstructor(courseId);
  const update = useUpdateCourse(courseId);
  const remove = useDeleteCourse();
  const createLesson = useCreateLesson(courseId);
  const deleteLesson = useDeleteLesson(courseId);

  if (isLoading) return <div className="text-center py-12 text-muted-foreground">Carregando...</div>;
  if (!course) return <div className="text-center py-12">Curso não encontrado.</div>;

  async function handleUpdate(input: CourseInput) {
    try {
      await update.mutateAsync(input);
      toast.success("Curso atualizado!");
      setEditOpen(false);
    } catch (err) {
      toast.error(extractApiError(err, "Erro ao atualizar"));
    }
  }

  async function handleDelete() {
    if (!confirm("Tem certeza que deseja excluir este curso?")) return;
    try {
      await remove.mutateAsync(courseId);
      toast.success("Curso excluído");
      navigate("/courses");
    } catch (err) {
      toast.error(extractApiError(err, "Erro ao excluir"));
    }
  }

  async function handleCreateLesson(input: LessonInput) {
    try {
      await createLesson.mutateAsync(input);
      toast.success("Aula criada!");
      setNewLessonOpen(false);
    } catch (err) {
      toast.error(extractApiError(err, "Erro ao criar aula"));
    }
  }

  async function handleDeleteLesson(lessonId: number) {
    if (!confirm("Excluir esta aula?")) return;
    try {
      await deleteLesson.mutateAsync(lessonId);
      toast.success("Aula excluída");
    } catch (err) {
      toast.error(extractApiError(err, "Erro ao excluir aula"));
    }
  }

  return (
    <div className="space-y-6">
      <Link to="/courses" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4 mr-1" /> Voltar
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-start justify-between gap-4">
              <div>
                <CardTitle className="text-2xl">{course.name}</CardTitle>
                <p className="text-muted-foreground mt-1">{course.description || "Sem descrição"}</p>
              </div>
              {course.editable && (
                <div className="flex gap-2 shrink-0">
                  <Button variant="outline" size="sm" onClick={() => setEditOpen(true)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button variant="destructive" size="sm" onClick={handleDelete}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              {formatDate(course.start_date)} → {formatDate(course.end_date)}
            </div>
            {course.creator && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground mt-2">
                <UserCircle className="h-4 w-4" />
                Criado por {course.creator.name}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Instrutor convidado</CardTitle>
          </CardHeader>
          <CardContent>
            {guest ? (
              <div className="flex items-center gap-3">
                <img src={guest.picture} alt={guest.name} className="h-14 w-14 rounded-full" />
                <div>
                  <p className="font-medium">{guest.name}</p>
                  <p className="text-xs text-muted-foreground">{guest.country}</p>
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Carregando...</p>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-semibold">Aulas</h2>
          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-auto"
          >
            <option value="">Todas</option>
            <option value="draft">Rascunhos</option>
            <option value="published">Publicadas</option>
          </Select>
        </div>
        {course.editable && (
          <Button size="sm" onClick={() => setNewLessonOpen(true)}>
            <Plus className="h-4 w-4 mr-2" /> Nova aula
          </Button>
        )}
      </div>

      <div className="space-y-2">
        {lessons?.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              Nenhuma aula encontrada.
            </CardContent>
          </Card>
        ) : (
          lessons?.map((l) => (
            <Card key={l.id}>
              <CardContent className="py-4 flex items-center justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-medium">{l.title}</h3>
                    <Badge variant={l.status === "published" ? "success" : "outline"}>
                      {l.status === "published" ? "publicada" : "rascunho"}
                    </Badge>
                  </div>
                  {l.video_url && (
                    <a
                      href={l.video_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-primary hover:underline inline-flex items-center gap-1 mt-1"
                    >
                      <ExternalLink className="h-3 w-3" /> {l.video_url}
                    </a>
                  )}
                </div>
                {l.editable && (
                  <Button variant="ghost" size="icon" onClick={() => handleDeleteLesson(l.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <Modal open={editOpen} onClose={() => setEditOpen(false)} title="Editar curso">
        <CourseForm
          initial={course}
          onSubmit={handleUpdate}
          onCancel={() => setEditOpen(false)}
          submitting={update.isPending}
        />
      </Modal>

      <Modal open={newLessonOpen} onClose={() => setNewLessonOpen(false)} title="Nova aula">
        <LessonForm
          onSubmit={handleCreateLesson}
          onCancel={() => setNewLessonOpen(false)}
          submitting={createLesson.isPending}
        />
      </Modal>
    </div>
  );
}
