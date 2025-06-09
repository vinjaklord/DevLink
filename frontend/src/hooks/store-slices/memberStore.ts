<<<<<<< HEAD
import type {
  IMember,
  LoginCredentials,
  SignupCredentials,
} from '../../models/member.model.ts';
import type {
  Alert,
  DecodedToken,
  ApiError,
  ApiResponse,
} from '@/models/helper.model.ts';
import { updateInstance } from '../../utils/object.common-js.ts';
import fetchAPI from '../../utils/index.ts';
import { jwtDecode } from 'jwt-decode';

// Interfaces /////////////////////////////////////////
export interface MemberStore {
  member: IMember;
  loading: boolean;
  loggedInMember: IMember | null;
  token: string | null;
  decodedToken: DecodedToken | null;
  alert: Alert | null;
  dialog: any | null; // Replace 'any' with a specific type if possible
  setMember: (data: Partial<IMember>) => void;
  resetMember: () => void;
  searchMembers: (q: string) => Promise<IMember[]>;
  memberSignup: (data: SignupCredentials) => Promise<boolean>;
  memberLogout: () => void;
  memberLogin: (data: LoginCredentials) => Promise<boolean>;
  memberCheck: () => void;
}

const defaultMember: IMember = {
  id: '',
  username: '',
  email: '',
  firstName: '',
  lastName: '',
};

const initialState = {
  loggedInMember: null,
  token: null,
  decodedToken: null,
  alert: null,
  dialog: null,
};

export const createMemberSlice = (set: any, get: any): MemberStore => ({
  member: defaultMember,
  loading: false,
  ...initialState,

  setMember: (data: Partial<IMember>) => {
    set((state: MemberStore) => ({
      member: updateInstance(state.member, data),
    }));
  },

  resetMember: () => set({ member: defaultMember }),

  searchMembers: async (q: string) => {
    try {
      set({ loading: true });

      const response = await fetchAPI({
        method: 'get',
        url: `/api/members/search?q=${q}`,
      });

      // Update state with fetched members and reset loading
      set({ loading: false });
      return response.data;
    } catch (err) {
      console.error('Error fetching members', err);
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

      // TODO: Statuscode 200 prüfen
      if (response.status !== 200) {
        throw new Error('Login failed');
      }

      console.log('success signup');

      return true;
    } catch (error) {
      console.error('Error during signup:', error);

      if (error.code === 'ECONNABORTED') {
        //add alert window
        console.log('ECONNABORTED');
      } else {
        //alert window
        console.error(error, error.message);
      }
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
      set({ loggedInMember });

      // loggedInMember in localStorage speichern
      localStorage.setItem('lh_member', JSON.stringify(loggedInMember));

      return true;
    } catch (error: unknown) {
      // console.log('was ist error', error);
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
});
=======
import type { IMember } from '../../models/member.model.ts';
import { updateInstance } from '@/utils/object.common-js.ts';
import { fetchAPI } from '@/utils/index.ts';

export interface MemberStore {
    member: IMember;
    loading: boolean;
    setMember: (data: Partial<IMember>) => void;
    resetMember: () => void; 
    searchMembers: (q: string) => Promise<IMember[]>;
}

const defaultMember: IMember = {
    id: '',
    username: '',
    firstName: '',
    lastName: '',
};

export const createMemberSlice = (set: any, get: any): MemberStore => ({
    member: defaultMember,
    loading: false,

    setMember: (data: Partial<IMember>) => {
        set((state: MemberStore) => ({
            member: updateInstance(state.member, data),
        }));
    },

    resetMember: () => set({member: defaultMember}),

    searchMembers: async (q: string) => {
        try {
        set({ loading: true });

        const response = await fetchAPI({ method: "get", url: `/api/members/search?q=${q}`});

        // Update state with fetched members and reset loading
        set({ loading: false });
        return response.data;
        } catch (err) {
        console.error("Error fetching members", err);
        set({ loading: false });
        }
    },
})

>>>>>>> 6d20355e57951d7fc0081343aee732ce15e82fa0
