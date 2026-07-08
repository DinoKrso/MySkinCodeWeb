import { fetchCountFromUpstream, type CountResult } from "./admin-count.js";

const DEFAULT_USERS_COUNT_URL =
  "https://rdwp2lazqa.execute-api.eu-central-1.amazonaws.com/dev/admin/users/count";

export type UsersCountResult = CountResult;

export function getUsersCountUpstreamUrl(): string {
  return (
    process.env.ADMIN_USERS_COUNT_URL?.trim() ||
    process.env.VITE_ADMIN_USERS_COUNT_URL?.trim() ||
    DEFAULT_USERS_COUNT_URL
  );
}

export async function fetchUsersCountFromUpstream(): Promise<UsersCountResult> {
  return fetchCountFromUpstream(getUsersCountUpstreamUrl(), "korisnika");
}
