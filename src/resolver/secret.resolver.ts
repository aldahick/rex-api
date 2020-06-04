import { guard,mutation, query } from "@athenajs/core";
import { singleton } from "tsyringe";
import { IMutation, IMutationRemoveSecretArgs,IMutationSetSecretArgs, IQuery, IQuerySecretArgs, IQuerySecretsArgs } from "../graphql/types";
import { SecretManager } from "../manager/secret";

@singleton()
export class SecretResolver {
  constructor(
    private secretManager: SecretManager
  ) { }

  @guard({
    resource: "secret",
    action: "readAny"
  })
  @query()
  async secrets(root: void, { prefix }: IQuerySecretsArgs): Promise<IQuery["secrets"]> {
    return this.secretManager.getAll(prefix);
  }

  @query()
  async secret(root: void, { key }: IQuerySecretArgs): Promise<IQuery["secret"]> {
    return this.secretManager.get(key);
  }

  @mutation()
  async setSecret(root: void, { key, value }: IMutationSetSecretArgs): Promise<IMutation["setSecret"]> {
    await this.secretManager.set(key, value);
    return true;
  }

  @mutation()
  async removeSecret(root: void, { key }: IMutationRemoveSecretArgs): Promise<IMutation["removeSecret"]> {
    await this.secretManager.remove(key);
    return true;
  }
}
