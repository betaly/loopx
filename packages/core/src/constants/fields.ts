export const CommonHiddenFields = ['deleted', 'deletedAt', 'deletedBy', 'createdBy', 'updatedBy'] as const;
export type CommonHiddenFields = (typeof CommonHiddenFields)[number];
