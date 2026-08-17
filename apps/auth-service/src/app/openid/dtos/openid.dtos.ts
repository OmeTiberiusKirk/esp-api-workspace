export interface OpenidTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token?: string;
}

export interface OpenidProfile {
  citizen_id: string;
  [key: string]: unknown;
}
