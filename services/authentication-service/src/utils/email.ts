const RegEmail = /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/;

export function isValidEmail(email: string) {
  return RegEmail.test(email);
}
