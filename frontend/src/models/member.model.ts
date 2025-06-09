export interface IMember {
<<<<<<< HEAD
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
=======
    id: string;
    username: string;
    firstName: string;
    lastName: string;
    adress?: {
        city: string;
    };
>>>>>>> 6d20355e57951d7fc0081343aee732ce15e82fa0
}
