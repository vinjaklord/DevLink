import { create } from "zustand";
import { jwtDecode } from "jwt-decode";

import { fetchAPI } from "../../utils/index";

const initalState = {
  loggedInMember: null,
  token: null,
  decodedToken: null,
  alert: null,
  dialog: null,
  member: null,
};

type StoreState = {
  loggedInMember: null | { [key: string]: unknown }; // Refine this type if known
  dialog: null | { title: string; text: string; onConfirm: () => void };
  alert: null | { severity: string; title?: string; text: string };
  memberCheck: () => void;
  raiseAlert: (alert: { severity: string; title?: string; text: string }) => void;
  destroyDialog: () => void;
  memberSignup: (data: { username: string; password: string; confirmPassword: string; firstName: string; lastName: string; email: string }) => Promise<boolean>;
};

const useStore = create<StoreState>((set, get) => ({
  ...initalState,
  memberCheck: async () => {
    try {
      // Prüfen, ob Member angemeldet ist
      if (get().loggedInMember) {
        return;
      }

      // wenn nicht angemeldet
      //  Token aus localStorage laden,
      const token = localStorage.getItem("lh_token");
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
      const loggedInMember = JSON.parse(localStorage.getItem("lh_member"));
      if (!loggedInMember) {
        return get().memberLogout();
      }

      // Status des Stores updaten
      set({ token, decodedToken, loggedInMember });
    } catch (error) {
      console.log(error);
    }
  },
  memberLogin: async (data) => {
    try {
      // Daten an API senden
      let response = await fetchAPI({
        method: "post",
        url: "/login",
        data,
      });

      // TODO: Statuscode 200 prüfen

      // Token checken, ID rausholen
      const token = response.data;
      const decodedToken = jwtDecode(token);
      const { id } = decodedToken;

      // Token ins localStorage speichern
      localStorage.setItem("lh_token", token);

      // einige Daten in den Store speichern
      set({ token, decodedToken });

      // Stammdaten des eingeloggten Members holen
      response = await fetchAPI({ url: "/member/" + id, token });
      const loggedInMember = response.data;
      set({ loggedInMember });

      // loggedInMember in localStorage speichern
      localStorage.setItem("lh_member", JSON.stringify(loggedInMember));

      get().raiseAlert({
        text: "Success! Have a nice day!",
        severity: ""
      });

      return true;
    } catch (error) {
      // console.log('was ist error', error);
      get().raiseAlert({
        severity: "error",
        text: error.response.data.message ?? error.message,
        title: "Login Error",
      });
      return false;
    }
  },
  memberLogout: () => {
    // localStorage löschen
    localStorage.removeItem("lh_token");
    localStorage.removeItem("lh_member");

    // Store resetten
    set({ ...initalState });
  },
  memberChangePassword: async (data) => {
    try {
      // Daten an API senden
      await fetchAPI({
        method: "patch",
        url: "/members/change-password",
        data,
        token: get().token,
      });

      get().raiseAlert({
        text: "Password changed successfully!",
        severity: ""
      });

      return true;
    } catch (error) {
      get().raiseAlert({
        severity: "error",
        text: error.response.data.message ?? error.message,
        title: "Fehler",
      });
      return false;
    }
  },

  memberChangeProfile: async (data) => {
    try {
      // Ensure all required fields are included, e.g., default current values if not changing

      await fetchAPI({
        method: "PATCH",
        url: "/members/" + get().loggedInMember._id,
        data, // Send as JSON
        headers: {
          "Content-Type": "application/json", // Ensure the server knows it's JSON
          Authorization: `Bearer ${get().token}`,
        },
      });

      await get().memberRefreshMe(); // Refresh the member data after successful update
      get().raiseAlert({
        text: "Profile successfully edited!",
        severity: ""
      });
    } catch (error) {
      console.error(error);
    }
  },

  memberRefreshMe: async () => {
    // LoggedInMember neu holen und in Session Store neu schreiben
    // Memberdaten von API neu holen
    // damit Store updaten
    const response = await fetchAPI({
      url: "/members/" + get().loggedInMember._id,
      token: get().token,
    });
    const loggedInMember = response.data;
    set({ loggedInMember });

    // member-Daten in localStorage ändern
    localStorage.setItem("lh_member", JSON.stringify(loggedInMember));
  },

  memberSignup: async (data) => {
    try {
      await fetchAPI({
        method: "post",
        url: "/signup",
        data: JSON.stringify(data),
        headers: {
          "Content-Type": "application/json",
        },
        timeout: 5000,
      });

      get().raiseAlert({
        title: "Successfully Registered",
        text: "Enjoy",
        severity: ""
      });

      return true;
    } catch (error) {
      console.error("Error during signup:", error);

      if (error.code === "ECONNABORTED") {
        get().raiseAlert({
          severity: "error",
          text: "Request timeout. The server took too long to respond.",
          title: "Timeout Error",
        });
      } else {
        get().raiseAlert({
          severity: "error",
          text: error.response?.data?.message ?? error.message,
          title: "Error",
        });
      }
      return false;
    }
  },

  memberDelete: async () => {
    try {
      // Daten an Rest API senden
      await fetchAPI({
        method: "delete",
        url: "/members/" + get().loggedInMember._id,
        token: get().token,
      });

      // Member sicherheitshalber ausloggen
      get().memberLogout();

      // Erfolgsmeldung als Snackbar
      get().raiseAlert({
        severity: "info",
        text: "Sorry to see you leave :(",
      });

      return true;
    } catch (error) {
      get().raiseAlert({
        severity: "error",
        text: error.response.data.message ?? error.message,
        title: "Fehler",
      });
      return false;
    }
  },

  raiseAlert: (alert = {}) => {
    const defaultAlert = {
      severity: "success",
      variant: "filled",
      duration: 5000, // Default duration is 5000ms (5 seconds)
      text: "Standard-Meldung",
    };

    const newAlert = {
      ...defaultAlert,
      ...alert,
    };

    set({ alert: newAlert });
  },

  raiseDialog: (dialog = {}) => {
    const defaultDialog = {
      title: "Dialog-Titel",
      text: "Dialog-Text",
    };

    const newDialog = {
      ...defaultDialog,
      ...dialog,
    };

    set({ dialog: newDialog });
  },
  destroyDialog: () => {
    set({ alert: null });
  },
}));

export default useStore;
