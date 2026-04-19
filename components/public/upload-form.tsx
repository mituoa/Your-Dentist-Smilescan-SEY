"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { submitUpload } from "@/app/doc/[slug]/upload/actions";
import { PhotoDropzone } from "./photo-dropzone";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface UploadFormProps {
  slug: string;
  practiceName: string;
  workspaceId: string;
}

export function UploadForm({
  slug,
  practiceName,
  workspaceId,
}: UploadFormProps) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [uploadProgress, setUploadProgress] = useState<string>("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    if (files.length === 0) {
      setError("Mindestens ein Foto erforderlich.");
      return;
    }

    const formEl = e.currentTarget;
    const formData = new FormData(formEl);

    startTransition(async () => {
      try {
        const storagePaths: string[] = [];
        for (let i = 0; i < files.length; i++) {
          setUploadProgress(`Lade Foto ${i + 1} von ${files.length} hoch…`);
          const fileFormData = new FormData();
          fileFormData.append("file", files[i]);
          fileFormData.append("workspace_id", workspaceId);

          const res = await fetch("/api/upload", {
            method: "POST",
            body: fileFormData,
          });

          if (!res.ok) {
            const errData = await res.json();
            setError(errData.error || "Upload fehlgeschlagen.");
            setUploadProgress("");
            return;
          }

          const data = await res.json();
          storagePaths.push(data.storagePath);
        }

        setUploadProgress("Einsendung wird erstellt…");

        formData.set("slug", slug);
        formData.set("storage_paths", JSON.stringify(storagePaths));

        const result = await submitUpload(formData);

        if (result.error) {
          setError(result.error);
          setUploadProgress("");
        } else {
          router.push(`/doc/${slug}/upload/success`);
        }
      } catch (err) {
        console.error(err);
        setError("Unerwarteter Fehler. Bitte erneut versuchen.");
        setUploadProgress("");
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <Label htmlFor="patient_name">Name *</Label>
        <Input
          id="patient_name"
          name="patient_name"
          type="text"
          required
          autoComplete="name"
          placeholder="Vor- und Nachname"
        />
      </div>

      <div>
        <Label htmlFor="patient_email">E-Mail *</Label>
        <Input
          id="patient_email"
          name="patient_email"
          type="email"
          required
          autoComplete="email"
          placeholder="name@beispiel.de"
        />
      </div>

      <div>
        <Label htmlFor="patient_phone">Telefon (optional)</Label>
        <Input
          id="patient_phone"
          name="patient_phone"
          type="tel"
          autoComplete="tel"
          placeholder="+49 123 456789"
        />
      </div>

      <div>
        <Label htmlFor="patient_notes">Anliegen (optional)</Label>
        <textarea
          id="patient_notes"
          name="patient_notes"
          rows={4}
          placeholder="Was möchten Sie uns mitteilen?"
          className="w-full px-3 py-2 text-sm bg-surface-card border border-border rounded focus:outline-none focus:ring-2 focus:ring-brand/40 focus:border-brand resize-none"
        />
      </div>

      <div>
        <Label>Fotos *</Label>
        <PhotoDropzone onFilesChange={setFiles} />
      </div>

      {error && (
        <div className="p-3 bg-danger/10 text-danger rounded text-sm">
          {error}
        </div>
      )}

      {uploadProgress && !error && (
        <div className="p-3 bg-brand/10 text-brand rounded text-sm">
          {uploadProgress}
        </div>
      )}

      <div className="pt-2 border-t border-border">
        <p className="text-xs text-text-tertiary mb-4 leading-relaxed">
          Mit dem Absenden stimmen Sie zu, dass Ihre Daten und Fotos zum Zweck
          der Kontaktaufnahme an {practiceName} übermittelt werden.
        </p>
        <Button
          type="submit"
          disabled={isPending || files.length === 0}
          className="w-full"
          size="lg"
        >
          {isPending ? "Wird gesendet…" : "Jetzt einsenden"}
        </Button>
      </div>
    </form>
  );
}
