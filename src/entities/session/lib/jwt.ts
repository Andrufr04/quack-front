import { jwtDecode } from "jwt-decode"

interface JwtPayload {
    roles: string[]
    exp: number
    user_id: string
}

/*
 * const session = getSessionInfo()
 * const isTeacher = session?.roles.includes("teacher")
 */
export const getSessionInfo = () => {
    const token = localStorage.getItem("access_token")
    if (!token) return null

    try {
        const decoded = jwtDecode<JwtPayload>(token)
        
        const currentTime = Date.now() / 1000
        if (decoded.exp < currentTime) {
            return null
        }

        return {
            roles: decoded.roles || [],
            userId: decoded.user_id
        };
    } catch (error) {
        return null
    }
};

export const getActiveRole = () => {
    const session = getSessionInfo()
    if (!session) return null

    const savedRole = localStorage.getItem("active_role")
    
    if (savedRole && session.roles.includes(savedRole)) {
        return savedRole
    }

    return session.roles[0] || null
};

//Add to Role Switch Component
export const setActiveRole = (role: string) => {
    const session = getSessionInfo()
    if (session?.roles.includes(role)) {
        localStorage.setItem("active_role", role)
        window.location.reload()
    }
};

export const hasActiveRole = (role: string): boolean => {
    const activeRole = getActiveRole()
    return activeRole === role
};

export const isStudent = (): boolean => {
    return hasActiveRole('student')
}

export const isTeacher = (): boolean => {
    return hasActiveRole('teacher')
}

export const isCurator = (): boolean => {
    return hasActiveRole('curator')
}

export const isAdministration = (): boolean => {
    return hasActiveRole('administration')
}

export const isParent = (): boolean => {
    return hasActiveRole('parent')
}

export const isFounder = (): boolean => {
    return hasActiveRole('founder')
}