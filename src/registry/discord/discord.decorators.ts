import { DecoratorUtils } from "@athenajs/core";

export const DISCORD_METADATA_KEY = "rex.discord";

export interface DiscordMetadata {
  commands: string[];
  methodName: string;
  helpText: string;
}

export const discordCommand = (
  commands: string | string[],
  options: Omit<DiscordMetadata, "commands" | "methodName">
) => (target: any, key: string | symbol) => {
  DecoratorUtils.push<DiscordMetadata>(DISCORD_METADATA_KEY, {
    commands: typeof(commands) === "string" ? [commands] : commands,
    methodName: key.toString(),
    ...options
  }, target);
};
