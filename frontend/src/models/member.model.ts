export interface IMember {
  id: string;
  username: string;
  email?: string;
  firstName: string;
  lastName: string;
  adress?: {
    city: string;
  };
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface SignupCredentials {
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
}
