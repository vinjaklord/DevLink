export interface IMember {
  _id: string;
  username: string;
  email?: string;
  firstName: string;
  lastName: string;
  photo?: Photo;
  adress?: {
    city: string;
  };
  createdAt: string;
}
interface Photo {
  url?: string;
  photoId?: string;
}
export interface PasswordData {
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
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
export interface EditCredentials {
  firstName: string;
  lastName: string;
  username?: string;
  email?: string;
  photo?: Photo;
  password?: string;
  confirmPassword?: string;
}
