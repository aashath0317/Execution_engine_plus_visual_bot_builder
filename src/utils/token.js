export const getToken = () => {
    return localStorage.getItem('token') || sessionStorage.getItem('token');
};

export const setToken = (token, rememberMe) => {
    if (rememberMe) {
        localStorage.setItem('token', token);
    } else {
        sessionStorage.setItem('token', token);
    }
};

export const removeToken = () => {
    localStorage.removeItem('token');
    sessionStorage.removeItem('token');
};

export const getSessionId = () => {
    return localStorage.getItem('sessionId') || sessionStorage.getItem('sessionId');
};

export const setSessionId = (sessionId, rememberMe) => {
    if (rememberMe) {
        localStorage.setItem('sessionId', sessionId);
    } else {
        sessionStorage.setItem('sessionId', sessionId);
    }
};

export const removeSessionId = () => {
    localStorage.removeItem('sessionId');
    sessionStorage.removeItem('sessionId');
};

export const getUserRole = () => {
    return localStorage.getItem('userRole') || sessionStorage.getItem('userRole');
};

export const setUserRole = (role, rememberMe) => {
    if (rememberMe) {
        localStorage.setItem('userRole', role);
    } else {
        sessionStorage.setItem('userRole', role);
    }
};

export const removeUserRole = () => {
    localStorage.removeItem('userRole');
    sessionStorage.removeItem('userRole');
};

export const clearAuth = () => {
    removeToken();
    removeUserRole();
    removeSessionId();
};
