import { HttpError } from "@athenajs/core";
import { DocumentType } from "@typegoose/typegoose";
import * as _ from "lodash";
import { singleton } from "tsyringe";
import { Role, RolePermission } from "../../model/Role";
import { DatabaseService } from "../../service/database";

@singleton()
export class RoleManager {
  constructor(
    private readonly db: DatabaseService
  ) { }

  async get(id: string): Promise<Role> {
    const role = await this.db.roles.findById(id);
    if (!role) {
      throw HttpError.notFound(`role id=${id} not found`);
    }
    return role.toObject() as Role;
  }

  async getAll(): Promise<Role[]> {
    return this.db.roles.find();
  }

  async create(name: string): Promise<Role> {
    return this.db.roles.create(new Role({
      name,
      permissions: []
    }));
  }

  async delete(role: Role): Promise<void> {
    await this.db.roles.deleteOne({
      _id: role._id
    });
  }

  async update(role: Role, { name }: { name: string }): Promise<void> {
    await this.db.roles.updateOne({
      _id: role._id
    }, {
      $set: {
        name
      }
    });
  }

  async setPermissions(role: Role, permissions: RolePermission[]): Promise<void> {
    await this.db.roles.updateOne({
      _id: role._id
    }, {
      $set: {
        permissions
      }
    });
  }

  toPermissions(roles: Role[]): (RolePermission & { roleName: string })[] {
    return _.flatten(roles.map(role =>
      (role.permissions as DocumentType<RolePermission>[]).map(permission => ({
        ...permission.toObject() as RolePermission,
        roleName: role.name
      }))
    ));
  }
}
