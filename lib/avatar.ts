export const DEFAULT_AVATAR_PATH = "/default-avatar.svg";

export function resolveAvatarUrl(value?: string | null) {
  const trimmed = value?.trim();
  return trimmed || DEFAULT_AVATAR_PATH;
}
