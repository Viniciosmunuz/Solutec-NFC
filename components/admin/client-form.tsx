"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/field";
import { useToast } from "@/components/ui/toast";
import { createClient, updateClient, type ClientInput } from "@/lib/actions/clients";
import { formatDocument, formatPhone, formatZip } from "@/lib/utils";

export type ClientRecord = ClientInput & { id: string };

const empty: ClientInput = {
  name: "",
  company: "",
  email: "",
  phone: "",
  document: "",
  zip: "",
  address: "",
  number: "",
  district: "",
  city: "",
  state: "",
  notes: "",
};

export default function ClientForm({
  open,
  onClose,
  client,
  onSaved,
}: {
  open: boolean;
  onClose: () => void;
  client?: ClientRecord | null;
  onSaved?: (client: { id: string; name: string }) => void;
}) {
  const [form, setForm] = useState<ClientInput>(client ?? empty);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const { success, error } = useToast();

  // Reinicia o formulário sempre que o modal abre com outro cliente.
  const [lastKey, setLastKey] = useState<string | null>(null);
  const key = `${open}-${client?.id ?? "novo"}`;
  if (open && key !== lastKey) {
    setLastKey(key);
    setForm(client ?? empty);
    setErrors({});
  }

  const set = (field: keyof ClientInput, value: string) =>
    setForm((f) => ({ ...f, [field]: value }));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setErrors({});

    const result = client
      ? await updateClient(client.id, form)
      : await createClient(form);

    setSaving(false);

    if (!result.ok) {
      setErrors(result.fieldErrors ?? {});
      error("Não foi possível salvar", result.error);
      return;
    }

    success(client ? "Cliente atualizado" : "Cliente cadastrado");
    if (!client && result.data) onSaved?.(result.data);
    onClose();
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={client ? "Editar cliente" : "Novo cliente"}
      description="Apenas o nome é obrigatório. O resto pode ser preenchido depois."
      size="lg"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={saving}>
            Cancelar
          </Button>
          <Button type="submit" form="client-form" loading={saving}>
            {client ? "Salvar alterações" : "Cadastrar cliente"}
          </Button>
        </>
      }
    >
      <form
        id="client-form"
        onSubmit={handleSubmit}
        className="grid gap-4 sm:grid-cols-2"
      >
        <Input
          label="Nome do cliente"
          required
          value={form.name}
          onChange={(e) => set("name", e.target.value)}
          error={errors.name}
          placeholder="João da Silva"
        />
        <Input
          label="Empresa"
          value={form.company ?? ""}
          onChange={(e) => set("company", e.target.value)}
          placeholder="Silva Comércio Ltda."
        />
        <Input
          label="Telefone"
          value={form.phone ?? ""}
          onChange={(e) => set("phone", formatPhone(e.target.value))}
          placeholder="(11) 99999-9999"
          inputMode="tel"
        />
        <Input
          label="E-mail"
          type="email"
          value={form.email ?? ""}
          onChange={(e) => set("email", e.target.value)}
          error={errors.email}
          placeholder="contato@empresa.com.br"
        />
        <Input
          label="CPF / CNPJ"
          value={form.document ?? ""}
          onChange={(e) => set("document", formatDocument(e.target.value))}
          placeholder="000.000.000-00"
          inputMode="numeric"
        />
        <Input
          label="CEP"
          value={form.zip ?? ""}
          onChange={(e) => set("zip", formatZip(e.target.value))}
          placeholder="00000-000"
          inputMode="numeric"
        />

        <Input
          label="Endereço"
          wrapperClassName="sm:col-span-2"
          value={form.address ?? ""}
          onChange={(e) => set("address", e.target.value)}
          placeholder="Rua, avenida..."
        />
        <Input
          label="Número"
          value={form.number ?? ""}
          onChange={(e) => set("number", e.target.value)}
          placeholder="123"
        />
        <Input
          label="Bairro"
          value={form.district ?? ""}
          onChange={(e) => set("district", e.target.value)}
          placeholder="Centro"
        />
        <Input
          label="Cidade"
          value={form.city ?? ""}
          onChange={(e) => set("city", e.target.value)}
          placeholder="São Paulo"
        />
        <Input
          label="Estado"
          value={form.state ?? ""}
          onChange={(e) => set("state", e.target.value.toUpperCase().slice(0, 2))}
          placeholder="SP"
          maxLength={2}
        />

        <div className="sm:col-span-2">
          <Textarea
            label="Observações"
            value={form.notes ?? ""}
            onChange={(e) => set("notes", e.target.value)}
            placeholder="Detalhes do pedido, preferências, histórico..."
            rows={3}
          />
        </div>
      </form>
    </Modal>
  );
}
