/** AWS API Gateway targets — used by Vite dev proxy and vercel.json rewrites. */
export const apiTargets = {
  loginApi: "https://3eft0vl4ka.execute-api.eu-central-1.amazonaws.com/dev",
  firebaseAuthApi: "https://ai8hjf2fsc.execute-api.eu-central-1.amazonaws.com/dev",
  userProfileApi: "https://4uyux7zjrf.execute-api.eu-central-1.amazonaws.com/dev",
  adminApi: "https://rdwp2lazqa.execute-api.eu-central-1.amazonaws.com/dev",
  profileApi: "https://2gajkkmi0d.execute-api.eu-central-1.amazonaws.com/dev",
  activeRoutineApi: "https://c0cpdmd5ug.execute-api.eu-central-1.amazonaws.com/dev",
} as const;
