export interface Server {
  id: string;
  name: string;
  icon_url?: string;
  invite_code: string;
  owner_id: string;
  created_at: string;
  channels: Channel[];
}

export interface Channel {
  id: string;
  name: string;
  type: 'text' | 'voice';
}

export interface ServerCreateData {
  name: string;
  icon?: File;
  template?: ServerTemplate;
  region: ServerRegion;
  privacy: 'public' | 'private';
}

export type ServerTemplate = 'default' | 'gaming' | 'study' | 'friends';
export type ServerRegion = 'eu-west' | 'us-east' | 'asia-pacific';

export interface ServerCreateResponse {
  success: boolean;
  server?: Server;
  error?: {
    code: string;
    message: string;
    field?: string;
  };
}

export interface ServerCreateError {
  code: ServerCreateErrorCode;
  message: string;
  field?: string;
}

export type ServerCreateErrorCode = 
  | 'NAME_REQUIRED'
  | 'NAME_TOO_SHORT'
  | 'NAME_TOO_LONG'
  | 'NAME_TAKEN'
  | 'ICON_TOO_LARGE'
  | 'ICON_INVALID_FORMAT'
  | 'SERVER_LIMIT_REACHED'
  | 'NETWORK_ERROR'
  | 'UNKNOWN_ERROR';