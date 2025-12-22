import { getFirestore, collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { app } from './firebase';

export const logAction = async (
    action: string,
    target: string,
    adminId: string,
    adminName: string,
    adminRole: string,
    details?: string
) => {
    try {
        const db = getFirestore(app);
        await addDoc(collection(db, 'audit_logs'), {
            action,
            target,
            adminId,
            adminName,
            adminRole,
            timestamp: serverTimestamp(),
            details: details || ''
        });
    } catch (error) {
        console.error("Failed to log action:", error);
    }
};
