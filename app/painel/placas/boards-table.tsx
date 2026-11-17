"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  BarChart3,
  Copy,
  Eye,
  Pencil,
  Power,
  PowerOff,
  QrCode,
  Trash2,
} from "lucide-react";
import { StatusBadge } from "@/components/ui/badge";
import { Dropdown } from "@/components/ui/misc";
import { Avatar } from "@/components/ui/display";
import { ConfirmDialog } from "@/components/ui/modal";
import { useToast } from "@/components/ui/toast";
import QrCodeModal from "@/components/admin/qrcode-modal";
import { deleteBoard, setBoardStatus } from "@/lib/actions/boards";
import { displayUrl, publicUrl } from "@/lib/urls";
import { formatDate, formatNumber } from "@/lib/utils";

export type BoardRow = {
  id: string;
  code: string;
  slug: string;
  name: string;
  status: string;
  createdAt: Date;
  client: { id: string; name: string; company: string | null };
  template: { name: string };
  customization: { displayName: string; avatarUrl: string | null } | null;
  _count: { visits: number; clicks: number };
};

export default function BoardsTable({ boards }: { boards: BoardRow[] }) {
  const router = useRouter();
  const { success, error } = useToast();
  const [deleting, setDeleting] = useState<BoardRow | null>(null);
  const [removing, setRemoving] = useState(false);
  const [qrBoard, setQrBoard] = useState<BoardRow | null>(null);

  async function copy(board: BoardRow) {
    await navigator.clipboard.writeText(publicUrl(board.slug));
    success("URL copiada", publicUrl(board.slug));
  }

  async function toggle(board: BoardRow) {
    const next = board.status === "ativa" ? "inativa" : "ativa";
    const result = await setBoardStatus(board.id, next);
    if (!result.ok) {
      error("Não foi possível alterar o status", result.error);
      return;
    }
    success(next === "ativa" ? "Placa ativada" : "Placa desativada");
    router.refresh();
  }

  async function confirmDelete() {
    if (!deleting) return;
    setRemoving(true);
    const result = await deleteBoard(deleting.id);
    setRemoving(false);
    if (!result.ok) {
      error("Não foi possível excluir", result.error);
      return;
    }
    success("Placa excluída");
    setDeleting(null);
    router.refresh();
  }

  const menuFor = (board: BoardRow) => [
    { label: "Ver página pública", icon: Eye, href: `/p/${board.slug}` },
    { label: "Editar personalização", icon: Pencil, href: `/painel/placas/${board.id}/editar` },
    { label: "Copiar URL", icon: Copy, onClick: () => void copy(board) },
    { label: "Ver QR Code", icon: QrCode, onClick: () => setQrBoard(board) },
    { label: "Estatísticas", icon: BarChart3, href: `/painel/placas/${board.id}?tab=estatisticas` },
    {
      label: board.status === "ativa" ? "Desativar placa" : "Ativar placa",
      icon: board.status === "ativa" ? PowerOff : Power,
      separatorBefore: true,
      onClick: () => void toggle(board),
    },
    {
      label: "Excluir placa",
      icon: Trash2,
      danger: true,
      onClick: () => setDeleting(board),
    },
  ];

  return (
    <>
      {/* Tabela (desktop) */}
      <div className="hidden overflow-x-auto lg:block">
        <table className="w-full">
          <thead>
            <tr className="border-b border-line text-left text-[11px] font-bold uppercase tracking-wider text-[#8a97b1]">
              <th className="px-5 py-3">Placa</th>
              <th className="px-5 py-3">Cliente</th>
              <th className="px-5 py-3">URL pública</th>
              <th className="px-5 py-3">Template</th>
              <th className="px-5 py-3 text-center">Acessos</th>
              <th className="px-5 py-3">Status</th>
              <th className="px-5 py-3">Criada</th>
              <th className="w-12 px-3 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {boards.map((board) => (
              <tr key={board.id} className="group transition-colors hover:bg-[#fafbfd]">
                <td className="px-5 py-3.5">
                  <Link
                    href={`/painel/placas/${board.id}`}
                    className="flex items-center gap-3"
                  >
                    <Avatar
                      src={board.customization?.avatarUrl}
                      name={board.customization?.displayName ?? board.name}
                      size={38}
                      square
                    />
                    <div className="min-w-0">
                      <p className="truncate text-[13.5px] font-semibold text-[#10233f] group-hover:text-brand-700">
                        {board.name}
                      </p>
                      <p className="truncate font-mono text-[11px] text-[#9aa7bf]">
                        {board.code}
                      </p>
                    </div>
                  </Link>
                </td>
                <td className="px-5 py-3.5">
                  <Link
                    href={`/painel/clientes/${board.client.id}`}
                    className="text-[13px] text-[#3b4a68] hover:text-brand-700 hover:underline"
                  >
                    {board.client.company ?? board.client.name}
                  </Link>
                </td>
                <td className="px-5 py-3.5">
                  <button
                    type="button"
                    onClick={() => void copy(board)}
                    className="group/url inline-flex max-w-[220px] items-center gap-1.5 rounded-lg px-2 py-1 font-mono text-[11.5px] text-[#6b7a99] transition-colors hover:bg-brand-50 hover:text-brand-700"
                  >
                    <span className="truncate">{displayUrl(board.slug)}</span>
                    <Copy className="size-3 shrink-0 opacity-0 transition-opacity group-hover/url:opacity-100" />
                  </button>
                </td>
                <td className="px-5 py-3.5 text-[12.5px] text-[#6b7a99]">
                  {board.template.name}
                </td>
                <td className="px-5 py-3.5 text-center">
                  <p className="text-[13px] font-bold text-[#10233f]">
                    {formatNumber(board._count.visits)}
                  </p>
                  <p className="text-[11px] text-[#9aa7bf]">
                    {formatNumber(board._count.clicks)} cliques
                  </p>
                </td>
                <td className="px-5 py-3.5">
                  <StatusBadge status={board.status} />
                </td>
                <td className="px-5 py-3.5 text-[12.5px] text-[#8a97b1]">
                  {formatDate(board.createdAt)}
                </td>
                <td className="px-3 py-3.5">
                  <Dropdown items={menuFor(board)} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Cartões (mobile/tablet) */}
      <ul className="divide-y divide-line lg:hidden">
        {boards.map((board) => (
          <li key={board.id} className="px-4 py-4">
            <div className="flex items-start gap-3">
              <Avatar
                src={board.customization?.avatarUrl}
                name={board.customization?.displayName ?? board.name}
                size={44}
                square
              />
              <Link href={`/painel/placas/${board.id}`} className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="truncate text-[14px] font-semibold text-[#10233f]">
                    {board.name}
                  </p>
                  <StatusBadge status={board.status} />
                </div>
                <p className="truncate text-[12.5px] text-[#8a97b1]">
                  {board.client.company ?? board.client.name}
                </p>
                <p className="mt-1 truncate font-mono text-[11.5px] text-[#9aa7bf]">
                  {displayUrl(board.slug)}
                </p>
                <p className="mt-1.5 text-[12px] text-[#6b7a99]">
                  {formatNumber(board._count.visits)} acessos ·{" "}
                  {formatNumber(board._count.clicks)} cliques
                </p>
              </Link>
              <Dropdown items={menuFor(board)} />
            </div>
          </li>
        ))}
      </ul>

      <ConfirmDialog
        open={Boolean(deleting)}
        onClose={() => setDeleting(null)}
        onConfirm={confirmDelete}
        loading={removing}
        title="Excluir placa"
        confirmLabel="Excluir definitivamente"
        message={
          <>
            Excluir <strong className="text-[#10233f]">{deleting?.name}</strong>{" "}
            apaga a personalização, os links e todo o histórico de acessos. A URL{" "}
            <span className="font-mono text-[12px]">/p/{deleting?.slug}</span>{" "}
            deixará de funcionar — e a placa física já gravada ficará sem destino.
            <br />
            <br />
            Se quiser apenas tirar a página do ar, use{" "}
            <strong className="text-[#10233f]">Desativar</strong>.
          </>
        }
      />

      {qrBoard ? (
        <QrCodeModal
          open
          onClose={() => setQrBoard(null)}
          slug={qrBoard.slug}
          code={qrBoard.code}
          name={qrBoard.name}
        />
      ) : null}
    </>
  );
}
