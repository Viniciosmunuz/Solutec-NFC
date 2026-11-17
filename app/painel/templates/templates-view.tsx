"use client";

import { useRouter } from "next/navigation";
import TemplateGallery from "@/components/admin/template-gallery";
import { useToast } from "@/components/ui/toast";

export default function TemplatesView({
  usage,
}: {
  usage: Record<string, number>;
}) {
  const router = useRouter();
  const { toast } = useToast();

  return (
    <TemplateGallery
      onSelect={(key) => {
        const used = usage[key] ?? 0;
        toast("Abrindo criação de placa", {
          description:
            used > 0
              ? `Este template já é usado por ${used} placa(s).`
              : "Você poderá trocar o template depois, se quiser.",
        });
        router.push(`/painel/placas/nova?template=${key}`);
      }}
    />
  );
}
