import { guard, mutation, query } from "@athenajs/core";
import { singleton } from "tsyringe";

import { IMutation, IMutationRemoveSecretArgs, IMutationSetSecretArgs, IQuery, IQuerySecretArgs, IQuerySecretsArgs } from "../graphql";
import { SecretManager } from "../manager/secret";

@singleton()
export class SecretResolver {
  constructor(
    private readonly secretManager: SecretManager
  ) { }

  @guard({
    resource: "secret",
    action: "readAny"
  })
  @query()
  async secrets(root: unknown, { prefix }: IQuerySecretsArgs): Promise<IQuery["secrets"]> {
    return this.secretManager.getAll(prefix);
  }

  @query()
  async secret(root: unknown, { key }: IQuerySecretArgs): Promise<IQuery["secret"]> {
    return this.secretManager.get(key);
  }

  @mutation()
  async setSecret(root: unknown, { key, value }: IMutationSetSecretArgs): Promise<IMutation["setSecret"]> {
    await this.secretManager.set(key, value);
    return true;
  }

  @mutation()
  async removeSecret(root: unknown, { key }: IMutationRemoveSecretArgs): Promise<IMutation["removeSecret"]> {
    await this.secretManager.remove(key);
    return true;
  }
}
