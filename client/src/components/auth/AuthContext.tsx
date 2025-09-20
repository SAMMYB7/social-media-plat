import { useEffect, useState, useCallback, ReactNode } from 'react';
import { authApi, tokenUtils, type AuthUser, type RegisterData, type ApiError } from '@/lib/api';
import { InternalAuthContext } from './auth-context';

/**
 * Authentication Provider Component
 * Manages user authentication state and provides auth methods to the app
 */
export function AuthProvider({ children }: { children: ReactNode }) {
	const [user, setUser] = useState<AuthUser | null>(null);
	const [token, setToken] = useState<string | null>(() => tokenUtils.get());
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	/**
	 * Refresh current user data from server
	 */
	const refreshUser = useCallback(async () => {
		if (!token) {
			setUser(null);
			return;
		}

		try {
			const { user: currentUser } = await authApi.getCurrentUser();
			setUser(currentUser);
			setError(null);
		} catch (error) {
			console.error('Failed to refresh user:', error);
			
			// Clear invalid token
			if (error instanceof Error && 'status' in error && (error as ApiError).status === 401) {
				handleLogout();
			}
			setUser(null);
		}
	}, [token]);

	/**
	 * Initialize auth state on mount
	 */
	useEffect(() => {
		refreshUser().finally(() => setLoading(false));
	}, [refreshUser]);

	/**
	 * Login user with credentials
	 */
	async function handleLogin(email: string, password: string): Promise<void> {
		try {
			setError(null);
			const { token: authToken, user: authUser } = await authApi.login(email, password);
			
			// Store token and update state
			tokenUtils.set(authToken);
			setToken(authToken);
			setUser(authUser);
		} catch (error) {
			const message = error instanceof Error ? error.message : 'Login failed';
			setError(message);
			throw error; // Re-throw for component handling
		}
	}

	/**
	 * Register new user
	 */
	async function handleRegister(data: RegisterData): Promise<void> {
		try {
			setError(null);
			const { token: authToken, user: authUser } = await authApi.register(data);
			
			// Store token and update state
			tokenUtils.set(authToken);
			setToken(authToken);
			setUser(authUser);
		} catch (error) {
			const message = error instanceof Error ? error.message : 'Registration failed';
			setError(message);
			throw error; // Re-throw for component handling
		}
	}

	/**
	 * Logout user and clear auth state
	 */
	function handleLogout(): void {
		tokenUtils.remove();
		setToken(null);
		setUser(null);
		setError(null);
	}

	const contextValue = {
		user,
		token,
		loading,
		error,
		login: handleLogin,
		register: handleRegister,
		logout: handleLogout,
		refresh: refreshUser
	};

	return (
		<InternalAuthContext.Provider value={contextValue}>
			{children}
		</InternalAuthContext.Provider>
	);
}

export type { AuthUser };

