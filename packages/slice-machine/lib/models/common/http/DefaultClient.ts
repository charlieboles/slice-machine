import path from "path";
import { getOrElseW } from "fp-ts/Either";
import upload from "./upload";
import type Models from "@slicemachine/core/build/src/models";
import Files from "../../../utils/files";
import { OnboardingTrackingEvent } from "@lib/models/common/TrackingEvent";

import { UserProfile } from "@slicemachine/core/build/src/models/UserProfile";

interface ApiSettings {
  STAGE: string;
  PROD: string;
}

type DevConfig = [string, string, string];

const SharedSlicesApi = {
  STAGE: "https://customtypes.wroom.io/",
  PROD: "https://customtypes.prismic.io/",
} as ApiSettings;

const AuthApi = {
  STAGE: "https://auth.wroom.io/",
  PROD: "https://auth.prismic.io/",
};

const UserService = {
  STAGE: "https://user.wroom.io/",
  PROD: "https://user.internal-prismic.io/",
};

const TrackingApi = {
  STAGE: "https://2p29q0kam4.execute-api.us-east-1.amazonaws.com/stage/",
  PROD: "https://tracking.prismic.io",
};

const AclProviderApi = {
  STAGE: "https://2iamcvnxf4.execute-api.us-east-1.amazonaws.com/stage/",
  PROD: "https://0yyeb2g040.execute-api.us-east-1.amazonaws.com/prod/",
} as ApiSettings;

const SlicesPrefix = "slices/";
const ValidatePrefix = "validate/";
const RefreshTokenPrefix = "refreshtoken/";
const CustomTypesPrefix = "customtypes/";

function createApiUrl(base: string, { STAGE, PROD }: ApiSettings): string {
  if (base && base.includes("wroom.io")) {
    return STAGE;
  }
  return PROD;
}

type Body = Models.SliceAsObject | Record<string, unknown> | string;

function createFetcher(
  apiUrl: string,
  repo: string,
  auth: string
): (
  prefix: string,
  body?: Body,
  action?: string,
  method?: string
) => Promise<Response> {
  return function runFetch(
    prefix: string,
    body?: Body,
    action = "",
    method = "get"
  ): Promise<Response> {
    const headers = {
      repository: repo,
      Authorization: `Bearer ${auth}`,
      "User-Agent": "slice-machine",
    };
    return fetch(new URL(action, `${apiUrl}${prefix}`).toString(), {
      headers,
      method,
      ...(method === "post"
        ? {
            body: "object" === typeof body ? JSON.stringify(body) : body,
          }
        : null),
    });
  };
}

const initFetcher = (
  base: string,
  ApiUrls: ApiSettings,
  devConfigArgs: DevConfig,
  repo: string,
  auth: string
) => {
  const apiUrl = createApiUrl(base, ApiUrls);
  const args = devConfigArgs ? devConfigArgs : [apiUrl, repo, auth];
  return createFetcher(args[0], args[1], args[2]);
};

export default class DefaultClient {
  apiFetcher: (
    prefix: string,
    body?: Body,
    action?: string,
    method?: string
  ) => Promise<Response>;
  aclFetcher: (
    prefix: string,
    body?: Body,
    action?: string,
    method?: string
  ) => Promise<Response>;
  trackingFetcher: (
    prefix: string,
    body?: Body,
    action?: string,
    method?: string
  ) => Promise<Response>;

  static validate(base: string, auth: string): Promise<Response> {
    return fetch(
      `${createApiUrl(base, AuthApi)}${ValidatePrefix}?token=${auth}`,
      {
        method: "GET",
      }
    );
  }

  static refreshToken(base: string, auth: string): Promise<Response> {
    return fetch(
      `${createApiUrl(base, AuthApi)}${RefreshTokenPrefix}?token=${auth}`,
      {
        method: "GET",
      }
    );
  }

  static async profile(
    base: string,
    auth: string
  ): Promise<Error | UserProfile> {
    try {
      const result = await fetch(`${createApiUrl(base, UserService)}profile`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${auth}`,
        },
      });

      const jsResult = await result.json();

      return getOrElseW(
        () => new Error(`Unable to parse profile: ${jsResult}`)
      )(UserProfile.decode(jsResult));
    } catch (e) {
      return e as Error;
    }
  }

  constructor(
    readonly cwd: string,
    readonly base: string,
    readonly repo: string,
    readonly auth: string
  ) {
    const devConfig: Record<string, DevConfig> = (() => {
      if (!cwd) {
        return {};
      }
      try {
        return Files.readJson(path.join(cwd, "sm.dev.json")) as Record<
          string,
          DevConfig
        >;
      } catch (e) {
        return {};
      }
    })();

    this.base = base;
    this.auth = auth;
    this.apiFetcher = initFetcher(
      base,
      SharedSlicesApi,
      devConfig.sharedSlicesApi,
      repo,
      auth
    );
    this.aclFetcher = initFetcher(
      base,
      AclProviderApi,
      devConfig.aclProviderApi,
      repo,
      auth
    );
    this.trackingFetcher = initFetcher(
      base,
      TrackingApi,
      devConfig.aclProviderApi,
      repo,
      auth
    );
  }

  isFake(): boolean {
    return false;
  }

  async getSlice(): Promise<Response> {
    return this.apiFetcher(SlicesPrefix);
  }

  async getCustomTypes(): Promise<Response> {
    return this.apiFetcher(CustomTypesPrefix);
  }

  async insertCustomType(body: Body): Promise<Response> {
    return this.apiFetcher(CustomTypesPrefix, body, "insert", "post");
  }

  async updateCustomType(body: Body): Promise<Response> {
    return this.apiFetcher(CustomTypesPrefix, body, "update", "post");
  }

  async insertSlice(body: Body): Promise<Response> {
    return this.apiFetcher(SlicesPrefix, body, "insert", "post");
  }

  async updateSlice(body: Body): Promise<Response> {
    return this.apiFetcher(SlicesPrefix, body, "update", "post");
  }

  async sendOnboarding(onboardingEvent: OnboardingTrackingEvent) {
    return this.trackingFetcher("", onboardingEvent, "", "post");
  }

  images = {
    createAcl: async (): Promise<Response> => {
      return this.aclFetcher("", undefined, "create", "get");
    },
    deleteFolder: async (body: Body): Promise<Response> => {
      return this.aclFetcher("", body, "delete-folder", "post");
    },
    post: async (params: {
      url: string;
      fields: Record<string, string>;
      key: string;
      filename: string;
      pathToFile: string;
    }): Promise<number | undefined> => {
      return upload(params);
    },
  };
}
