export const duplicateCheckType = ['id'] as const;

export type DuplicateCheckKey = typeof duplicateCheckType[number];
