export type Maybe<T> = T | undefined;
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string,
  String: string,
  Boolean: boolean,
  Int: number,
  Float: number,
  DateTime: Date,
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
  networkName: Scalars['String'],
  ports: Array<IContainerPort>,
  variables: Array<IContainerVariable>,
  volumes: Array<IContainerVolume>,
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
  Dead = 'DEAD',
  Unknown = 'UNKNOWN'
}

export type IContainerVariable = {
   __typename?: 'ContainerVariable',
  name: Scalars['String'],
  value: Scalars['String'],
};

export type IContainerVariableInput = {
  name: Scalars['String'],
  value: Scalars['String'],
};

export type IContainerVolume = {
   __typename?: 'ContainerVolume',
  hostPath: Scalars['String'],
  containerPath: Scalars['String'],
};

export type IContainerVolumeInput = {
  hostPath: Scalars['String'],
  containerPath: Scalars['String'],
};

export type ICreateContainerInput = {
  name: Scalars['String'],
  image: Scalars['String'],
  tag: Scalars['String'],
  hostId: Scalars['String'],
  networkName: Scalars['String'],
};

export type ICreateHostInput = {
  name: Scalars['String'],
  hostname: Scalars['String'],
  dockerEndpoint: Scalars['String'],
};


export type IHost = {
   __typename?: 'Host',
  _id: Scalars['String'],
  name: Scalars['String'],
  hostname: Scalars['String'],
  containers?: Maybe<Array<IContainer>>,
};

export type IMediaItem = {
   __typename?: 'MediaItem',
  key: Scalars['String'],
  type: IMediaItemType,
};

export enum IMediaItemType {
  File = 'file',
  Directory = 'directory',
  Series = 'series'
}

export type IMutation = {
   __typename?: 'Mutation',
  hello: Scalars['String'],
  createAuthToken: IAuthToken,
  createContainer: IContainer,
  deleteContainers: Scalars['Boolean'],
  updateContainerPorts: Scalars['Boolean'],
  updateContainerVariables: Scalars['Boolean'],
  updateContainerVolumes: Scalars['Boolean'],
  startContainer: Scalars['Boolean'],
  stopContainer: Scalars['Boolean'],
  redeployContainer: Scalars['Boolean'],
  createHost: IHost,
  addPermissionsToRole: Scalars['Boolean'],
  createRole: IRole,
  addRoleToUser: Scalars['Boolean'],
  createUser: IUser,
  fetchWikiPagesUntil: IProgress,
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


export type IMutationUpdateContainerVariablesArgs = {
  containerId: Scalars['String'],
  variables: Array<IContainerVariableInput>
};


export type IMutationUpdateContainerVolumesArgs = {
  containerId: Scalars['String'],
  volumes: Array<IContainerVolumeInput>
};


export type IMutationStartContainerArgs = {
  containerId: Scalars['String']
};


export type IMutationStopContainerArgs = {
  containerId: Scalars['String']
};


export type IMutationRedeployContainerArgs = {
  containerId: Scalars['String']
};


export type IMutationCreateHostArgs = {
  host: ICreateHostInput
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


export type IMutationFetchWikiPagesUntilArgs = {
  firstPageName: Scalars['String'],
  untilPageName: Scalars['String']
};

export type IProgress = {
   __typename?: 'Progress',
  _id: Scalars['String'],
  action: Scalars['String'],
  createdAt: Scalars['DateTime'],
  status: IProgressStatus,
  logs: Array<IProgressLog>,
};

export type IProgressLog = {
   __typename?: 'ProgressLog',
  createdAt: Scalars['DateTime'],
  text: Scalars['String'],
};

export enum IProgressStatus {
  Created = 'CREATED',
  InProgress = 'IN_PROGRESS',
  Complete = 'COMPLETE',
  Errored = 'ERRORED'
}

export type IQuery = {
   __typename?: 'Query',
  hello: Scalars['String'],
  container: IContainer,
  containers: Array<IContainer>,
  host: IHost,
  hosts: Array<IHost>,
  mediaItems: Array<IMediaItem>,
  progress: IProgress,
  roles: Array<IRole>,
  user: IUser,
  wikiPage: IWikiPage,
};


export type IQueryContainerArgs = {
  id: Scalars['String']
};


export type IQueryHostArgs = {
  id: Scalars['String']
};


export type IQueryMediaItemsArgs = {
  dir: Scalars['String']
};


export type IQueryProgressArgs = {
  id: Scalars['String']
};


export type IQueryUserArgs = {
  id?: Maybe<Scalars['String']>
};


export type IQueryWikiPageArgs = {
  name: Scalars['String']
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

export type IWikiPage = {
   __typename?: 'WikiPage',
  _id: Scalars['String'],
  name: Scalars['String'],
  firstLinkedPage?: Maybe<IWikiPage>,
};

