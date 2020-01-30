import "dotenv/config";
import { singleton } from "tsyringe";

@singleton()
export class ConfigService {
  readonly environment = this.optional("NODE_ENV") || "development";
  readonly httpPort = this.required("HTTP_PORT", Number);

  get inDevelopment() {
    return this.environment === "development";
  }

  private required<T = string>(key: string, transformer?: (raw: string) => T): T {
    const value = this.optional(key, transformer);
    if (!value) {
      throw new Error(`Missing required environment variable ${key}`);
    }
    return value;
  }

  private optional<T = string>(key: string, transformer?: (raw: string) => T): T | undefined {
    const value = process.env[key];
    if (!value) {
      return undefined;
    }
    return transformer ? transformer(value) : value as any;
  }
}
