import { guard, HttpError, mutation, query } from "@athenajs/core";
import { singleton } from "tsyringe";

import { IMutation, IMutationCreateNoteArgs, IMutationRemoveNoteArgs, IMutationUpdateNoteBodyArgs, IQuery, IQueryNoteArgs } from "../../graphql";
import { AuthContext } from "../auth";
import { NoteManager } from "./note.manager";

@singleton()
export class NoteResolver {
  constructor(
    private readonly noteManager: NoteManager
  ) { }

  @guard({
    resource: "note",
    action: "readOwn"
  })
  @query()
  async note(root: unknown, { id }: IQueryNoteArgs, context: AuthContext): Promise<IQuery["note"]> {
    const user = await context.user();
    if (!user) {
      throw HttpError.badRequest("Query.note requires a user token");
    }
    const note = user.notes.find(n => n._id === id);
    if (!note) {
      throw HttpError.notFound(`note id=${id} not found`);
    }
    return note;
  }

  @guard({
    resource: "note",
    action: "readOwn"
  })
  @query()
  async notes(root: unknown, args: unknown, context: AuthContext): Promise<IQuery["notes"]> {
    const user = await context.user();
    if (!user) {
      throw HttpError.badRequest("Query.notes requires a user token");
    }
    return user.notes.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
  }

  @guard({
    resource: "note",
    action: "updateOwn"
  })
  @mutation()
  async updateNoteBody(root: unknown, { id, body }: IMutationUpdateNoteBodyArgs, context: AuthContext): Promise<IMutation["updateNoteBody"]> {
    const user = await context.user();
    if (!user) {
      throw HttpError.badRequest("Mutation.updateNoteBody requires a user token");
    }
    await this.noteManager.update(user, { id, body });
    return true;
  }

  @guard({
    resource: "note",
    action: "createOwn"
  })
  @mutation()
  async createNote(root: unknown, { title }: IMutationCreateNoteArgs, context: AuthContext): Promise<IMutation["createNote"]> {
    const user = await context.user();
    if (!user) {
      throw HttpError.badRequest("Mutation.createNote requires a user token");
    }
    return this.noteManager.create(user, { title });
  }

  @guard({
    resource: "note",
    action: "deleteOwn"
  })
  @mutation()
  async removeNote(root: unknown, { id }: IMutationRemoveNoteArgs, context: AuthContext): Promise<IMutation["removeNote"]> {
    const user = await context.user();
    if (!user) {
      throw HttpError.badRequest("Mutation.removeNote requires a user token");
    }
    await this.noteManager.remove(user, id);
    return true;
  }
}
