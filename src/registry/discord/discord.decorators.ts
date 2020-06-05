import { DecoratorUtils } from "@athenajs/core";

export const DISCORD_METADATA_KEY = "rex.discord";

export interface DiscordMetadata {
  command: string;
  methodName: string;
}

export const discordCommand = (command: string) => (target: any, key: string | symbol) => {
  DecoratorUtils.push<DiscordMetadata>(DISCORD_METADATA_KEY, {
    command,
    methodName: key.toString()
  }, target);
};
