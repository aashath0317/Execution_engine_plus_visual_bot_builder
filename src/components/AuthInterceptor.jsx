import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { clearAuth } from '../utils/token';
import axios from 'axios';

const AuthInterceptor = () => {
    const navigate = useNavigate();
    const originalFetchRef = useRef(window.fetch);

    useEffect(() => {
        const originalFetch = originalFetchRef.current;

        window.fetch = async (...args) => {
            const response = await originalFetch(...args);

            // Check for new token from token refresh system
            const newToken = response.headers.get('x-new-token');
            if (newToken) {
                console.log("[AuthInterceptor] Received new refreshed token, updating storage.");
                localStorage.setItem('token', newToken);
            }

            // Check for 401 Unauthorized
            if (response.status === 401) {
                // Ignore 401s from login endpoints to avoid redirect loops or interrupting bad password flows
                const url = args[0] ? (typeof args[0] === 'string' ? args[0] : args[0].url) : '';
                const isLoginEndpoint = url.includes('/auth/login') || url.includes('/auth/google');

                if (!isLoginEndpoint) {
                    // Try to parse error to see if it is "jwt expired" if possible, but 401 is generally enough
                    // The user specifically mentioned "[ERROR] TokenExpiredError: jwt expired" which is backend log.
                    // Frontend just sees 401.

                    clearAuth();
                    // Avoid redirecting if already on signin or public pages
                    const currentPath = window.location.pathname;
                    if (!currentPath.startsWith('/signin') && !currentPath.startsWith('/signup') && !currentPath.startsWith('/r/')) {
                        // Force a hard reload to clear state and handle potential stale chunk versions
                        window.location.href = '/signin';
                    }
                }
            }

            // Check for 403 Forbidden (Unverified)
            if (response.status === 403) {
                try {
                    const clone = response.clone();
                    const data = await clone.json();

                    if (data.requires_device_verification) {
                        const currentPath = window.location.pathname;
                        if (!currentPath.startsWith('/verify-email')) {
                            window.location.href = '/verify-email';
                        }
                    }
                } catch (e) {
                    // Ignore JSON parsing errors for non-JSON responses
                }
            }

            return response;
        };

        // --- AXIOS INTERCEPTOR ---
        const axiosInterceptorId = axios.interceptors.response.use(
            (response) => {
                // Axios headers are traditionally lowercased
                const newToken = response.headers['x-new-token'];
                if (newToken) {
                    console.log("[AuthInterceptor:Axios] Received new refreshed token, updating storage.");
                    localStorage.setItem('token', newToken);
                }
                return response;
            },
            (error) => {
                if (error.response && error.response.status === 401) {
                    const url = error.config ? error.config.url : '';
                    const isLoginEndpoint = url.includes('/auth/login') || url.includes('/auth/google');

                    if (!isLoginEndpoint) {
                        clearAuth();
                        const currentPath = window.location.pathname;
                        if (!currentPath.startsWith('/signin') && !currentPath.startsWith('/signup') && !currentPath.startsWith('/r/')) {
                            window.location.href = '/signin';
                        }
                    }
                }

                if (error.response && error.response.status === 403) {
                    if (error.response.data && error.response.data.requires_device_verification) {
                        const currentPath = window.location.pathname;
                        if (!currentPath.startsWith('/verify-email')) {
                            window.location.href = '/verify-email';
                        }
                    }
                }
                return Promise.reject(error);
            }
        );

        return () => {
            window.fetch = originalFetch;
            axios.interceptors.response.eject(axiosInterceptorId);
        };
    }, []);

    return null;
};

export default AuthInterceptor;
