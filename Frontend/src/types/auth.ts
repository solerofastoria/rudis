export interface IUser {
  id: string;
  email: string;
  username: string;
  avatar?: string;
  status?: string;
  online?: boolean;
  last_seen?: string;
}

export interface IAuthResponse {
  success: boolean;
  data: {
    user: IUser;
    token: string;
  };
  message?: string;
  errors?: string[];
}

export interface IRegisterData {
  username: string;
  email: string;
  password: string;
}
