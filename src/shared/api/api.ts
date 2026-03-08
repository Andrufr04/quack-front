export const API_URL = import.meta.env.VITE_API_URL

export const apiRequest = async (url: string, options: RequestInit = {}) => {
    const token = localStorage.getItem('access_token')

    const headers: Record<string, string> = {
        ...((options.headers as Record<string, string>) || {}),
    }

    if (token) {
        headers['Authorization'] = `Bearer ${token}`
    }

    try {
        const response = await fetch(`${API_URL}${url}`, {
            ...options,
            headers,
        })

        if (response.status === 401) {
            localStorage.removeItem('access_token')
            localStorage.removeItem('refresh_token')
            
            if (!window.location.pathname.includes('/signin')) {
                window.location.href = '/signin'
            }
            return
        }

        return response;
    } catch (error) {
        throw error;
    }
};