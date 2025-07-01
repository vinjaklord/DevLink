import type {
  IMember,
  LoginCredentials,
  SignupCredentials,
  EditCredentials,
} from '../../models/member.model.ts';
import type {
  Alert,
  DecodedToken,
  ApiResponse,
} from '@/models/helper.model.ts';
import fetchAPI from '../../utils/index.ts';
import { jwtDecode } from 'jwt-decode';
import { toast } from 'sonner';

// Interfaces /////////////////////////////////////////
export interface MemberStore {
  member: IMember;
  members: IMember[];
  loading: boolean;
  isUpdatingProfile: boolean;
  loggedInMember: IMember | null;
  token: string | null;
  decodedToken: DecodedToken | null;
  alert: Alert | null;
  dialog: any | null;
  resetMember: () => void;
  searchMembers: (q: string) => Promise<IMember[]>;
  memberSignup: (data: SignupCredentials) => Promise<boolean>;
  memberLogout: () => void;
  memberLogin: (data: LoginCredentials) => Promise<boolean>;
  memberCheck: () => void;
  memberRefreshMe: () => void;
  editProfile: (data: EditCredentials) => Promise<boolean>;
}

const defaultMember: IMember = {
  id: '',
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
};

export const createMemberSlice = (set: any, get: any): MemberStore => ({
  member: defaultMember,
  members: [],
  ...initialState,

  resetMember: () => set({ member: defaultMember }),

  searchMembers: async (q: string) => {
    try {
      set({ loading: true });

      const response = await fetchAPI({
        method: 'get',
        url: `/members/search?q=${q}`,
      });

      // Update state with fetched members and reset loading
      set({ members: response.data, loading: false });
      return response.data;
    } catch (err) {
      console.error('Error fetching members', err);
      set({ loading: false });
    }
  },

  memberSignup: async (
    data: SignupCredentials | FormData
  ): Promise<boolean> => {
    try {
      const response = await fetchAPI({
        method: 'post',
        url: 'members/signup',
        data,
      });
      if (response.status !== 200) {
        throw new Error(
          `Signup failed: ${response.data?.message || 'Unknown error'}`
        );
      }
      toast.success('Signed in successfully. Welcome!');
      return true;
    } catch (error: any) {
      console.error('Signup error:', error);
      toast.error(error.response?.data?.message || 'Signup failed');
      return false;
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

      return true;
    } catch (error: any) {
      // console.log('was ist error', error);
      toast.error(error.message);
      console.error(error, error.response?.data?.message);

      return false;
    }
  },
  memberLogout: () => {
    // localStorage löschen
    localStorage.removeItem('lh_token');
    localStorage.removeItem('lh_member');

    // Store resetten
    set({ ...initialState });
  },
  memberCheck: async () => {
    try {
      // Prüfen, ob Member angemeldet ist
      if (get().loggedInMember) {
        return;
      }

      // wenn nicht angemeldet
      //  Token aus localStorage laden,
      const token = localStorage.getItem('lh_token');
      if (!token) {
        return;
      }

      // console.log('was ist token', token);

      //  Token dekodieren
      const decodedToken = jwtDecode(token);

      // console.log('was ist decodedToken', decodedToken);
      const { id, exp } = decodedToken;

      //  Gültigkeit prüfen (Ablaufdatum/-uhrzeit)
      // const expireDate = Number(ext);
      const currentDate = Number(new Date()) / 1000;

      // console.log(exp, currentDate);

      //  wenn Token ungültig -> Token und andere Infos aus localStorage löschen
      if (exp < currentDate) {
        return get().memberLogout();
      }

      //  wenn Token gültig -> loggedInMember-Daten aus localStorage laden
      const loggedInMember = JSON.parse(localStorage.getItem('lh_member'));
      if (!loggedInMember) {
        return get().memberLogout();
      }

      // Status des Stores updaten
      set({ token, decodedToken, loggedInMember });
    } catch (error) {
      console.log(error);
    }
  },
  memberRefreshMe: async () => {
    // LoggedInMember neu holen und in Session Store neu schreiben
    // Memberdaten von API neu holen
    // damit Store updaten
    const response = await fetchAPI({
      url: '/members/' + get().loggedInMember._id,
      token: get().token,
    });
    const loggedInMember = response.data;
    set({ loggedInMember });

    // member-Daten in localStorage ändern
    localStorage.setItem('lh_member', JSON.stringify(loggedInMember));
  },

  editProfile: async (data: EditCredentials) => {
    try {
      set({ isUpdatingProfile: true });
      const token = localStorage.getItem('lh_token');
      if (!token) throw new Error('No token found');

      const memberId = get().loggedInMember?._id || get().loggedInMember?.id;
      if (!memberId) throw new Error('No logged in member found');

      const response = await fetchAPI({
        method: 'patch',
        url: `members/${memberId}`,
        data, // FormData object
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data', // Important for FormData
        },
      });

      await get().memberRefreshMe(); // Refresh the member data after successful update
      toast.success('Profile updated successfully!');
      return true;
    } catch (error: any) {
      console.error('error in updating profile', error);
      toast.error(
        error.response?.data?.message || error.message || 'Update failed'
      );
      return false;
    } finally {
      set({ isUpdatingProfile: false });
    }
  },
});
