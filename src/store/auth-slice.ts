// src/store/auth-slice.ts
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import api, { clearAuthStorage, storeTokens } from '@/lib/api';
import { isTokenExpired } from '@/lib/jwt';
import { extractErrorMessage } from '@/lib/apiError';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface User {
  id: string;
  name: string;
  email?: string;
  username?: string;
  role:
    | 'admin'
    | 'admin1'
    | 'admin2'
    | 'superadmin'
    | 'hr'
    | 'manager'
    | 'employee'
    | 'supervisor';
  department?: string;
  profileImage?: string;
  permissions: string[];
  site_id?: string;
  is_temp_password?: boolean;
}

export interface LoginCredentials {
  identifier: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  role?: string;
  department?: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  loginAttempts: number;
  lastLoginTime: string | null;
}

// ─── Initial state ────────────────────────────────────────────────────────────

const initialState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  loginAttempts: 0,
  lastLoginTime: null,
};

// ─── Response shape helpers ───────────────────────────────────────────────────

interface LoginApiData {
  user: User;
  token: string;
  access_token?: string;
  refresh_token?: string;
}

interface MeApiData {
  user: User;
  employee: unknown;
}

// ─── Async thunks ─────────────────────────────────────────────────────────────

export const loginUser = createAsyncThunk(
  'auth/loginUser',
  async (credentials: LoginCredentials, { rejectWithValue }) => {
    try {
      const response = await api.post<{ success: boolean; data: LoginApiData }>(
        '/auth/login',
        credentials,
      );
      const { user, token, access_token, refresh_token } = response.data.data;

      const accessToken = access_token ?? token;

      storeTokens(accessToken, refresh_token);
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('lastLoginTime', new Date().toISOString());

      return { user, token: accessToken };
    } catch (error: unknown) {
      return rejectWithValue(extractErrorMessage(error, 'Login failed'));
    }
  },
);

export const registerUser = createAsyncThunk(
  'auth/registerUser',
  async (userData: RegisterData, { rejectWithValue }) => {
    try {
      const response = await api.post<{ success: boolean; data: LoginApiData }>(
        '/auth/register',
        userData,
      );
      const { user, token, access_token, refresh_token } = response.data.data;

      const accessToken = access_token ?? token;
      storeTokens(accessToken, refresh_token);
      localStorage.setItem('user', JSON.stringify(user));

      return { user, token: accessToken };
    } catch (error: unknown) {
      return rejectWithValue(extractErrorMessage(error, 'Registration failed'));
    }
  },
);

export const logoutUser = createAsyncThunk(
  'auth/logoutUser',
  async (_, { rejectWithValue }) => {
    try {
      const refreshToken =
        typeof window !== 'undefined'
          ? localStorage.getItem('refresh_token')
          : null;
      await api.post('/auth/logout', { refresh_token: refreshToken ?? '' });
    } catch (error: unknown) {
      // Always clear local state even if the server call fails
      return rejectWithValue(extractErrorMessage(error, 'Logout failed'));
    } finally {
      clearAuthStorage();
    }
  },
);

export const refreshToken = createAsyncThunk(
  'auth/refreshToken',
  async (_, { rejectWithValue }) => {
    try {
      const raw =
        typeof window !== 'undefined'
          ? localStorage.getItem('refresh_token')
          : null;

      if (!raw) {
        return rejectWithValue('No refresh token available');
      }

      const response = await api.post<{
        success: boolean;
        data: { access_token: string; token: string };
      }>('/auth/refresh', { refresh_token: raw });

      const newToken =
        response.data.data.access_token ?? response.data.data.token;
      storeTokens(newToken);

      return { token: newToken };
    } catch (error: unknown) {
      clearAuthStorage();
      return rejectWithValue(extractErrorMessage(error, 'Token refresh failed'));
    }
  },
);

export const getCurrentUser = createAsyncThunk(
  'auth/getCurrentUser',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get<{ success: boolean; data: MeApiData }>(
        '/auth/me',
      );
      // Backend returns { data: { user: {...}, employee: {...} } }
      const user = response.data.data.user;
      localStorage.setItem('user', JSON.stringify(user));
      return { user };
    } catch (error: unknown) {
      return rejectWithValue(extractErrorMessage(error, 'Failed to get user info'));
    }
  },
);

export const updateProfile = createAsyncThunk(
  'auth/updateProfile',
  async (profileData: Partial<User>, { rejectWithValue }) => {
    try {
      const response = await api.put<{ success: boolean; data: User }>(
        '/auth/profile',
        profileData,
      );
      const user = response.data.data;
      localStorage.setItem('user', JSON.stringify(user));
      return { user };
    } catch (error: unknown) {
      return rejectWithValue(extractErrorMessage(error, 'Profile update failed'));
    }
  },
);

export const changePassword = createAsyncThunk(
  'auth/changePassword',
  async (
    {
      currentPassword,
      newPassword,
    }: { currentPassword: string; newPassword: string },
    { rejectWithValue },
  ) => {
    try {
      await api.put('/auth/change-password', { currentPassword, newPassword });
      return { success: true };
    } catch (error: unknown) {
      return rejectWithValue(extractErrorMessage(error, 'Password change failed'));
    }
  },
);

// ─── Slice ────────────────────────────────────────────────────────────────────

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },

    resetLoginAttempts: (state) => {
      state.loginAttempts = 0;
    },

    /**
     * Called once on app startup to restore auth state from localStorage.
     * Also validates token expiry so expired sessions are rejected immediately.
     */
    initializeAuth: (state) => {
      if (typeof window === 'undefined') return;

      const token = localStorage.getItem('token');
      const userString = localStorage.getItem('user');
      const lastLoginTime = localStorage.getItem('lastLoginTime');

      if (!token || !userString) return;

      // Reject expired tokens without making a network request
      if (isTokenExpired(token)) {
        clearAuthStorage();
        return;
      }

      try {
        const user = JSON.parse(userString) as User;
        state.user = user;
        state.token = token;
        state.isAuthenticated = true;
        state.lastLoginTime = lastLoginTime;
      } catch {
        // Corrupted localStorage — clear it
        clearAuthStorage();
      }
    },

    clearAuth: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.error = null;
      state.loginAttempts = 0;
      state.lastLoginTime = null;
      clearAuthStorage();
    },
  },

  extraReducers: (builder) => {
    // loginUser
    builder
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.error = null;
        state.loginAttempts = 0;
        state.lastLoginTime = new Date().toISOString();
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.token = null;
        state.error = action.payload as string;
        state.loginAttempts += 1;
      });

    // registerUser
    builder
      .addCase(registerUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.error = null;
        state.lastLoginTime = new Date().toISOString();
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // logoutUser
    builder
      .addCase(logoutUser.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.isLoading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.token = null;
        state.error = null;
        state.loginAttempts = 0;
        state.lastLoginTime = null;
      })
      .addCase(logoutUser.rejected, (state, action) => {
        // Clear state regardless — logout always succeeds locally
        state.isLoading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.token = null;
        state.error = action.payload as string;
        state.loginAttempts = 0;
        state.lastLoginTime = null;
      });

    // refreshToken
    builder
      .addCase(refreshToken.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(refreshToken.fulfilled, (state, action) => {
        state.isLoading = false;
        state.token = action.payload.token;
        state.error = null;
      })
      .addCase(refreshToken.rejected, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.token = null;
        state.error = action.payload as string;
      });

    // getCurrentUser
    builder
      .addCase(getCurrentUser.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getCurrentUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.error = null;
      })
      .addCase(getCurrentUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // updateProfile
    builder
      .addCase(updateProfile.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.error = null;
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // changePassword
    builder
      .addCase(changePassword.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(changePassword.fulfilled, (state) => {
        state.isLoading = false;
        state.error = null;
      })
      .addCase(changePassword.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

// ─── Actions ──────────────────────────────────────────────────────────────────

export const { clearError, resetLoginAttempts, initializeAuth, clearAuth } =
  authSlice.actions;

// ─── Selectors ────────────────────────────────────────────────────────────────

export const selectAuth = (state: { auth: AuthState }): AuthState => state.auth;
export const selectUser = (state: { auth: AuthState }): User | null =>
  state.auth.user;
export const selectIsAuthenticated = (state: { auth: AuthState }): boolean =>
  state.auth.isAuthenticated;
export const selectAuthLoading = (state: { auth: AuthState }): boolean =>
  state.auth.isLoading;
export const selectAuthError = (state: { auth: AuthState }): string | null =>
  state.auth.error;
export const selectUserRole = (
  state: { auth: AuthState },
): User['role'] | undefined => state.auth.user?.role;
export const selectUserPermissions = (state: { auth: AuthState }): string[] =>
  state.auth.user?.permissions ?? [];

// ─── Reducer ─────────────────────────────────────────────────────────────────

export default authSlice.reducer;