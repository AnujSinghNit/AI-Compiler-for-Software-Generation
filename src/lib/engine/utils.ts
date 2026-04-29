import type { DatabaseColumn, DatabaseTable } from "./types";

export function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .replace(/_{2,}/g, "_");
}

export function titleize(value: string) {
  return value
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (match) => match.toUpperCase());
}

export function singularize(value: string) {
  if (value.endsWith("ies")) {
    return `${value.slice(0, -3)}y`;
  }
  if (value.endsWith("s") && !value.endsWith("ss")) {
    return value.slice(0, -1);
  }
  return value;
}

export function pluralize(value: string) {
  if (value.endsWith("s")) {
    return value;
  }
  if (value.endsWith("y")) {
    return `${value.slice(0, -1)}ies`;
  }
  return `${value}s`;
}

export function unique<T>(values: T[]) {
  return Array.from(new Set(values));
}

export function stableId(prefix: string, value: string) {
  return `${prefix}_${slugify(value)}`;
}

export function nowIso() {
  return new Date().toISOString();
}

export function fieldTypeToDb(type: DatabaseColumn["type"] | string): DatabaseColumn["type"] {
  if (type === "email") return "email";
  if (type === "password") return "password";
  if (type === "number") return "number";
  if (type === "boolean") return "boolean";
  if (type === "date") return "date";
  if (type === "money") return "money";
  if (type === "text") return "text";
  return "string";
}

export function defaultColumns(entity: string): DatabaseColumn[] {
  const base = singularize(entity);
  return [
    { name: "id", type: "uuid", required: true, unique: true },
    { name: "name", type: "string", required: true, unique: false },
    { name: "status", type: "string", required: true, unique: false },
    { name: `${base}_owner_id`, type: "uuid", required: false, unique: false, references: "users.id" },
    { name: "created_at", type: "date", required: true, unique: false },
    { name: "updated_at", type: "date", required: true, unique: false }
  ];
}

export function createTable(name: string, description?: string): DatabaseTable {
  return {
    name,
    description: description ?? `Stores ${titleize(name)} records.`,
    columns: defaultColumns(name)
  };
}
