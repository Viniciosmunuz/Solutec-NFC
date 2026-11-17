"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Building2,
  CreditCard,
  Mail,
  MapPin,
  Pencil,
  Phone,
  Plus,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dropdown } from "@/components/ui/misc";
import { Avatar } from "@/components/ui/display";
import { ConfirmDialog } from "@/components/ui/modal";
import { useToast } from "@/components/ui/toast";
import ClientForm, { type ClientRecord } from "@/components/admin/client-form";
import { deleteClient } from "@/lib/actions/clients";
import { formatDate } from "@/lib/utils";

export type ClientRow = {
  id: string;
  name: string;
  company: string | null;
  email: string | null;
  phone: string | null;
  document: string | null;
  zip: string | null;
  address: string | null;
  number: string | null;
  district: string | null;
  city: string | null;
  state: string | null;
  notes: string | null;
  createdAt: Date;
  _count: { boards: number };
};

export function NewClientButton() {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <Plus className="size-4" />
        Novo cliente
      </Button>
      <ClientForm
        open={open}
        onClose={() => {
          setOpen(false);
          router.refresh();
        }}
      />
    </>
  );
}

const toRecord = (client: ClientRow): ClientRecord => ({
  id: client.id,
  name: client.name,
  company: client.company ?? "",
  email: client.email ?? "",
  phone: client.phone ?? "",
  document: client.document ?? "",
  zip: client.zip ?? "",
  address: client.address ?? "",
  number: client.number ?? "",
  district: client.district ?? "",
  city: client.city ?? "",
  state: client.state ?? "",
  notes: client.notes ?? "",
});

export default function ClientsTable({ clients }: { clients: ClientRow[] }) {
  const router = useRouter();
  const { success, error } = useToast();
  const [editing, setEditing] = useState<ClientRow | null>(null);
  const [deleting, setDeleting] = useState<ClientRow | null>(null);
  const [removing, setRemoving] = useState(false);

  async function confirmDelete() {
    if (!deleting) return;
    setRemoving(true);
    const result = await deleteClient(deleting.id);
    setRemoving(false);

    if (!result.ok) {
      error("Não foi possível excluir", result.error);
      return;
    }
    success("Cliente excluído");
    setDeleting(null);
    router.refresh();
  }

  return (
    <>
      {/* Tabela (desktop) */}
      <div className="hidden overflow-x-auto md:block">
        <table className="w-full">
          <thead>
            <tr className="border-b border-line text-left text-[11px] font-bold uppercase tracking-wider text-[#8a97b1]">
              <th className="px-5 py-3">Cliente</th>
              <th className="px-5 py-3">Contato</th>
              <th className="px-5 py-3">Localização</th>
              <th className="px-5 py-3 text-center">Placas</th>
              <th className="px-5 py-3">Cadastro</th>
              <th className="w-12 px-5 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {clients.map((client) => (
              <tr key={client.id} className="group transition-colors hover:bg-[#fafbfd]">
                <td className="px-5 py-3.5">
                  <Link
                    href={`/painel/clientes/${client.id}`}
                    className="flex items-center gap-3"
                  >
                    <Avatar name={client.name} size={38} />
                    <div className="min-w-0">
                      <p className="truncate text-[13.5px] font-semibold text-[#10233f] group-hover:text-brand-700">
                        {client.name}
                      </p>
                      {client.company ? (
                        <p className="flex items-center gap-1 truncate text-[12px] text-[#8a97b1]">
                          <Building2 className="size-3" />
                          {client.company}
                        </p>
                      ) : null}
                    </div>
                  </Link>
                </td>
                <td className="px-5 py-3.5">
                  <div className="flex flex-col gap-0.5 text-[12.5px] text-[#6b7a99]">
                    {client.phone ? (
                      <span className="flex items-center gap-1.5">
                        <Phone className="size-3 text-[#9aa7bf]" />
                        {client.phone}
                      </span>
                    ) : null}
                    {client.email ? (
                      <span className="flex items-center gap-1.5 truncate">
                        <Mail className="size-3 text-[#9aa7bf]" />
                        {client.email}
                      </span>
                    ) : null}
                    {!client.phone && !client.email ? (
                      <span className="text-[#c2cde0]">—</span>
                    ) : null}
                  </div>
                </td>
                <td className="px-5 py-3.5 text-[12.5px] text-[#6b7a99]">
                  {client.city ? (
                    <span className="flex items-center gap-1.5">
                      <MapPin className="size-3 text-[#9aa7bf]" />
                      {client.city}
                      {client.state ? `/${client.state}` : ""}
                    </span>
                  ) : (
                    <span className="text-[#c2cde0]">—</span>
                  )}
                </td>
                <td className="px-5 py-3.5 text-center">
                  <span className="inline-flex items-center gap-1 rounded-full bg-brand-50 px-2.5 py-1 text-[12px] font-bold text-brand-700">
                    <CreditCard className="size-3" />
                    {client._count.boards}
                  </span>
                </td>
                <td className="px-5 py-3.5 text-[12.5px] text-[#8a97b1]">
                  {formatDate(client.createdAt)}
                </td>
                <td className="px-3 py-3.5">
                  <Dropdown
                    items={[
                      {
                        label: "Ver detalhes",
                        icon: CreditCard,
                        href: `/painel/clientes/${client.id}`,
                      },
                      {
                        label: "Editar",
                        icon: Pencil,
                        onClick: () => setEditing(client),
                      },
                      {
                        label: "Excluir",
                        icon: Trash2,
                        danger: true,
                        separatorBefore: true,
                        onClick: () => setDeleting(client),
                      },
                    ]}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Cartões (mobile) */}
      <ul className="divide-y divide-line md:hidden">
        {clients.map((client) => (
          <li key={client.id} className="flex items-center gap-3 px-4 py-3.5">
            <Avatar name={client.name} size={40} />
            <Link href={`/painel/clientes/${client.id}`} className="min-w-0 flex-1">
              <p className="truncate text-[13.5px] font-semibold text-[#10233f]">
                {client.name}
              </p>
              <p className="truncate text-[12px] text-[#8a97b1]">
                {client.company ?? client.phone ?? client.email ?? "—"}
              </p>
              <p className="mt-0.5 text-[11.5px] font-semibold text-brand-700">
                {client._count.boards} placa(s)
              </p>
            </Link>
            <Dropdown
              items={[
                { label: "Ver detalhes", icon: CreditCard, href: `/painel/clientes/${client.id}` },
                { label: "Editar", icon: Pencil, onClick: () => setEditing(client) },
                {
                  label: "Excluir",
                  icon: Trash2,
                  danger: true,
                  separatorBefore: true,
                  onClick: () => setDeleting(client),
                },
              ]}
            />
          </li>
        ))}
      </ul>

      <ClientForm
        open={Boolean(editing)}
        client={editing ? toRecord(editing) : null}
        onClose={() => {
          setEditing(null);
          router.refresh();
        }}
      />

      <ConfirmDialog
        open={Boolean(deleting)}
        onClose={() => setDeleting(null)}
        onConfirm={confirmDelete}
        loading={removing}
        title="Excluir cliente"
        confirmLabel="Excluir cliente"
        message={
          <>
            Tem certeza que deseja excluir{" "}
            <strong className="text-[#10233f]">{deleting?.name}</strong>? Esta
            ação não pode ser desfeita.
          </>
        }
      />
    </>
  );
}
