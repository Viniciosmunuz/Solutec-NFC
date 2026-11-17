"use client";

import { useRef, useState } from "react";
import { ImagePlus, Loader2, Trash2, Upload } from "lucide-react";
import { useToast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";

export default function ImageUpload({
  value,
  onChange,
  label,
  hint,
  shape = "circle",
  height = 112,
}: {
  value?: string | null;
  onChange: (url: string | null) => void;
  label: string;
  hint?: string;
  shape?: "circle" | "square" | "wide";
  height?: number;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const { error } = useToast();

  async function upload(file: File) {
    setUploading(true);
    try {
      const body = new FormData();
      body.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Falha no envio.");
      onChange(json.url as string);
    } catch (e) {
      error("Não foi possível enviar a imagem", (e as Error).message);
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  const box =
    shape === "circle"
      ? "rounded-full aspect-square"
      : shape === "square"
        ? "rounded-2xl aspect-square"
        : "rounded-2xl w-full aspect-[16/7]";

  return (
    <div className="flex flex-col gap-2">
      <span className="text-[13px] font-semibold text-[#3b4a68]">{label}</span>
      <div className={cn("flex items-center gap-4", shape === "wide" && "flex-col items-stretch")}>
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className={cn(
            "group relative grid shrink-0 place-items-center overflow-hidden border-2 border-dashed border-[#d2dae8] bg-[#f6f8fc] transition-colors hover:border-brand-400 hover:bg-brand-50",
            box,
          )}
          style={shape === "wide" ? undefined : { height, width: height }}
        >
          {value ? (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={value} alt="" className="size-full object-cover" />
              <span className="absolute inset-0 grid place-items-center bg-[#0e2143]/55 text-white opacity-0 transition-opacity group-hover:opacity-100">
                <Upload className="size-5" />
              </span>
            </>
          ) : uploading ? (
            <Loader2 className="size-5 animate-spin text-brand-500" />
          ) : (
            <ImagePlus className="size-6 text-[#9aa7bf] transition-colors group-hover:text-brand-500" />
          )}
        </button>

        <div className={cn("flex flex-col gap-1.5", shape === "wide" && "flex-row")}>
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-line bg-white px-3 text-[13px] font-semibold text-[#3b4a68] transition-colors hover:bg-brand-50 hover:text-brand-700 disabled:opacity-50"
          >
            {uploading ? (
              <Loader2 className="size-3.5 animate-spin" />
            ) : (
              <Upload className="size-3.5" />
            )}
            {value ? "Alterar" : "Enviar"}
          </button>
          {value ? (
            <button
              type="button"
              onClick={() => onChange(null)}
              className="inline-flex h-9 items-center gap-1.5 rounded-lg px-3 text-[13px] font-semibold text-danger transition-colors hover:bg-danger-soft"
            >
              <Trash2 className="size-3.5" />
              Remover
            </button>
          ) : null}
          {hint ? (
            <p className="max-w-[190px] text-[11.5px] leading-snug text-[#9aa7bf]">
              {hint}
            </p>
          ) : null}
        </div>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/gif,image/svg+xml"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) void upload(file);
        }}
      />
    </div>
  );
}
