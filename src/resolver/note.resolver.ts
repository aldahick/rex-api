import { guard,HttpError,mutation, query } from "@athenajs/core";
import { singleton } from "tsyringe";
import { IMutation, IMutationCreateNoteArgs, IMutationRemoveNoteArgs,IMutationUpdateNoteBodyArgs,IQuery, IQueryNoteArgs } from "../graphql/types";
import { AuthContext } from "../manager/auth";
import { UserManager } from "../manager/user";

@singleton()
export class NoteResolver {
  constructor(
    private userManager: UserManager
  ) { }

  @guard({
    resource: "note",
    action: "readOwn"
  })
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

  @guard({
    resource: "note",
    action: "readOwn"
  })
  @query()
  async notes(root: void, args: void, context: AuthContext): Promise<IQuery["notes"]> {
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
  async updateNoteBody(root: void, { id, body }: IMutationUpdateNoteBodyArgs, context: AuthContext): Promise<IMutation["updateNoteBody"]> {
    const user = await context.user();
    if (!user) {
      throw HttpError.badRequest("Mutation.updateNoteBody requires a user token");
    }
    await this.userManager.note.update(user, { id, body });
    return true;
  }

  @guard({
    resource: "note",
    action: "createOwn"
  })
  @mutation()
  async createNote(root: void, { title }: IMutationCreateNoteArgs, context: AuthContext): Promise<IMutation["createNote"]> {
    const user = await context.user();
    if (!user) {
      throw HttpError.badRequest("Mutation.createNote requires a user token");
    }
    return this.userManager.note.create(user, { title });
  }

  @guard({
    resource: "note",
    action: "deleteOwn"
  })
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
