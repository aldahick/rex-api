import { Message } from "discord.js";

export interface DiscordPayload {
  /** provided for convenience, to avoid reconstructing with prefix for usage errors */
  command: string;
  args: string[];
  message: Message;
  // TODO implement this properly
  // context: AuthContext;
}
