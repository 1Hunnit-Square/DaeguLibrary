import FingerprintJS from '@fingerprintjs/fingerprintjs';

export const getFingerprint = async () => {
    try {
        const fp = await FingerprintJS.load();
        const result = await fp.get();
        return result.visitorId;
    } catch (error) {
        console.error('FingerprintJS error:', error);
        return "anonymous";
    }
};