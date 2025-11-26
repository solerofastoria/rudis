export interface IUser {
  id: string;
  email: string;
  username: string;
}

export interface IAuthResponse {
  success: boolean;
  data: {
    user: IUser;
    token: string;
  };
}
