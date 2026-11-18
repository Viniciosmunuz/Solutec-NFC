"use client";

import { useRef, useState } from "react";
import { ImagePlus, Loader2, Maximize2, Trash2, Upload } from "lucide-react";
import { useToast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";

export type Frame = { zoom: number; x: number; y: number };

const CENTRO: Frame = { zoom: 1, x: 50, y: 50 };

export default function ImageUpload({
  value,
  onChange,
  label,
  hint,
  shape = "circle",
  height = 112,
  frame,
  onFrame,
}: {
  value?: string | null;
  onChange: (url: string | null) => void;
  label: string;
  hint?: string;
  shape?: "circle" | "square" | "wide" | "tall";
  height?: number;
  /** enquadramento atual; sem ele o controle de zoom não aparece */
  frame?: Frame;
  onFrame?: (frame: Frame) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const boxRef = useRef<HTMLDivElement>(null);
  const [uploading, setUploading] = useState(false);
  const [arrastando, setArrastando] = useState(false);
  const { error } = useToast();

  const f = frame ?? CENTRO;
  const ajustavel = Boolean(value && onFrame);

  async function upload(file: File) {
    setUploading(true);
    try {
      const body = new FormData();
      body.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Falha no envio.");
      onChange(json.url as string);
      // Foto nova começa centralizada — o enquadramento da anterior não
      // faria sentido nenhum numa imagem diferente.
      onFrame?.(CENTRO);
    } catch (e) {
      error("Não foi possível enviar a imagem", (e as Error).message);
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  /**
   * Arrastar move o ponto da foto que fica no centro do recorte.
   *
   * O sinal é invertido de propósito: puxar para a direita tem que trazer a
   * parte esquerda da foto para o centro, como mexer numa foto de papel
   * debaixo de uma moldura. Dividir pelo zoom mantém o movimento com a mesma
   * sensação quando a foto está aproximada.
   */
  function iniciarArrasto(e: React.PointerEvent) {
    if (!ajustavel) return;
    const caixa = boxRef.current;
    if (!caixa) return;

    const largura = caixa.offsetWidth || 1;
    const altura = caixa.offsetHeight || 1;
    const px = e.clientX;
    const py = e.clientY;
    const inicio = { ...f };

    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      // Captura é só conforto; o arrasto funciona sem ela.
    }
    setArrastando(true);

    const mover = (ev: PointerEvent) => {
      const dx = ((ev.clientX - px) / largura) * 100;
      const dy = ((ev.clientY - py) / altura) * 100;
      onFrame?.({
        zoom: inicio.zoom,
        x: Math.min(100, Math.max(0, inicio.x - dx / inicio.zoom)),
        y: Math.min(100, Math.max(0, inicio.y - dy / inicio.zoom)),
      });
    };
    const soltar = () => {
      setArrastando(false);
      window.removeEventListener("pointermove", mover);
      window.removeEventListener("pointerup", soltar);
    };

    window.addEventListener("pointermove", mover);
    window.addEventListener("pointerup", soltar);
  }

  const box =
    shape === "circle"
      ? "rounded-full aspect-square"
      : shape === "square"
        ? "rounded-2xl aspect-square"
        : shape === "tall"
          ? "rounded-2xl w-[150px] aspect-[9/16]"
          : "rounded-2xl w-full aspect-[16/7]";

  const moldura = (
    <div
      ref={boxRef}
      onPointerDown={iniciarArrasto}
      className={cn(
        "group relative grid shrink-0 place-items-center overflow-hidden border-2 border-dashed border-[#d2dae8] bg-[#f6f8fc] transition-colors",
        value ? "border-solid border-line" : "hover:border-brand-400 hover:bg-brand-50",
        ajustavel && (arrastando ? "cursor-grabbing" : "cursor-grab"),
        box,
      )}
      style={shape === "wide" ? undefined : { height, width: height }}
    >
      {value ? (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={value}
            alt=""
            draggable={false}
            className="size-full select-none object-cover"
            style={{
              objectPosition: `${f.x}% ${f.y}%`,
              transform: f.zoom === 1 ? undefined : `scale(${f.zoom})`,
              transformOrigin: `${f.x}% ${f.y}%`,
            }}
          />
          {ajustavel && !arrastando ? (
            <span className="pointer-events-none absolute inset-x-0 bottom-0 bg-[#0e2143]/60 py-1 text-center text-[10px] font-semibold text-white opacity-0 transition-opacity group-hover:opacity-100">
              arraste para enquadrar
            </span>
          ) : null}
        </>
      ) : uploading ? (
        <Loader2 className="size-5 animate-spin text-brand-500" />
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="grid size-full place-items-center"
          aria-label={`Enviar ${label.toLowerCase()}`}
        >
          <ImagePlus className="size-6 text-[#9aa7bf] transition-colors group-hover:text-brand-500" />
        </button>
      )}
    </div>
  );

  return (
    <div className="flex flex-col gap-2">
      <span className="text-[13px] font-semibold text-[#3b4a68]">{label}</span>

      <div
        className={cn(
          "flex items-center gap-4",
          shape === "wide" && "flex-col items-stretch",
        )}
      >
        {moldura}

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
              onClick={() => {
                onChange(null);
                onFrame?.(CENTRO);
              }}
              className="inline-flex h-9 items-center gap-1.5 rounded-lg px-3 text-[13px] font-semibold text-danger transition-colors hover:bg-danger-soft"
            >
              <Trash2 className="size-3.5" />
              Remover
            </button>
          ) : null}
          {hint && !ajustavel ? (
            <p className="max-w-[190px] text-[11.5px] leading-snug text-[#9aa7bf]">
              {hint}
            </p>
          ) : null}
        </div>
      </div>

      {ajustavel ? (
        <div className="flex items-center gap-2.5 rounded-xl border border-line bg-[#fafbfd] px-3 py-2">
          <Maximize2 className="size-3.5 shrink-0 text-[#9aa7bf]" />
          <input
            type="range"
            min={1}
            max={3}
            step={0.02}
            value={f.zoom}
            aria-label="Aproximar a foto"
            onChange={(e) => onFrame?.({ ...f, zoom: Number(e.target.value) })}
            className="h-1 flex-1 cursor-pointer appearance-none rounded-full bg-[#dde4f0] accent-brand-600"
          />
          <span className="w-10 shrink-0 text-right font-mono text-[11px] text-[#6b7a99]">
            {f.zoom.toFixed(1)}×
          </span>
          <button
            type="button"
            onClick={() => onFrame?.(CENTRO)}
            disabled={f.zoom === 1 && f.x === 50 && f.y === 50}
            className="shrink-0 rounded-md px-2 py-1 text-[11.5px] font-semibold text-[#6b7a99] transition-colors hover:bg-white hover:text-brand-700 disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-[#6b7a99]"
          >
            Centralizar
          </button>
        </div>
      ) : null}

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
