export interface IUser {
  id: number;
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
