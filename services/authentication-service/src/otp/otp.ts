import {User} from '../models';
import {IOtpRequest, OtpRequestConnectionType} from '../types';

export type OtpConnectionUserKey = 'phone' | 'email';

export const OtpSupportedConnections: OtpRequestConnectionType[] = ['sms', 'email'];
export const OtpConnectionUserKeyMap: Record<OtpRequestConnectionType, OtpConnectionUserKey> = {
  sms: 'phone',
  email: 'email',
};

export class OtpRequest implements IOtpRequest {
  public readonly uci: string;
  public conn: OtpRequestConnectionType;
  public upn: string;
  public user?: User | null;
  public key: OtpConnectionUserKey;

  constructor(uci: string, connection: OtpRequestConnectionType, upn: string, user?: User) {
    this.uci = uci;
    this.conn = connection;
    this.upn = upn;
    this.key = OtpConnectionUserKeyMap[this.conn];
    this.user = user || null;
  }

  static from(uci: string): OtpRequest | undefined {
    const parts = uci.split(':', 2).map(s => s.trim());
    if (parts.length === 1) {
      return;
    }

    const connection = parts[0] as OtpRequestConnectionType;
    if (!OtpSupportedConnections.includes(connection)) {
      throw new Error(`Invalid otp request, unsupported connection type: ${connection}`);
    }
    const target = parts[1];
    return new OtpRequest(uci, connection, target);
  }

  static fromUser(user: User, uci: string): OtpRequest {
    for (const conn of OtpSupportedConnections) {
      const key = OtpConnectionUserKeyMap[conn];
      if (user[key]) {
        return new OtpRequest(uci, conn, user[key] as string, user);
      }
    }
    throw new Error(`Cannot find any contact (both email and phone number) from user ${user.id}`);
  }
}
