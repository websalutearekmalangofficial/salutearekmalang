import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowDown, ArrowUp, Plus, Save, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { AdminCard, Field, inputClass } from "@/components/admin/field";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { fetchNavItems, swapOrder } from "@/lib/admin-cms";
import { iconNames, type NavItem } from "@/lib/cms";

export const Route = createFileRoute("/_authenticated/admin/navigasi")({
  component: NavAdmin,
});

function NavAdmin() {
  const queryClient = useQueryClient();
  const navQuery = useQuery({ queryKey: ["nav"], queryFn: fetchNavItems });
  const items = navQuery.data ?? [];
  const refresh = () => queryClient.invalidateQueries({ queryKey: ["nav"] });

  const addItem = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("nav_items").insert({
        label: "Menu Baru",
        href: "/",
        sort_order: items.length + 1,
        is_active: true,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Menu baru ditambahkan.");
      refresh();
    },
    onError: () => toast.error("Gagal menambah menu."),
  });

  return (
    <AdminCard
      title="Menu Navigasi"
      description="Atur nama menu, tautan, badge, ikon, dan urutannya di bagian atas website."
    >
      <div className="space-y-3">
        {items.map((item, index) => (
          <NavRow key={item.id} item={item} index={index} siblings={items} onChanged={refresh} />
        ))}
        {items.length === 0 && !navQuery.isLoading ? (
          <p className="text-sm font-medium text-muted-foreground">Belum ada menu.</p>
        ) : null}
        <Button
          type="button"
          variant="formOutline"
          className="h-11 rounded-full px-4"
          onClick={() => addItem.mutate()}
        >
          <Plus className="size-4" aria-hidden="true" />
          Menu baru
        </Button>
      </div>
    </AdminCard>
  );
}

function NavRow({
  item,
  index,
  siblings,
  onChanged,
}: {
  item: NavItem;
  index: number;
  siblings: NavItem[];
  onChanged: () => void;
}) {
  const [form, setForm] = useState(item);
  useEffect(() => setForm(item), [item]);

  const save = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from("nav_items")
        .update({
          label: form.label,
          href: form.href,
          badge: form.badge,
          icon: form.icon,
          is_active: form.is_active,
        })
        .eq("id", item.id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Menu disimpan.");
      onChanged();
    },
    onError: () => toast.error("Gagal menyimpan menu."),
  });

  const remove = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("nav_items").delete().eq("id", item.id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Menu dihapus.");
      onChanged();
    },
    onError: () => toast.error("Gagal menghapus menu."),
  });

  const move = useMutation({
    mutationFn: async (direction: -1 | 1) => {
      const other = siblings[index + direction];
      if (!other) return;
      await swapOrder(
        "nav_items",
        { id: item.id, order: item.sort_order },
        { id: other.id, order: other.sort_order },
      );
    },
    onSuccess: onChanged,
    onError: () => toast.error("Gagal mengubah urutan."),
  });

  return (
    <div className="rounded-xl border border-border bg-background p-3">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Field label="Nama menu">
          <input
            className={inputClass}
            value={form.label}
            onChange={(e) => setForm({ ...form, label: e.target.value })}
          />
        </Field>
        <Field label="Tautan">
          <input
            className={inputClass}
            value={form.href}
            onChange={(e) => setForm({ ...form, href: e.target.value })}
          />
        </Field>
        <Field label="Badge (opsional)">
          <input
            className={inputClass}
            value={form.badge ?? ""}
            onChange={(e) => setForm({ ...form, badge: e.target.value || null })}
          />
        </Field>
        <Field label="Ikon">
          <select
            className={inputClass}
            value={form.icon ?? ""}
            onChange={(e) => setForm({ ...form, icon: e.target.value || null })}
          >
            <option value="">Tanpa ikon</option>
            {iconNames.map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </select>
        </Field>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <label className="mr-auto inline-flex items-center gap-2 text-sm font-bold text-ut-navy">
          <input
            type="checkbox"
            checked={form.is_active}
            onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
          />
          Tampilkan di website
        </label>
        <Button
          type="button"
          variant="formOutline"
          className="h-10 w-10 rounded-full p-0"
          aria-label="Naikkan urutan"
          disabled={index === 0}
          onClick={() => move.mutate(-1)}
        >
          <ArrowUp className="size-4" aria-hidden="true" />
        </Button>
        <Button
          type="button"
          variant="formOutline"
          className="h-10 w-10 rounded-full p-0"
          aria-label="Turunkan urutan"
          disabled={index === siblings.length - 1}
          onClick={() => move.mutate(1)}
        >
          <ArrowDown className="size-4" aria-hidden="true" />
        </Button>
        <Button
          type="button"
          variant="utYellow"
          className="h-10 rounded-full px-4"
          onClick={() => save.mutate()}
        >
          <Save className="size-4" aria-hidden="true" />
          Simpan
        </Button>
        <Button
          type="button"
          variant="formOutline"
          className="h-10 rounded-full px-4"
          onClick={() => remove.mutate()}
        >
          <Trash2 className="size-4" aria-hidden="true" />
          Hapus
        </Button>
      </div>
    </div>
  );
}
