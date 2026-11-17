"use client";

import { Download, ExternalLink, Nfc } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { CopyButton } from "@/components/ui/misc";
import { publicUrl } from "@/lib/urls";

export default function QrCodeModal({
  open,
  onClose,
  slug,
  code,
  name,
}: {
  open: boolean;
  onClose: () => void;
  slug: string;
  code: string;
  name: string;
}) {
  const url = publicUrl(slug);

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="QR Code da placa"
      description={name}
      size="sm"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Fechar
          </Button>
          <Button
            onClick={() => {
              window.open(`/api/p/${slug}/qrcode?size=1024&download=1`, "_blank");
            }}
          >
            <Download className="size-4" />
            Baixar PNG
          </Button>
        </>
      }
    >
      <div className="flex flex-col items-center gap-4">
        <div className="rounded-2xl border border-line bg-white p-4 shadow-card">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={`/api/p/${slug}/qrcode?size=512`}
            alt={`QR Code de ${name}`}
            width={224}
            height={224}
            className="size-56"
          />
        </div>

        <div className="w-full rounded-xl bg-[#fafbfd] p-3 text-center">
          <p className="text-[11px] font-bold uppercase tracking-wide text-[#9aa7bf]">
            Mesma URL gravada no chip
          </p>
          <p className="mt-1 break-all font-mono text-[12.5px] text-[#3b4a68]">
            {url}
          </p>
          <div className="mt-1.5 flex justify-center gap-1">
            <CopyButton value={url} size="sm" label="Copiar URL" />
            <a
              href={`/p/${slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-xs font-semibold text-brand-700 transition-colors hover:bg-brand-50"
            >
              <ExternalLink className="size-3.5" />
              Abrir
            </a>
          </div>
        </div>

        <div className="flex w-full items-start gap-2.5 rounded-xl bg-brand-50 p-3 text-[12.5px] leading-relaxed text-brand-800">
          <Nfc className="mt-px size-4 shrink-0" />
          <p>
            Grave esta URL no chip NFC da placa{" "}
            <span className="font-mono font-bold">{code}</span>. Ela nunca muda,
            mesmo que você altere o design ou os links depois.
          </p>
        </div>

        <div className="flex gap-2 text-[12px]">
          <a
            href={`/api/p/${slug}/qrcode?format=svg&download=1`}
            className="rounded-lg px-2.5 py-1.5 font-semibold text-[#6b7a99] transition-colors hover:bg-[#f1f4f9] hover:text-[#10233f]"
          >
            Baixar SVG (impressão)
          </a>
        </div>
      </div>
    </Modal>
  );
}
