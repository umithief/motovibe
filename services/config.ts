
// Bu dosya uygulamanın nerede çalıştığını (Local vs Canlı) otomatik algılar.

const getEnv = () => {
    try {
        // @ts-ignore
        return (import.meta && import.meta.env) ? import.meta.env : {};
    } catch {
        return {};
    }
};

const env = getEnv();

// ÖNEMLİ: "Failed to fetch" hatalarını gidermek için Mock Modu (Simülasyon)
// varsayılan olarak TRUE yapıyoruz. Backend çalışmasa bile site açılır.
const USE_MOCK = true;

export const CONFIG = {
    USE_MOCK_API: USE_MOCK, 
    API_URL: env.VITE_API_URL || 'http://localhost:5000/api'
};
