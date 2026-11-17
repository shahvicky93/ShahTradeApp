import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authApi } from '../api/authApi';
import { masterDataApi } from '../api/masterDataApi';
import { getAuthCredentials, setAuthCredentials, clearAuthCredentials } from '../api/client';

const UserContext = createContext(null);

export function UserProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  const fetchMasterData = useCallback(async () => {
    try {
      const [userList, itemList] = await Promise.all([
        masterDataApi.getUsers(),
        masterDataApi.getItems(),
      ]);
      setUsers(userList || []);
      setItems(itemList || []);
    } catch (err) {
      console.warn('Failed to load master data:', err);
    }
  }, []);

  // Initialize session on mount
  useEffect(() => {
    async function initSession() {
      const savedAuth = getAuthCredentials();

      if (!savedAuth) {
        setLoading(false);
        return;
      }

      try {
        const user = await authApi.getCurrentUser();
        setCurrentUser(user);
        setAuthError(null);
        await fetchMasterData();
      } catch (err) {
        console.warn('Session verification failed on startup:', err);
        clearAuthCredentials();
        setCurrentUser(null);
        setAuthError(null);
      } finally {
        setLoading(false);
      }
    }

    initSession();

    // Listen for 401 unauthorized events to redirect to login
    const handleUnauthorized = () => {
      setCurrentUser(null);
      setAuthError('Session expired. Please sign in again.');
    };
    window.addEventListener('auth:unauthorized', handleUnauthorized);
    return () => window.removeEventListener('auth:unauthorized', handleUnauthorized);
  }, [fetchMasterData]);

  const login = async (username, password) => {
    setLoading(true);
    try {
      const user = await authApi.login(username, password);
      setCurrentUser(user);
      setAuthError(null);
      await fetchMasterData();
      return user;
    } catch (err) {
      setAuthError(err.userMessage || 'Invalid credentials');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    authApi.logout();
    setCurrentUser(null);
  };

  return (
    <UserContext.Provider
      value={{
        currentUser,
        setCurrentUser,
        users,
        items,
        loading,
        authError,
        login,
        logout,
        refreshMasterData: fetchMasterData,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}
