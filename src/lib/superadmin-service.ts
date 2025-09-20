import api from './api';

export const createUser = async (userData: any) => {
    return await api.post('/superadmin/users', userData);
};

export const getUsers = async () => {
    return await api.get('/superadmin/users');
};

export const updateUser = async (userId: string, userData: any) => {
    return await api.put(`/superadmin/users/${userId}`, userData);
};

export const deleteUser = async (userId: string) => {
    return await api.delete(`/superadmin/users/${userId}`);
};