export function isAllowedUri(uri: string, uris: string | string[]): boolean {
  uris = Array.isArray(uris) ? uris : [uris];
  // 将每个 URI 中的通配符 '*' 转换为正则表达式的 '.*' (匹配任何字符的模式)
  const regexPatterns = uris.map(u => new RegExp('^' + u.replace(/\*/g, '.*') + '$'));

  // 检查是否存在至少一个模式与给定的 URI 匹配
  return regexPatterns.some(pattern => pattern.test(uri));
}
