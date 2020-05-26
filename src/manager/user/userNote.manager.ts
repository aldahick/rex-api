import { HttpError } from "@athenajs/core";
import { singleton } from "tsyringe";
import { User, UserNote } from "../../model/User";
import { DatabaseService } from "../../service/database";

@singleton()
export class UserNoteManager {
  constructor(
    private db: DatabaseService
  ) { }

  async update(user: User, { id, body }: { id: string; body: string }): Promise<void> {
    await this.db.users.updateOne({
      notes: {
        $elemMatch: {
          _id: id
        }
      }
    }, {
      $set: {
        "notes.$.body": body
      }
    });
  }

  async create(user: User, { title }: Pick<UserNote, "title">): Promise<UserNote> {
    const note = new UserNote({
      title,
      body: "",
      createdAt: new Date()
    });
    await this.db.users.updateOne({
      _id: user._id
    }, {
      $push: {
        notes: note
      }
    });
    const updatedUser = await this.db.users.findById(user._id);
    if (!updatedUser) { // just a possible race condition
      throw HttpError.notFound(`user id=${user._id}`);
    }
    const createdNote = updatedUser.notes.find(n =>
      n.title === note.title &&
      n.createdAt.getTime() === note.createdAt.getTime()
    );
    if (!createdNote) { // another race condition
      throw HttpError.notFound("created note");
    }
    return createdNote;
  }

  async remove(user: User, noteId: string): Promise<void> {
    await this.db.users.updateOne({
      _id: user._id
    }, {
      $pull: {
        notes: { _id: noteId }
      }
    });
  }
}
