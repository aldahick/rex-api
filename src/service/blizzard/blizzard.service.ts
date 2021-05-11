import { HttpError } from "@athenajs/core";
import axios, { AxiosError } from "axios";
import { singleton } from "tsyringe";

import { ConfigService } from "../config";
import { GetConnectedRealm, GetConnectedRealms, SearchResult } from "./dto";

interface SearchParams<T> {
  conditions: {[key in keyof T]?: string | T[key]};
  page: number;
  /** default 100, max 1000 */
  pageSize?: number;
  orderBy?: string;
}

/* eslint-disable @typescript-eslint/member-ordering */
@singleton()
export class BlizzardService {
  private _token?: { token: string; expiresAt: Date };

  constructor(
    private readonly config: ConfigService
  ) { }

  getConnectedRealmIds = (): Promise<number[]> =>
    this.request<GetConnectedRealms>("/data/wow/connected-realm/").then(res =>
      res.connected_realms.map(({ href }) =>
        Number(new URL(href).pathname.split("/").slice(-1)[0])
      )
    );

  getConnectedRealm = (id: number): Promise<GetConnectedRealm> =>
    this.request<GetConnectedRealm>(`/data/wow/connected-realm/${id}`);

  private buildSearchMethod<T>(type: string, namespace: string) {
    return ({ conditions, page, pageSize = 100, orderBy = "" }: SearchParams<T>): Promise<{ results: T[]; pageCount: number }> =>
      this.request<SearchResult<T>>(`/data/wow/search/${type}`, namespace, {
        params: {
          _page: page,
          _pageSize: pageSize,
          orderby: orderBy,
          ...conditions,
        }
      }).then(res => ({
        pageCount: res.pageCount,
        results: res.results.map(r => r.data)
      }));
  }

  private async token(): Promise<string> {
    const { oauthClient } = this.config.blizzard;
    if (oauthClient.id === undefined || oauthClient.secret === undefined) {
      throw new Error("Blizzard OAuth config missing");
    }
    if (this._token !== undefined && this._token.expiresAt.getTime() > Date.now()) {
      return this._token.token;
    }
    const { status, data } = await axios.post<{
      /* eslint-disable @typescript-eslint/naming-convention */
      access_token: string;
      expires_in: number;
      /* eslint-enable @typescript-eslint/naming-convention */
    }>("https://us.battle.net/oauth/token", "grant_type=client_credentials", {
      auth: {
        username: oauthClient.id,
        password: oauthClient.secret
      }
    });
    if (status !== 200) {
      throw new HttpError(status, (data as unknown as string).toString());
    }
    this._token = {
      token: data.access_token,
      expiresAt: new Date(Date.now() + data.expires_in * 1000)
    };
    return this._token.token;
  }

  private async request<T>(
    path: string,
    namespace = "dynamic",
    { region, ...options }: {
      params?: Record<string, string | number>;
      retry?: boolean;
      region?: string;
    } = {}
  ): Promise<T> {
    const { params = {}, retry = true } = options;
    const url = `https://${region !== undefined ? `${region}.` : ""}api.blizzard.com/${path.replace(/^\//, "")}`;
    const fullUrl = `${url}?${new URLSearchParams({
      namespace: `${namespace}${region !== undefined ? `-${region}` : ""}`,
      locale: "en_US",
      ...params
    }).toString()}`;
    return axios.get<T>(fullUrl, {
      headers: {
        authorization: `Bearer ${await this.token()}`
      }
    }).then(r => r.data).catch(async err => {
      if (retry && "response" in err) {
        const res = (err as AxiosError).response;
        if (res?.status === 429) {
          await new Promise(resolve => setTimeout(resolve, 500));
          return this.request(path, namespace, options);
        } else if (res?.status === 500) {
          return this.request(path, namespace, { ...options, retry: false });
        }
      }
      throw err;
    });
  }
}
