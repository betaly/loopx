export function isJWTToken(token: string): boolean {
  // JWT token 格式为: header.payload.signature
  const jwtRegex = /^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+$/;

  return jwtRegex.test(token);
}
