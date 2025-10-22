import type {
  IMember,
  LoginCredentials,
  SignupCredentials,
  EditCredentials,
  ForgotPasswordData,
  PasswordData,
} from '../../models/member.model.ts';
import type { Alert, DecodedToken, ApiResponse } from '@/models/helper.model.ts';
import fetchAPI from '../../utils/index.ts';
import { jwtDecode } from 'jwt-decode';
import { toast } from 'sonner';
import type { StateCreator } from 'zustand';
import type { StoreState } from '../useStore.ts';
import { io } from 'socket.io-client';

const BASE_URL = 'http://localhost:8000';
// Interfaces /////////////////////////////////////////
export interface MemberStore {
  member: IMember;
  user: IMember;
  friendsSearchResults: IMember[];
  wideSearchResults: IMember[];
  loading: boolean;
  isUpdatingProfile: boolean;
  loggedInMember: IMember | null;
  token: string | null;
  decodedToken: DecodedToken | null;
  alert: Alert | null;
  dialog: any | null;
  socket: any | null;
  resetMember: () => void;
  searchMembersFriends: (q: string) => Promise<IMember[]>;
  searchMembersWide: (q: string, limit?: number) => Promise<IMember[]>;
  getMemberById: (id: string) => Promise<IMember>;
  getMemberByUsername: (username: string) => Promise<IMember>;
  memberSignup: (data: SignupCredentials) => Promise<boolean>;
  memberLogout: () => void;
  memberLogin: (data: LoginCredentials) => Promise<boolean>;
  memberResetPassword: (data: string) => Promise<boolean>;
  memberSetNewPassword: (data: ForgotPasswordData) => Promise<boolean>;
  memberCheck: () => void;
  memberRefreshMe: () => void;
  connectSocket: () => void;
  disconnectSocket: () => void;
  editProfile: (data: EditCredentials | FormData) => Promise<boolean>;
  memberChangePassword: (data: PasswordData) => Promise<boolean>;
}

const defaultMember: IMember = {
  _id: '',
  username: '',
  email: '',
  firstName: '',
  lastName: '',
  createdAt: '',
};

const initialState = {
  loggedInMember: null,
  token: null,
  decodedToken: null,
  isUpdatingProfile: false,
  alert: null,
  dialog: null,
  loading: false,
  socket: null,
};

export const createMemberSlice: StateCreator<StoreState, [], [], MemberStore> = (
  set,
  get
): MemberStore => ({
  member: defaultMember,
  friendsSearchResults: [],
  wideSearchResults: [],
  user: defaultMember,
  ...initialState,

  resetMember: () => set({ member: defaultMember }),

  searchMembersFriends: async (q: string) => {
    try {
      const token = localStorage.getItem('lh_token');
      const url = `/members/search?q=${encodeURIComponent(q)}&type=friends`;

      const response = await fetchAPI({
        method: 'get',
        url,
        headers: { Authorization: `Bearer ${token}` },
      });

      set({ friendsSearchResults: response.data, loading: false });
      return response.data;
    } catch (err) {
      console.error('Error fetching friends search', err);
      set({ loading: false });
      return [];
    }
  },

  searchMembersWide: async (q: string, limit?: number) => {
    try {
      const token = localStorage.getItem('lh_token');
      const url = `/members/search?q=${encodeURIComponent(q)}&type=all${
        limit ? `&limit=${limit}` : ''
      }`;

      const response = await fetchAPI({
        method: 'get',
        url,
        headers: { Authorization: `Bearer ${token}` },
      });

      set({ wideSearchResults: response.data });
      return response.data;
    } catch (error) {
      console.error('Error fetching members wide search', error);
      return [];
    }
  },

  getMemberById: async (id: string) => {
    try {
      set({ loading: true });

      const response = await fetchAPI(`/members/${id}`);
      set({ member: response.data, loading: false });
      return response.data;
    } catch (error: any) {
      console.error('Error fetching single member', error);
      set({ loading: false });
    }
  },
  getMemberByUsername: async (username: string) => {
    try {
      set({ loading: true });

      const response = await fetchAPI({ url: `/members/username/${username}` });
      set({ user: response.data, loading: false });
      return response.data;
    } catch (error: any) {
      console.error('Error fetching single member', error);
      set({ loading: false });
    }
  },

  memberSignup: async (data: SignupCredentials): Promise<boolean> => {
    try {
      const response: ApiResponse<string> = await fetchAPI({
        method: 'post',
        url: 'members/signup',
        data,
      });
      if (response.status === 201 || response.status === 200) {
        toast.success('Signed in successfully. Welcome!');

        await get().memberLogin({ username: data.username, password: data.password });

        get().connectSocket();

        return true;
      }

      return false;
    } catch (error: any) {
      console.error('Signup error:', error);
      toast.error(error.response?.data?.message || 'Signup failed');
      set({
        alert: {
          type: 'error',
          title: 'Signup Failed',
          description: error?.response?.data?.message || 'Something went wrong.',
          duration: 10000,
        },
      });
      throw error;
    }
  },
  memberLogin: async (data: LoginCredentials): Promise<boolean> => {
    try {
      // Daten an API senden
      const response: ApiResponse<string> = await fetchAPI({
        method: 'post',
        url: 'members/login',
        data,
      });

      // TODO: Statuscode 200 prüfen
      if (response.status !== 200) {
        throw new Error('Login failed');
      }

      // Token checken, ID rausholen
      const token: string = response.data;
      const decodedToken: DecodedToken = jwtDecode<DecodedToken>(token);
      const { id } = decodedToken;

      // Token ins localStorage speichern
      localStorage.setItem('lh_token', token);

      // einige Daten in den Store speichern
      set({ token, decodedToken });

      // Fetch member data
      const memberResponse: ApiResponse<IMember> = await fetchAPI({
        url: '/members/' + id,
        token,
      });
      const loggedInMember: IMember = memberResponse.data;
      set({ loggedInMember: memberResponse.data });

      // loggedInMember in localStorage speichern
      localStorage.setItem('lh_member', JSON.stringify(loggedInMember));
      get().connectSocket();
      return true;
    } catch (error: any) {
      console.error(error, error.response?.data?.message);
      set({
        alert: {
          type: 'error',
          title: 'Login Failed',
          description: error?.response?.data?.message || 'Something went wrong.',
          duration: 1000,
        },
      });

      return false;
    }
  },
  memberLogout: () => {
    localStorage.removeItem('lh_token');
    localStorage.removeItem('lh_member');
    localStorage.removeItem('chat-storage');
    get().disconnectSocket();
    set({
      ...initialState,
      selectedUser: null, // Explicitly annul selectedUser to ensure it's cleared
    });
    console.log(`member logout has been triggered`);
  },
  memberCheck: async () => {
    try {
      const token = localStorage.getItem('lh_token');
      if (!token) {
        console.log('memberCheck: No token found in localStorage');
        get().memberLogout();
        return;
      }

      const decodedToken = jwtDecode<DecodedToken>(token);
      const { exp } = decodedToken;
      const currentDate = Number(new Date()) / 1000;

      if (exp < currentDate) {
        console.log('memberCheck: Token expired');
        get().memberLogout();
        return;
      }

      const memberData = localStorage.getItem('lh_member');
      if (!memberData) {
        console.log('memberCheck: No member data found in localStorage');
        get().memberLogout();
        return;
      }

      let loggedInMember: IMember;
      try {
        loggedInMember = JSON.parse(memberData);
        if (!loggedInMember?._id) {
          throw new Error('Invalid member data');
        }
      } catch (error) {
        console.error('memberCheck: Failed to parse lh_member:', error);
        get().memberLogout();
        return;
      }

      set({ token, decodedToken, loggedInMember });

      get().connectSocket();
    } catch (error) {
      console.error('memberCheck error:', error);
      toast.error('Session check failed, please log in again');
      get().memberLogout();
    }
  },

  memberRefreshMe: async () => {
    let loggedInMember = get().loggedInMember;
    if (!loggedInMember) {
      return;
    }

    const response = await fetchAPI({
      url: '/members/' + loggedInMember._id,
      token: get().token,
    });
    loggedInMember = response.data;
    set({ loggedInMember });

    localStorage.setItem('lh_member', JSON.stringify(loggedInMember));
  },

  editProfile: async (data: EditCredentials | FormData) => {
    try {
      set({ isUpdatingProfile: true });
      const token = localStorage.getItem('lh_token');
      if (!token) throw new Error('No token found');

      const memberId = get().loggedInMember?._id;
      if (!memberId) throw new Error('No logged in member found');

      await fetchAPI({
        method: 'patch',
        url: `members/${memberId}`,
        data, // FormData object
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });

      await get().memberRefreshMe(); // Refresh the member data after successful update
      toast.success('Profile updated successfully!');
      return true;
    } catch (error: any) {
      console.error('error in updating profile', error);
      toast.error(error.response?.data?.message || error.message || 'Update failed');
      return false;
    } finally {
      set({ isUpdatingProfile: false });
    }
  },
  memberChangePassword: async (data) => {
    try {
      set({ isUpdatingProfile: true });
      const token = localStorage.getItem('lh_token');
      if (!token) throw new Error('No token found');

      const memberId = get().loggedInMember?._id;
      if (!memberId) throw new Error('No logged in member found');

      await fetchAPI({
        method: 'patch',
        url: '/members/change-password',
        data,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      get().memberRefreshMe(); // Refresh the member data after successful update
      toast.success('Password updated successfully!');
      return true;
    } catch (error: any) {
      console.error('error in updating profile', error);
      toast.error(error.response?.data?.message || error.message || 'Update failed');
      return false;
    } finally {
      set({ isUpdatingProfile: false });
    }
  },

  memberResetPassword: async (data: string) => {
    try {
      await fetchAPI({
        method: 'post',
        url: '/members/reset-password',
        data,
      });

      toast.success('Email sent!');
      return true;
    } catch (error: any) {
      console.error('error in updating profile', error);
      toast.error(error.response?.data?.message || error.message || 'Update failed');
      return false;
    }
  },
  
  memberSetNewPassword: async (data: ForgotPasswordData) => {
    const { t: token, password } = data;

    try {
      await fetchAPI({
        method: 'post',

        url: `/members/set-new-password?t=${token}`,

        data: { password },
      });

      toast.success('New Password set successfully!');
      return true;
    } catch (error: any) {
      console.error('error in updating profile', error);
      toast.error(error.response?.data?.message || error.message || 'Update failed');
      return false;
    }
  },
  connectSocket: () => {
    const { loggedInMember } = get();
    if (!loggedInMember) {
      return;
    }
    if (get().socket?.connected) {
      return;
    }

    const socket = io(BASE_URL, {
      transports: ['websocket'],
      query: { userId: loggedInMember._id },
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    socket.on('connect', () => {
      set({ socket });
      if (get().selectedUser?._id) {
        get().subscribeToMessages();
      }
    });

    socket.on('connect_error', (error: any) => {
      console.error(`Socket connection error for user ${loggedInMember._id}: ${error.message}`);
      toast.error(`Socket connection failed: ${error.message}`);
    });

    socket.on('disconnect', (reason: String) => {
      console.log('Disconected:', reason);
    });

    set({ socket });
  },

  disconnectSocket: () => {
    const socket = get().socket;
    if (socket && socket.connected) {
      socket.disconnect();
    }
    set({ socket: null });
  },
});
