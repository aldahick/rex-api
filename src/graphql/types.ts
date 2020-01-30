export type Maybe<T> = T | undefined;
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string,
  String: string,
  Boolean: boolean,
  Int: number,
  Float: number,
  Upload: File,
};

export enum ICacheControlScope {
  Public = 'PUBLIC',
  Private = 'PRIVATE'
}

export type IMutation = {
   __typename?: 'Mutation',
  hello: Scalars['String'],
  addPermissionsToRole: Scalars['Boolean'],
  createRole: IRole,
  addRoleToUser: Scalars['Boolean'],
  createUser: IUser,
};


export type IMutationAddPermissionsToRoleArgs = {
  roleId: Scalars['String'],
  permissions: Array<IRolePermissionInput>
};


export type IMutationCreateRoleArgs = {
  name: Scalars['String']
};


export type IMutationAddRoleToUserArgs = {
  userId: Scalars['String'],
  roleId: Scalars['String']
};


export type IMutationCreateUserArgs = {
  email: Scalars['String']
};

export type IQuery = {
   __typename?: 'Query',
  hello: Scalars['String'],
  roles: Array<IRole>,
  user: IUser,
};


export type IQueryUserArgs = {
  id?: Maybe<Scalars['String']>
};

export type IRole = {
   __typename?: 'Role',
  _id: Scalars['String'],
  name: Scalars['String'],
  permissions: Array<IRolePermission>,
};

export type IRolePermission = {
   __typename?: 'RolePermission',
  resource: Scalars['String'],
  action: Scalars['String'],
};

export type IRolePermissionInput = {
  action: Scalars['String'],
  resource: Scalars['String'],
};


export type IUser = {
   __typename?: 'User',
  _id: Scalars['String'],
  email: Scalars['String'],
  roles?: Maybe<Array<IRole>>,
  permissions?: Maybe<Array<IRolePermission>>,
};

