import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Select } from "@/components/ui/Select";
import type { LessonInput } from "./api";

interface Props {
  onSubmit: (data: LessonInput) => Promise<void>;
  onCancel: () => void;
  submitting?: boolean;
}

export function LessonForm({ onSubmit, onCancel, submitting }: Props) {
  const [title, setTitle] = useState("");
  const [status, setStatus] = useState<"draft" | "published">("draft");
  const [videoUrl, setVideoUrl] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSubmit({ title, status, video_url: videoUrl || undefined });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="title">Título</Label>
        <Input id="title" required minLength={3} value={title} onChange={(e) => setTitle(e.target.value)} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="status">Status</Label>
        <Select id="status" value={status} onChange={(e) => setStatus(e.target.value as any)}>
          <option value="draft">Rascunho</option>
          <option value="published">Publicada</option>
        </Select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="video_url">URL do vídeo (opcional)</Label>
        <Input
          id="video_url"
          type="url"
          placeholder="https://..."
          value={videoUrl}
          onChange={(e) => setVideoUrl(e.target.value)}
        />
      </div>
      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" disabled={submitting}>
          {submitting ? "Salvando..." : "Salvar"}
        </Button>
      </div>
    </form>
  );
}
