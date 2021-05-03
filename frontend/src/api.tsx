import * as unloc from "@unloc/integrator-client-library";

let Access: any = { accessToken: "", lockHolderId: "" };
let UnscopedAccessToken: any = {};
let ScopedAccessTokens: { [id: string]: any } = {};

export const lockHolderScope = (lockHolder: unloc.LockHolder) =>
  `lockHolder.identifier:${lockHolder.countryIso}.${
    lockHolder.organizationId
  }.${lockHolder.organizationIdSuffix ? lockHolder.organizationIdSuffix : ""}`;

const getApiToken = async (scope?: string) => {
  let body: any = {};
  if (scope) {
    body["scope"] = scope;
  }
  const response = await fetch("/api/getToken", {
    method: "post",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  const json = await response.json();

  return {
    accessToken: json.access_token,
    tokenType: json.token_type,
    expiresIn: json.expires_in,
    scope: json.scope,
    lockHolderId: json.lock_holder_id,
  };
};

const isTokenValid = (token: string) => {
  if (!token || token === "") return false;
  const jwt = parseJwt(token);
  const date = Math.floor(new Date().getTime() / 1000);
  return date < jwt.exp;
};

const getToken = async (scope?: unloc.LockHolder) => {
  if (scope) {
    await getScopedToken(scope);
  } else {
    await getUnscopedToken();
  }
};

const getLockHolderToken = async (
  lockHolder: unloc.LockHolder
): Promise<[string, string]> => {
  let token = ScopedAccessTokens[lockHolder.name];
  if (!token || !isTokenValid(token.accessToken)) {
    await getToken(lockHolder);
    token = ScopedAccessTokens[lockHolder.name];
  }
  if (!token.accessToken) {
    throw new Error("Could not get access token for lockHolder");
  }
  return [token.accessToken, lockHolder.id];
};

const getScopedToken = async (scope: unloc.LockHolder) => {
  const scopedLocalToken = window.localStorage.getItem(
    `UnlocScopedJWT-${scope.name}`
  );
  const validScopedLocalToken =
    scopedLocalToken && scopedLocalToken !== "{}"
      ? isTokenValid(JSON.parse(scopedLocalToken).accessToken)
      : false;
  if (scopedLocalToken && validScopedLocalToken) {
    const json = JSON.parse(scopedLocalToken);
    ScopedAccessTokens[scope.name] = json;
    Access = json;
  } else {
    const token = await getApiToken(lockHolderScope(scope));
    ScopedAccessTokens[scope.name] = token;
    Access = token;
    window.localStorage.setItem(
      `UnlocScopedJWT-${scope.name}`,
      JSON.stringify(token)
    );
  }
};

const getUnscopedToken = async () => {
  const localToken = window.localStorage.getItem("UnlocUnscopedJWT");
  const validToken =
    localToken && localToken !== "{}"
      ? isTokenValid(JSON.parse(localToken).accessToken)
      : false;
  if (localToken && validToken) {
    UnscopedAccessToken = JSON.parse(localToken);
    Access = JSON.parse(localToken);
  } else {
    const token = await getApiToken();
    UnscopedAccessToken = token;
    Access = token;
    window.localStorage.setItem("UnlocUnscopedJWT", JSON.stringify(token));
    return token;
  }
};

const getLockHolders = async (): Promise<unloc.LockHolder[]> => {
  if (!isTokenValid(UnscopedAccessToken.accessToken)) {
    await getToken();
  }
  let response = await unloc.getLockHolders(UnscopedAccessToken.accessToken);

  if (response.error) {
    throw response.error;
  }

  return response.data.lockHolders;
};

const getRoles = async (
  lockHolder: unloc.LockHolder
): Promise<unloc.Role[]> => {
  const [token, lockHolderId] = await getLockHolderToken(lockHolder);
  const response = await unloc.getRoles(token, { lockHolderId });
  if (response.error) {
    console.log(response.error, response.error.errorDescription);
    throw response.error;
  }
  return response.data.roles;
};

const getKeys = async (lockHolder: unloc.LockHolder): Promise<unloc.Key[]> => {
  const [token, lockHolderId] = await getLockHolderToken(lockHolder);
  const response = await unloc.getKeys(token, { lockHolderId });
  if (response.error) {
    console.log(response.error, response.error.errorDescription);
    throw response.error;
  }
  return response.data.keys;
};

const getLocks = async (
  lockHolder: unloc.LockHolder
): Promise<unloc.Lock[]> => {
  const [token, lockHolderId] = await getLockHolderToken(lockHolder);
  const response = await unloc.getLocks(token, { lockHolderId });
  if (response.error) {
    console.log(response.error, response.error.errorDescription);
    throw response.error;
  }
  return response.data.locks;
};
const getLock = async (
  lockHolder: unloc.LockHolder,
  lockId: string
): Promise<unloc.Lock> => {
  const [token, lockHolderId] = await getLockHolderToken(lockHolder);
  const response = await unloc.getLock(token, { lockHolderId, lockId });
  if (response.error) {
    console.log(response.error, response.error.errorDescription);
    throw response.error;
  }
  return response.data.lock;
};
const createLockHolder = async (
  request: unloc.CreateLockHolderOperationRequest
): Promise<unloc.LockHolder> => {
  const response = await unloc.createLockHolder(Access.accessToken, request);
  if (response.error) {
    console.log(response.error, response.error.errorDescription);
    throw response.error;
  }

  return response.data.lockHolder;
};
const updateLockHolder = async (
  lockHolder: unloc.LockHolder,
  name: string
): Promise<unloc.LockHolder> => {
  const [token, lockHolderId] = await getLockHolderToken(lockHolder);
  const response = await unloc.updateLockHolder(token, {
    lockHolderId,
    updateLockHolderRequest: { name },
  });
  if (response.error) {
    console.log(response.error, response.error.errorDescription);
    throw response.error;
  }
  return response.data.lockHolder;
};

const createKey = async (
  lockHolder: unloc.LockHolder,
  lockId: string,
  userId: string,
  start: string | null,
  end: string | null,
  skipInviteNotification: boolean
): Promise<unloc.Key> => {
  const [token, lockHolderId] = await getLockHolderToken(lockHolder);
  const response = await unloc.createKey(token, {
    lockHolderId,
    lockId,
    createKeyRequest: {
      userId,
      start,
      end,
      skipInviteNotification,
    },
  });
  if (response.error) {
    console.log(response.error, response.error.errorDescription);
    throw response.error;
  }
  return response.data.key;
};

const deleteSharedKeys = async (
  lockHolder: unloc.LockHolder,
  userId: string
) => {
  const [token, lockHolderId] = await getLockHolderToken(lockHolder);
  const response = await unloc.deleteSharedKeysForUser(token, {
    lockHolderId,
    userId,
  });
  if (response.error) {
    console.log(response.error, response.error.errorDescription);
    throw response.error;
  }
  return response.data;
};

const deleteSharedKeysForLock = async (
  lockHolder: unloc.LockHolder,
  lockId: string,
  userId: string
) => {
  const [token, lockHolderId] = await getLockHolderToken(lockHolder);
  const response = await unloc.deleteSharedKeysForLock(token, {
    lockHolderId,
    lockId,
    userId,
  });
  if (response.error) {
    console.log(response.error, response.error.errorDescription);
    throw response.error;
  }
  return response.data;
};

const createOrUpdateRole = async (
  lockHolder: unloc.LockHolder,
  lockId: string,
  userId: string,
  canShare: boolean,
  userName?: string
): Promise<unloc.Role> => {
  const [token, lockHolderId] = await getLockHolderToken(lockHolder);
  const data: any = {
    lockHolderId,
    lockId,
    userId,
    createOrUpdateRoleRequest: { canShare },
  };
  if (userName) {
    data.createOrUpdateRoleRequest["userName"] = userName;
  }
  const response = await unloc.createOrUpdateRole(token, data);

  if (response.error) {
    console.log(response.error, response.error.errorDescription);
    throw response.error;
  }
  return response.data.role;
};

const updateLock = async (
  lockHolder: unloc.LockHolder,
  lockId: string,
  name: string,
  image?: string,
  address?: unloc.Address
): Promise<unloc.Lock> => {
  const [token, lockHolderId] = await getLockHolderToken(lockHolder);
  const response = await unloc.updateLock(token, {
    lockHolderId,
    lockId,
    updateLockRequest: {
      name,
      image,
      address,
    },
  });
  if (response.error) {
    console.log(response.error, response.error.errorDescription);
    throw response.error;
  }
  return response.data.lock;
};

const updateKey = async (
  lockHolder: unloc.LockHolder,
  lockId: string,
  keyId: string,
  state: string
) => {
  const [token, lockHolderId] = await getLockHolderToken(lockHolder);
  const response = await unloc.updateKey(token, {
    lockHolderId,
    lockId,
    keyId,
    updateKeyRequest: { state },
  });
  if (response.error) {
    console.log(response.error, response.error.errorDescription);
    throw response.error;
  }

  return response.data;
};

export default {
  getToken,
  getLockHolders,
  getLocks,
  getLock,
  getKeys,
  getRoles,
  createLockHolder,
  updateLockHolder,
  createKey,
  createOrUpdateRole,
  updateLock,
  updateKey,
  deleteSharedKeys,
  deleteSharedKeysForLock,
};

//
// Helpers
//

const parseJwt = (token: string) => {
  if (token === "{}") return {};
  const base64Url = token.split(".")[1];
  const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
  const jsonPayload = decodeURIComponent(
    atob(base64)
      .split("")
      .map(function (c) {
        return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
      })
      .join("")
  );

  return JSON.parse(jsonPayload);
};
