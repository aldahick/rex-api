import { Message } from "discord.js";

export interface DiscordPayload {
  args: string[];
  message: Message;
  // TODO implement this properly
  // context: AuthContext;
}
