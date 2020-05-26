import { HttpError,mutation, query } from "@athenajs/core";
import { singleton } from "tsyringe";
import { IMutation, IMutationCreateNoteArgs, IMutationRemoveNoteArgs,IQuery, IQueryNoteArgs } from "../graphql/types";
import { AuthContext } from "../manager/auth";
import { UserManager } from "../manager/user";

@singleton()
export class NoteResolver {
  constructor(
    private userManager: UserManager
  ) { }

  @query()
  async note(root: void, { id }: IQueryNoteArgs, context: AuthContext): Promise<IQuery["note"]> {
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

  @query()
  async notes(root: void, args: void, context: AuthContext): Promise<IQuery["notes"]> {
    const user = await context.user();
    if (!user) {
      throw HttpError.badRequest("Query.notes requires a user token");
    }
    return user.notes.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
  }

  @mutation()
  async createNote(root: void, { title }: IMutationCreateNoteArgs, context: AuthContext): Promise<IMutation["createNote"]> {
    const user = await context.user();
    if (!user) {
      throw HttpError.badRequest("Mutation.createNote requires a user token");
    }
    return this.userManager.note.create(user, { title });
  }

  @mutation()
  async removeNote(root: void, { id }: IMutationRemoveNoteArgs, context: AuthContext): Promise<IMutation["removeNote"]> {
    const user = await context.user();
    if (!user) {
      throw HttpError.badRequest("Mutation.removeNote requires a user token");
    }
    await this.userManager.note.remove(user, id);
    return true;
  }
}
