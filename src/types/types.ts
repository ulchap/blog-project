import { Request } from 'express';

export interface IUser {
  id: string;
  email: string;
  role: string;
}

export interface RequestWithUser extends Request {
  user: IUser;
}
