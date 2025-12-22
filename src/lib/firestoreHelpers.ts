/**
 * Firestore Helper Functions
 * Ensures no undefined values are passed to Firestore
 */

/**
 * Sanitizes an object by removing undefined values
 * Firestore does NOT allow undefined - it will crash
 */
export const sanitizeForFirestore = <T extends Record<string, any>>(data: T): Partial<T> => {
    const sanitized = { ...data };
    Object.keys(sanitized).forEach(key => {
        if (sanitized[key] === undefined) {
            delete sanitized[key];
        }
    });
    return sanitized;
};

/**
 * Generate a unique case ID
 */
export const generateCaseId = (): string => {
    const year = new Date().getFullYear();
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `CASE-${year}-${random}`;
};

/**
 * Generate a unique subject ID
 */
export const generateSubjectId = (): string => {
    const timestamp = Date.now();
    return `SUB-${timestamp}`;
};

/**
 * Generate a unique alert ID
 */
export const generateAlertId = (): string => {
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `ALT-${random}`;
};
