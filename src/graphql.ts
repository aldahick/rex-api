export type Maybe<T> = T | undefined;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
  DateTime: Date;
};

export type IMutation = {
  __typename?: 'Mutation';
  addCalendar: Scalars['Boolean'];
  addMediaDownload: IProgress;
  addRoleToUser: Scalars['Boolean'];
  createAuthToken: IAuthToken;
  createAuthTokenGoogle: IAuthToken;
  createAuthTokenLocal: IAuthToken;
  createContainer: IContainer;
  createGarageDoor: IGarageDoor;
  createHost: IHost;
  createNote: INote;
  createRole: IRole;
  createRummikubGame: IRummikubGame;
  createUser: IUser;
  deleteContainers: Scalars['Boolean'];
  deleteGarageDoor: Scalars['Boolean'];
  deleteRole: Scalars['Boolean'];
  deregisterNotificationDevice: Scalars['Boolean'];
  emitPushNotification: Scalars['Boolean'];
  fetchSteamGames: IProgress;
  fetchWikiPagesUntil: IProgress;
  hello: Scalars['String'];
  redeployContainer: Scalars['Boolean'];
  registerNotificationDevice: Scalars['Boolean'];
  removeCalendar: Scalars['Boolean'];
  removeNote: Scalars['Boolean'];
  removeSecret: Scalars['Boolean'];
  setSecret: Scalars['Boolean'];
  setUserPassword: Scalars['Boolean'];
  startContainer: Scalars['Boolean'];
  stopContainer: Scalars['Boolean'];
  toggleGarageDoor: Scalars['Boolean'];
  updateContainerPorts: Scalars['Boolean'];
  updateContainerVariables: Scalars['Boolean'];
  updateContainerVolumes: Scalars['Boolean'];
  updateNoteBody: Scalars['Boolean'];
  updateRole: Scalars['Boolean'];
  updateRolePermissions: Scalars['Boolean'];
};


export type IMutationAddCalendarArgs = {
  name: Scalars['String'];
  url: Scalars['String'];
};


export type IMutationAddMediaDownloadArgs = {
  url: Scalars['String'];
  destinationKey: Scalars['String'];
};


export type IMutationAddRoleToUserArgs = {
  userId: Scalars['String'];
  roleId: Scalars['String'];
};


export type IMutationCreateAuthTokenArgs = {
  userId: Scalars['String'];
};


export type IMutationCreateAuthTokenGoogleArgs = {
  googleIdToken: Scalars['String'];
  clientType: IAuthClientType;
};


export type IMutationCreateAuthTokenLocalArgs = {
  username: Scalars['String'];
  password: Scalars['String'];
};


export type IMutationCreateContainerArgs = {
  container: ICreateContainerInput;
};


export type IMutationCreateGarageDoorArgs = {
  name: Scalars['String'];
};


export type IMutationCreateHostArgs = {
  host: ICreateHostInput;
};


export type IMutationCreateNoteArgs = {
  title: Scalars['String'];
};


export type IMutationCreateRoleArgs = {
  name: Scalars['String'];
};


export type IMutationCreateRummikubGameArgs = {
  name: Scalars['String'];
  privacy: IRummikubGamePrivacy;
};


export type IMutationCreateUserArgs = {
  email: Scalars['String'];
  username?: Maybe<Scalars['String']>;
  password?: Maybe<Scalars['String']>;
};


export type IMutationDeleteContainersArgs = {
  ids: Array<Scalars['String']>;
};


export type IMutationDeleteGarageDoorArgs = {
  id: Scalars['String'];
};


export type IMutationDeleteRoleArgs = {
  id: Scalars['String'];
};


export type IMutationDeregisterNotificationDeviceArgs = {
  platform: INotificationPlatform;
};


export type IMutationEmitPushNotificationArgs = {
  userId: Scalars['String'];
  platform: INotificationPlatform;
  message: Scalars['String'];
};


export type IMutationFetchWikiPagesUntilArgs = {
  firstPageName: Scalars['String'];
  untilPageName: Scalars['String'];
};


export type IMutationRedeployContainerArgs = {
  containerId: Scalars['String'];
};


export type IMutationRegisterNotificationDeviceArgs = {
  platform: INotificationPlatform;
  token: Scalars['String'];
};


export type IMutationRemoveCalendarArgs = {
  id: Scalars['String'];
};


export type IMutationRemoveNoteArgs = {
  id: Scalars['String'];
};


export type IMutationRemoveSecretArgs = {
  key: Scalars['String'];
};


export type IMutationSetSecretArgs = {
  key: Scalars['String'];
  value: Scalars['String'];
};


export type IMutationSetUserPasswordArgs = {
  userId: Scalars['String'];
  password: Scalars['String'];
};


export type IMutationStartContainerArgs = {
  containerId: Scalars['String'];
};


export type IMutationStopContainerArgs = {
  containerId: Scalars['String'];
};


export type IMutationToggleGarageDoorArgs = {
  id: Scalars['String'];
};


export type IMutationUpdateContainerPortsArgs = {
  containerId: Scalars['String'];
  ports: Array<IContainerPortInput>;
};


export type IMutationUpdateContainerVariablesArgs = {
  containerId: Scalars['String'];
  variables: Array<IContainerVariableInput>;
};


export type IMutationUpdateContainerVolumesArgs = {
  containerId: Scalars['String'];
  volumes: Array<IContainerVolumeInput>;
};


export type IMutationUpdateNoteBodyArgs = {
  id: Scalars['String'];
  body: Scalars['String'];
};


export type IMutationUpdateRoleArgs = {
  id: Scalars['String'];
  name: Scalars['String'];
};


export type IMutationUpdateRolePermissionsArgs = {
  id: Scalars['String'];
  permissions: Array<IRolePermissionInput>;
};

export type IQuery = {
  __typename?: 'Query';
  calendars: Array<ICalendar>;
  container: IContainer;
  containers: Array<IContainer>;
  hello: Scalars['String'];
  host: IHost;
  hosts: Array<IHost>;
  mediaItems: Array<IMediaItem>;
  note: INote;
  notes: Array<INote>;
  notificationDevices: Array<INotificationDevice>;
  progress: IProgress;
  roles: Array<IRole>;
  rummikubGames: Array<IRummikubGame>;
  secret: ISecret;
  secrets: Array<ISecret>;
  steamGames: Array<ISteamGame>;
  steamPlayer: ISteamPlayer;
  steamPlayers: Array<ISteamPlayer>;
  user: IUser;
  users: Array<IUser>;
  wikiPage: IWikiPage;
};


export type IQueryContainerArgs = {
  id: Scalars['String'];
};


export type IQueryHostArgs = {
  id: Scalars['String'];
};


export type IQueryMediaItemsArgs = {
  dir: Scalars['String'];
};


export type IQueryNoteArgs = {
  id: Scalars['String'];
};


export type IQueryNotificationDevicesArgs = {
  userId?: Maybe<Scalars['String']>;
};


export type IQueryProgressArgs = {
  id: Scalars['String'];
};


export type IQuerySecretArgs = {
  key: Scalars['String'];
};


export type IQuerySecretsArgs = {
  prefix: Scalars['String'];
};


export type IQuerySteamGamesArgs = {
  page: Scalars['Int'];
  search: Scalars['String'];
};


export type IQuerySteamPlayerArgs = {
  steamId64: Scalars['String'];
};


export type IQuerySteamPlayersArgs = {
  steamIds64: Array<Scalars['String']>;
};


export type IQueryUserArgs = {
  id?: Maybe<Scalars['String']>;
};


export type IQueryWikiPageArgs = {
  name: Scalars['String'];
};

export enum IAuthClientType {
  Mobile = 'MOBILE',
  Web = 'WEB'
}

export type IAuthToken = {
  __typename?: 'AuthToken';
  token: Scalars['String'];
  user: IUser;
};

export type ICalendar = {
  __typename?: 'Calendar';
  _id: Scalars['String'];
  name: Scalars['String'];
  url: Scalars['String'];
};

export type IContainer = {
  __typename?: 'Container';
  _id: Scalars['String'];
  name: Scalars['String'];
  image: Scalars['String'];
  tag: Scalars['String'];
  status: IContainerStatus;
  host: IHost;
  networkName: Scalars['String'];
  ports: Array<IContainerPort>;
  variables: Array<IContainerVariable>;
  volumes: Array<IContainerVolume>;
};

export type IContainerPort = {
  __typename?: 'ContainerPort';
  containerPort: Scalars['Int'];
  hostPort?: Maybe<Scalars['Int']>;
  hostBindIp?: Maybe<Scalars['String']>;
};

export enum IContainerStatus {
  Running = 'RUNNING',
  Starting = 'STARTING',
  Stopped = 'STOPPED',
  Dead = 'DEAD',
  Unknown = 'UNKNOWN'
}

export type IContainerVariable = {
  __typename?: 'ContainerVariable';
  name: Scalars['String'];
  value: Scalars['String'];
};

export type IContainerVolume = {
  __typename?: 'ContainerVolume';
  hostPath: Scalars['String'];
  containerPath: Scalars['String'];
};

export type ICreateContainerInput = {
  name: Scalars['String'];
  image: Scalars['String'];
  tag: Scalars['String'];
  hostId: Scalars['String'];
  networkName: Scalars['String'];
};

export type IContainerPortInput = {
  containerPort: Scalars['Int'];
  hostPort?: Maybe<Scalars['Int']>;
  hostBindIp?: Maybe<Scalars['String']>;
};

export type IContainerVariableInput = {
  name: Scalars['String'];
  value: Scalars['String'];
};

export type IContainerVolumeInput = {
  hostPath: Scalars['String'];
  containerPath: Scalars['String'];
};

export type IGarageDoor = {
  __typename?: 'GarageDoor';
  _id: Scalars['String'];
  name: Scalars['String'];
  isOpen: Scalars['Boolean'];
};

export type IGarageDoorStatusPayload = {
  __typename?: 'GarageDoorStatusPayload';
  id: Scalars['String'];
  isOpen: Scalars['Boolean'];
};

export type IGarageDoorTogglePayload = {
  __typename?: 'GarageDoorTogglePayload';
  id: Scalars['String'];
};

export type IGarageDoorsPayload = {
  __typename?: 'GarageDoorsPayload';
  garageDoors: Array<IGarageDoor>;
};

export type IHost = {
  __typename?: 'Host';
  _id: Scalars['String'];
  name: Scalars['String'];
  hostname: Scalars['String'];
  containers?: Maybe<Array<IContainer>>;
};

export type ICreateHostInput = {
  name: Scalars['String'];
  hostname: Scalars['String'];
  dockerEndpoint: Scalars['String'];
};

export type IMediaItem = {
  __typename?: 'MediaItem';
  key: Scalars['String'];
  type: IMediaItemType;
};

export enum IMediaItemType {
  File = 'file',
  Directory = 'directory',
  Series = 'series'
}

export type INote = {
  __typename?: 'Note';
  _id: Scalars['String'];
  createdAt: Scalars['DateTime'];
  title: Scalars['String'];
  body: Scalars['String'];
};

export type INotificationDevice = {
  __typename?: 'NotificationDevice';
  platform: INotificationPlatform;
  arn?: Maybe<Scalars['String']>;
};

export enum INotificationPlatform {
  Ios = 'ios'
}

export type IProgress = {
  __typename?: 'Progress';
  _id: Scalars['String'];
  action: Scalars['String'];
  createdAt: Scalars['DateTime'];
  status: IProgressStatus;
  logs: Array<IProgressLog>;
};

export type IProgressLog = {
  __typename?: 'ProgressLog';
  createdAt: Scalars['DateTime'];
  text: Scalars['String'];
};

export enum IProgressStatus {
  Created = 'CREATED',
  InProgress = 'IN_PROGRESS',
  Complete = 'COMPLETE',
  Errored = 'ERRORED'
}

export enum IQueueEventType {
  GarageDoorStatus = 'garageDoorStatus',
  ToggleGarageDoor = 'toggleGarageDoor'
}

export type IRole = {
  __typename?: 'Role';
  _id: Scalars['String'];
  name: Scalars['String'];
  permissions: Array<IRolePermission>;
};

export type IRolePermission = {
  __typename?: 'RolePermission';
  resource: Scalars['String'];
  action: Scalars['String'];
};

export type IRolePermissionInput = {
  action: Scalars['String'];
  resource: Scalars['String'];
};

export type IRummikubCard = {
  __typename?: 'RummikubCard';
  color: IRummikubCardColor;
  value?: Maybe<Scalars['Int']>;
};

export enum IRummikubCardColor {
  Black = 'black',
  Blue = 'blue',
  Red = 'red',
  Yellow = 'yellow'
}

export type IRummikubGame = {
  __typename?: 'RummikubGame';
  _id: Scalars['String'];
  name: Scalars['String'];
  playerNames: Array<Scalars['String']>;
};

export enum IRummikubGamePrivacy {
  Public = 'public',
  Unlisted = 'unlisted'
}

export type IRummikubPlayer = {
  __typename?: 'RummikubPlayer';
  _id: Scalars['String'];
  name: Scalars['String'];
};

export type IRummikubClientChatPayload = {
  __typename?: 'RummikubClientChatPayload';
  message: Scalars['String'];
};

export type IRummikubClientJoinPayload = {
  __typename?: 'RummikubClientJoinPayload';
  gameId: Scalars['String'];
  displayName: Scalars['String'];
};

export type IRummikubClientPlaceCardPayload = {
  __typename?: 'RummikubClientPlaceCardPayload';
  fromRowIndex?: Maybe<Scalars['Int']>;
  fromCardIndex: Scalars['Int'];
  toRowIndex?: Maybe<Scalars['Int']>;
  toCardIndex: Scalars['Int'];
};

export type IRummikubServerBoardPayload = {
  __typename?: 'RummikubServerBoardPayload';
  board: Array<Array<IRummikubCard>>;
};

export type IRummikubServerChatPayload = {
  __typename?: 'RummikubServerChatPayload';
  id: Scalars['String'];
  author?: Maybe<IRummikubPlayer>;
  createdAt: Scalars['String'];
  message: Scalars['String'];
};

export type IRummikubServerHandPayload = {
  __typename?: 'RummikubServerHandPayload';
  hand: Array<IRummikubCard>;
};

export type IRummikubServerPlayersPayload = {
  __typename?: 'RummikubServerPlayersPayload';
  players: Array<IRummikubPlayer>;
  self: IRummikubPlayer;
};

export type IRummikubServerTurnPayload = {
  __typename?: 'RummikubServerTurnPayload';
  player: IRummikubPlayer;
};


export type ISecret = {
  __typename?: 'Secret';
  key: Scalars['String'];
  value: Scalars['String'];
};

export type ISteamGame = {
  __typename?: 'SteamGame';
  _id: Scalars['Int'];
  name: Scalars['String'];
};

export type ISteamPlayer = {
  __typename?: 'SteamPlayer';
  _id: Scalars['String'];
  nickname: Scalars['String'];
  avatarUrl: Scalars['String'];
  profileUrl: Scalars['String'];
  playingGame?: Maybe<ISteamGame>;
  ownedGames: Array<ISteamGame>;
};

export type IUser = {
  __typename?: 'User';
  _id: Scalars['String'];
  email: Scalars['String'];
  username?: Maybe<Scalars['String']>;
  roles?: Maybe<Array<IRole>>;
  permissions?: Maybe<Array<IRolePermission>>;
};

export type IWikiPage = {
  __typename?: 'WikiPage';
  _id: Scalars['String'];
  name: Scalars['String'];
  firstLinkedPage?: Maybe<IWikiPage>;
};
