"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import ClientForm, { type ClientRecord } from "@/components/admin/client-form";

export default function EditClientButton({ client }: { client: ClientRecord }) {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  return (
    <>
      <Button variant="secondary" onClick={() => setOpen(true)}>
        <Pencil className="size-4" />
        Editar
      </Button>
      <ClientForm
        open={open}
        client={client}
        onClose={() => {
          setOpen(false);
          router.refresh();
        }}
      />
    </>
  );
}
