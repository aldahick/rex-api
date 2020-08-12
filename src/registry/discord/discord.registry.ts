import { decoratorUtils, LoggerService } from "@athenajs/core";
import * as discord from "discord.js";
import { EventEmitter } from "events";
import { container, InjectionToken, singleton } from "tsyringe";
import { ConfigService } from "../../service/config";
import { DISCORD_METADATA_KEY, DiscordMetadata } from "./discord.decorators";
import { DiscordPayload } from "./DiscordPayload";

@singleton()
export class DiscordRegistry {
  readonly client = new discord.Client();

  readonly commandMetadatas: DiscordMetadata[] = [];

  private readonly commandEvents = new EventEmitter();

  constructor(
    private readonly config: ConfigService,
    private readonly logger: LoggerService
  ) { }

  async init(): Promise<void> {
    if (this.config.discord.token === undefined) {
      return;
    }
    this.client.on("message", m => this.onMessage(m));
    await this.client.login(this.config.discord.token);
    this.logger.info("discord.connected");
  }

  register(handlerClasses: unknown[]): void {
    const handlers = handlerClasses.map(c =>
      container.resolve<Record<string, unknown>>(c as InjectionToken)
    );
    for (const handler of handlers) {
      const metadatas = decoratorUtils.get<DiscordMetadata[]>(DISCORD_METADATA_KEY, handler) ?? [];
      this.commandMetadatas.push(...metadatas);
      for (const metadata of metadatas) {
        const callback = handler[metadata.methodName];
        if (typeof callback !== "function") {
          continue;
        }
        const commandHandler = this.buildCommandHandler(callback.bind(handler));
        this.logger.trace({ ...metadata, className: handler.name }, "register.discordCommand");
        metadata.commands.forEach(command => {
          this.commandEvents.on(command.toLowerCase(), (payload: DiscordPayload) => {
            commandHandler(payload).catch(async (err: unknown) => {
              this.logger.error(err, "discord.uncaught");
              await payload.message.reply("sorry, an internal error occurred.");
            });
          });
        });
      }
    }
  }

  close(): void {
    if (this.config.discord.token === undefined) {
      return;
    }
    this.client.destroy();
    this.logger.info("discord.disconnected");
  }

  private buildCommandHandler(callback: (payload: DiscordPayload) => Promise<string | undefined>) {
    return async (payload: DiscordPayload): Promise<void> => {
      const result = await callback(payload);
      if (result !== undefined) {
        await payload.message.reply(result);
      }
    };
  }

  private onMessage(message: discord.Message): void {
    const { author, content } = message;
    if (!content.startsWith(this.config.discord.commandPrefix)) { // ignore non-commands
      return;
    }
    if (author.bot) { // ignore bot messages
      return;
    }
    const [command, ...args] = content.slice(this.config.discord.commandPrefix.length).split(" ");
    const payload: DiscordPayload = {
      command: `${this.config.discord.commandPrefix}${command}`,
      message,
      args,
    };
    this.commandEvents.emit(command.toLowerCase(), payload);
  }
}
