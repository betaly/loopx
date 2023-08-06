﻿export interface OtpResponse {
  key?: string;
}

export interface CodeResponse {
  code: string;
}

export interface QrCodeCreateResponse {
  qrCode: string;
}

export interface QrCodeCheckResponse {
  isGenerated: boolean;
}

export type AuthLogoutFn = (refreshToken: string, state: string) => Promise<string | undefined>;
