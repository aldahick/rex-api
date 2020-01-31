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

export type IAuthToken = {
   __typename?: 'AuthToken',
  token: Scalars['String'],
  user: IUser,
};

export enum ICacheControlScope {
  Public = 'PUBLIC',
  Private = 'PRIVATE'
}

export type IContainer = {
   __typename?: 'Container',
  _id: Scalars['String'],
  name: Scalars['String'],
  image: Scalars['String'],
  tag: Scalars['String'],
  status: IContainerStatus,
  host: IHost,
  ports: Array<IContainerPort>,
  variables: Array<IContainerVariable>,
};

export type IContainerPort = {
   __typename?: 'ContainerPort',
  containerPort: Scalars['Int'],
  hostPort?: Maybe<Scalars['Int']>,
  hostBindIp?: Maybe<Scalars['String']>,
};

export type IContainerPortInput = {
  containerPort: Scalars['Int'],
  hostPort?: Maybe<Scalars['Int']>,
  hostBindIp?: Maybe<Scalars['String']>,
};

export enum IContainerStatus {
  Running = 'RUNNING',
  Starting = 'STARTING',
  Stopped = 'STOPPED',
  Dead = 'DEAD'
}

export type IContainerVariable = {
   __typename?: 'ContainerVariable',
  name: Scalars['String'],
  value: Scalars['String'],
};

export type ICreateContainerInput = {
  name: Scalars['String'],
  image: Scalars['String'],
  tag: Scalars['String'],
  hostId: Scalars['String'],
};

export type IHost = {
   __typename?: 'Host',
  _id: Scalars['String'],
  name: Scalars['String'],
  hostname: Scalars['String'],
  containers?: Maybe<Array<IContainer>>,
};

export type IMutation = {
   __typename?: 'Mutation',
  hello: Scalars['String'],
  createAuthToken: IAuthToken,
  createContainer: IContainer,
  deleteContainers: Scalars['Boolean'],
  updateContainerPorts: Scalars['Boolean'],
  setContainerVariable: Scalars['Boolean'],
  removeContainerVariable: Scalars['Boolean'],
  addPermissionsToRole: Scalars['Boolean'],
  createRole: IRole,
  createHost: IHost,
  addRoleToUser: Scalars['Boolean'],
  createUser: IUser,
};


export type IMutationCreateAuthTokenArgs = {
  googleIdToken: Scalars['String']
};


export type IMutationCreateContainerArgs = {
  container: ICreateContainerInput
};


export type IMutationDeleteContainersArgs = {
  ids: Array<Scalars['String']>
};


export type IMutationUpdateContainerPortsArgs = {
  containerId: Scalars['String'],
  ports: Array<IContainerPortInput>
};


export type IMutationSetContainerVariableArgs = {
  containerId: Scalars['String'],
  name: Scalars['String'],
  value: Scalars['String']
};


export type IMutationRemoveContainerVariableArgs = {
  containerId: Scalars['String'],
  name: Scalars['String']
};


export type IMutationAddPermissionsToRoleArgs = {
  roleId: Scalars['String'],
  permissions: Array<IRolePermissionInput>
};


export type IMutationCreateRoleArgs = {
  name: Scalars['String']
};


export type IMutationCreateHostArgs = {
  name: Scalars['String'],
  hostname: Scalars['String']
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
  container: IContainer,
  containers: Array<IContainer>,
  roles: Array<IRole>,
  host: IHost,
  hosts: Array<IHost>,
  user: IUser,
};


export type IQueryContainerArgs = {
  id: Scalars['String']
};


export type IQueryHostArgs = {
  id: Scalars['String']
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

