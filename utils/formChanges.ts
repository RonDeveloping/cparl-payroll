// /utils/formChanges.ts
// import { ContactFormValues } from "@/lib/schemas/contact"; // or generic type

export interface ChangeEntry<ValueType> {
  name: string;
  before: ValueType;
  after: ValueType;
}

export interface DirtyFieldMap {
  [key: string]: DirtyField;
}

export type DirtyField = boolean | DirtyFieldMap;

export const getFieldChanges = <T extends Record<string, unknown>>(
  initialData: T,
  currentValues: T,
  dirtyFields: Record<string, DirtyField>,
  parentKey = "",
): ChangeEntry<unknown>[] => {
  const changes: ChangeEntry<unknown>[] = [];

  Object.entries(dirtyFields).forEach(([key, value]) => {
    const fullKey = parentKey ? `${parentKey}.${key}` : key;

    if (value === true) {
      changes.push({
        name: fullKey,
        before: initialData[key],
        after: currentValues[key],
      });
    } else if (value && typeof value === "object") {
      changes.push(
        ...getFieldChanges(
          (initialData[key] as Record<string, unknown>) || {},
          (currentValues[key] as Record<string, unknown>) || {},
          value as DirtyFieldMap,
          fullKey,
        ),
      );
    }
  });

  return changes;
};
