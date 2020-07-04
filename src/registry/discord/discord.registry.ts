import { DecoratorUtils,LoggerService } from "@athenajs/core";
import * as discord from "discord.js";
import { EventEmitter } from "events";
import { container,singleton } from "tsyringe";
import { ConfigService } from "../../service/config";
import { DISCORD_METADATA_KEY,DiscordMetadata } from "./discord.decorators";
import { DiscordPayload } from "./DiscordPayload";

@singleton()
export class DiscordRegistry {
  readonly client = new discord.Client();

  private readonly commandEvents = new EventEmitter();

  constructor(
    private config: ConfigService,
    private logger: LoggerService
  ) { }

  private get commandPrefix(): string {
    return this.config.discord.commandPrefix || "~";
  }

  async init() {
    if (!this.config.discord.token) {
      return;
    }
    this.client.on("message", m => this.onMessage(m));
    await this.client.login(this.config.discord.token);
    this.logger.info("discord.connected");
  }

  register(handlers: any[]) {
    for (const handler of handlers.map(c => container.resolve<any>(c))) {
      const metadatas = DecoratorUtils.get<DiscordMetadata[]>(DISCORD_METADATA_KEY, handler) || [];
      for (const metadata of metadatas) {
        const commandHandler = this.buildCommandHandler(handler[metadata.methodName].bind(handler));
        this.logger.trace({ ...metadata, className: handler.name }, "register.discordCommand");
        metadata.commands.forEach(command => {
          this.commandEvents.on(command.toLowerCase(), commandHandler);
        });
      }
    }
  }

  close() {
    if (!this.config.discord.token) {
      return;
    }
    this.client.destroy();
    this.logger.info("discord.disconnected");
  }

  private buildCommandHandler(callback: (payload: DiscordPayload) => Promise<void | string>) {
    return async (payload: DiscordPayload) => {
      try {
        const result = await callback(payload);
        if (result) {
          await payload.message.reply(result);
        }
      } catch (err) {
        await payload.message.reply("sorry, an internal error occurred.");
        this.logger.error(err, "discord.uncaught");
      }
    };
  }

  private async onMessage(message: discord.Message): Promise<void> {
    const { author, content } = message;
    if (!content.startsWith(this.commandPrefix)) { // ignore non-commands
      return;
    }
    if (author.bot) { // ignore bot messages
      return;
    }
    const [command, ...args] = content.slice(this.commandPrefix.length).split(" ");
    const payload: DiscordPayload = {
      message,
      args,
    };
    this.commandEvents.emit(command.toLowerCase(), payload);
  }
}
