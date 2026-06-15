import { createNovel } from "@/lib/actions/novels";

export const metadata = { title: "Admin — New Novel" };

export default function NewNovelPage() {
  return (
    <div className="max-w-2xl">
      <h1 className="text-3xl font-black text-white mb-8">Create Novel</h1>

      <form action={createNovel}>
        <NovelFields />
        <div className="flex gap-3 mt-8">
          <button
            type="submit"
            name="is_published"
            value="false"
            className="px-6 py-2.5 rounded-xl font-semibold text-sm"
            style={{ background: "var(--surface-2)", color: "var(--foreground)", border: "1px solid var(--border)" }}
          >
            Save as Draft
          </button>
          <button
            type="submit"
            name="is_published"
            value="true"
            className="px-6 py-2.5 rounded-xl font-semibold text-sm"
            style={{ background: "var(--accent)", color: "#fff" }}
          >
            Create & Publish
          </button>
        </div>
      </form>
    </div>
  );
}

function NovelFields({ defaults }: { defaults?: Record<string, string> }) {
  const v = defaults ?? {};
  return (
    <div className="flex flex-col gap-5">
      <Field label="Title *" name="title" defaultValue={v.title} required placeholder="e.g. Shadow Monarch" />
      <Field label="URL Slug *" name="slug" defaultValue={v.slug} required placeholder="e.g. shadow-monarch" />
      <Field label="Original Title" name="original_title" defaultValue={v.original_title} placeholder="Original language title" />
      <Field label="Author" name="author" defaultValue={v.author} placeholder="Author name" />
      <Field label="Translator" name="translator" defaultValue={v.translator} placeholder="Translator name" />

      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium" style={{ color: "var(--muted)" }}>Status</label>
        <select
          name="status"
          defaultValue={v.status ?? "ongoing"}
          className="px-4 py-2.5 rounded-xl text-sm outline-none"
          style={{ background: "var(--surface-2)", border: "1px solid var(--border)", color: "var(--foreground)" }}
        >
          <option value="ongoing">Ongoing</option>
          <option value="completed">Completed</option>
          <option value="hiatus">Hiatus</option>
          <option value="dropped">Dropped</option>
        </select>
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium" style={{ color: "var(--muted)" }}>Description</label>
        <textarea
          name="description"
          rows={5}
          defaultValue={v.description}
          placeholder="Novel synopsis…"
          className="px-4 py-3 rounded-xl text-sm outline-none resize-none"
          style={{ background: "var(--surface-2)", border: "1px solid var(--border)", color: "var(--foreground)" }}
        />
      </div>
    </div>
  );
}

export { NovelFields };

function Field({
  label,
  name,
  defaultValue,
  placeholder,
  required,
}: {
  label: string;
  name: string;
  defaultValue?: string;
  placeholder?: string;
  required?: boolean;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium" style={{ color: "var(--muted)" }}>{label}</label>
      <input
        name={name}
        defaultValue={defaultValue ?? ""}
        placeholder={placeholder}
        required={required}
        className="px-4 py-2.5 rounded-xl text-sm outline-none"
        style={{ background: "var(--surface-2)", border: "1px solid var(--border)", color: "var(--foreground)" }}
      />
    </div>
  );
}
