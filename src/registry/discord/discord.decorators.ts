import { DecoratorUtils } from "@athenajs/core";

export const DISCORD_METADATA_KEY = "rex.discord";

export interface DiscordMetadata {
  commands: string[];
  methodName: string;
}

export const discordCommand = (commands: string | string[]) => (target: any, key: string | symbol) => {
  DecoratorUtils.push<DiscordMetadata>(DISCORD_METADATA_KEY, {
    commands: typeof(commands) === "string" ? [commands] : commands,
    methodName: key.toString()
  }, target);
};
