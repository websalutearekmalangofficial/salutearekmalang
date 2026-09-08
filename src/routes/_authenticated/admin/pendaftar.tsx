import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";

import { AdminCard, inputClass } from "@/components/admin/field";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { fetchRegistrations, type RegistrationRow } from "@/lib/admin-cms";
import { registrationStatuses } from "@/lib/cms";

export const Route = createFileRoute("/_authenticated/admin/pendaftar")({
  component: RegistrationsAdmin,
});

function RegistrationsAdmin() {
  const queryClient = useQueryClient();
  const query = useQuery({ queryKey: ["registrations"], queryFn: fetchRegistrations });
  const refresh = () => queryClient.invalidateQueries({ queryKey: ["registrations"] });

  const updateStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase.from("registrations").update({ status }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Status diperbarui.");
      refresh();
    },
    onError: () => toast.error("Gagal memperbarui status."),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("registrations").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Data pendaftar dihapus.");
      refresh();
    },
    onError: () => toast.error("Gagal menghapus data."),
  });

  const rows: RegistrationRow[] = query.data ?? [];

  return (
    <AdminCard title="Data Pendaftar" description="Daftar orang yang mengisi formulir di website.">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[52rem] border-collapse text-left text-sm">
          <thead>
            <tr className="text-xs font-black uppercase tracking-wide text-ut-navy">
              <th className="border-b border-border p-2">Nama</th>
              <th className="border-b border-border p-2">Sekolah / Kota</th>
              <th className="border-b border-border p-2">Kontak</th>
              <th className="border-b border-border p-2">Jalur</th>
              <th className="border-b border-border p-2">Status</th>
              <th className="border-b border-border p-2" />
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id} className="align-top">
                <td className="border-b border-border p-2 font-bold text-ut-navy">
                  {row.nama}
                  <span className="block text-xs font-medium text-muted-foreground">
                    {new Date(row.created_at).toLocaleDateString("id-ID")}
                  </span>
                </td>
                <td className="border-b border-border p-2 font-medium text-muted-foreground">
                  {row.sekolah ?? "-"}
                  <span className="block text-xs">{row.kota ?? ""}</span>
                </td>
                <td className="border-b border-border p-2 font-medium text-muted-foreground">
                  {row.email ?? "-"}
                  <span className="block text-xs">{row.nomor_hp ?? ""}</span>
                </td>
                <td className="border-b border-border p-2 font-medium text-muted-foreground">{row.jalur ?? "-"}</td>
                <td className="border-b border-border p-2">
                  <select
                    className={inputClass + " h-10"}
                    value={row.status}
                    onChange={(e) => updateStatus.mutate({ id: row.id, status: e.target.value })}
                  >
                    {registrationStatuses.map((status) => (
                      <option key={status.value} value={status.value}>
                        {status.label}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="border-b border-border p-2">
                  <Button
                    type="button"
                    variant="formOutline"
                    className="h-10 w-10 rounded-full p-0"
                    aria-label={`Hapus data ${row.nama}`}
                    onClick={() => remove.mutate(row.id)}
                  >
                    <Trash2 className="size-4" aria-hidden="true" />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {rows.length === 0 && !query.isLoading ? (
          <p className="p-2 text-sm font-medium text-muted-foreground">Belum ada pendaftar.</p>
        ) : null}
      </div>
    </AdminCard>
  );
}
