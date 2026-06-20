import api from './auth';

export const getEmergencyDashboard = async () => {
    try {
        const response = await api.get('/emergency/dashboard');
        return response.data;
    } catch (error) {
        console.error('Error getEmergencyDashboard:', error);
        throw error;
    }
};

export const storeTriagePatient = async (patientData) => {
    try {
        const response = await api.post('/emergency/patient', patientData);
        return response.data;
    } catch (error) {
        console.error('Error storeTriagePatient:', error);
        throw error;
    }
};

export const updateVitals = async (patientId, vitalsData) => {
    try {
        const response = await api.put(`/emergency/patient/${patientId}/vitals`, vitalsData);
        return response.data;
    } catch (error) {
        console.error('Error updateVitals:', error);
        throw error;
    }
};

export const derivePatient = async (patientId, hospital) => {
    try {
        const response = await api.put(`/emergency/patient/${patientId}/derive`, { derivation_hospital: hospital });
        return response.data;
    } catch (error) {
        console.error('Error derivePatient:', error);
        throw error;
    }
};

export const dischargePatient = async (patientId) => {
    try {
        const response = await api.put(`/emergency/patient/${patientId}/discharge`);
        return response.data;
    } catch (error) {
        console.error('Error dischargePatient:', error);
        throw error;
    }
};