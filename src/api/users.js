import api from './auth';

export const getUsers = async () => {
    try {
        console.log('1. Intentando con /admin/users');
        const response = await api.get('/admin/users');
        console.log('2. Respuesta recibida:', response.data);
        return response.data;
    } catch (error) {
        console.log('3. Error completo:', error);
        console.log('4. Error response:', error.response);
        console.log('5. Error data:', error.response?.data);
        console.log('6. Error status:', error.response?.status);
        
        // Intentar endpoint alternativo
        try {
            console.log('7. Intentando con /admin-users-no-role');
            const altResponse = await api.get('/admin-users-no-role');
            console.log('8. Respuesta alternativa:', altResponse.data);
            return altResponse.data;
        } catch (altError) {
            console.log('9. Error alternativo:', altError);
            throw error;
        }
    }
};