/**
 * Utility functions for React components
 */

/**
 * Creates a unique key for React components by combining specialty_id with index
 * This prevents duplicate key errors when the same specialty_id appears multiple times
 */
export const createUniqueKey = (id: string, index: number): string => {
  return `${id}-${index}`;
};

/**
 * Creates a unique key for specialty items to prevent React key duplication
 */
export const createSpecialtyKey = (specialty: { specialty_id: string; specialty_name: string }, index: number): string => {
  // Use specialty_id + index to ensure uniqueness even if specialty_id is duplicated
  return `${specialty.specialty_id}-${index}`;
};

/**
 * Creates a unique key for any item with an id field
 */
export const createItemKey = (item: { id?: string; specialty_id?: string; doctor_id?: string }, index: number): string => {
  const id = item.id || item.specialty_id || item.doctor_id || 'unknown';
  return `${id}-${index}`;
};
