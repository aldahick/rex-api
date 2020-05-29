export type Maybe<T> = T | undefined;
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
  DateTime: Date;
  /** The `Upload` scalar type represents a file upload. */
  Upload: File;
};

export type IAuthToken = {
  __typename?: 'AuthToken';
  token: Scalars['String'];
  user: IUser;
};

export enum ICacheControlScope {
  Public = 'PUBLIC',
  Private = 'PRIVATE'
}

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

export type IContainerPortInput = {
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

export type IContainerVariableInput = {
  name: Scalars['String'];
  value: Scalars['String'];
};

export type IContainerVolume = {
  __typename?: 'ContainerVolume';
  hostPath: Scalars['String'];
  containerPath: Scalars['String'];
};

export type IContainerVolumeInput = {
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

export type ICreateHostInput = {
  name: Scalars['String'];
  hostname: Scalars['String'];
  dockerEndpoint: Scalars['String'];
};


export type IHost = {
  __typename?: 'Host';
  _id: Scalars['String'];
  name: Scalars['String'];
  hostname: Scalars['String'];
  containers?: Maybe<Array<IContainer>>;
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

export type IMutation = {
  __typename?: 'Mutation';
  hello: Scalars['String'];
  createAuthTokenGoogle: IAuthToken;
  /** username can also be email */
  createAuthTokenLocal: IAuthToken;
  /** requires auth */
  createAuthToken: IAuthToken;
  addCalendar: Scalars['Boolean'];
  removeCalendar: Scalars['Boolean'];
  createContainer: IContainer;
  deleteContainers: Scalars['Boolean'];
  updateContainerPorts: Scalars['Boolean'];
  updateContainerVariables: Scalars['Boolean'];
  updateContainerVolumes: Scalars['Boolean'];
  startContainer: Scalars['Boolean'];
  stopContainer: Scalars['Boolean'];
  redeployContainer: Scalars['Boolean'];
  addMediaDownload: IProgress;
  createHost: IHost;
  createNote: INote;
  removeNote: Scalars['Boolean'];
  updateNoteBody: Scalars['Boolean'];
  addPermissionsToRole: Scalars['Boolean'];
  createRole: IRole;
  fetchSteamGames: IProgress;
  addRoleToUser: Scalars['Boolean'];
  createUser: IUser;
  setUserPassword: Scalars['Boolean'];
  fetchWikiPagesUntil: IProgress;
  createRummikubGame: IRummikubGame;
};


export type IMutationCreateAuthTokenGoogleArgs = {
  googleIdToken: Scalars['String'];
};


export type IMutationCreateAuthTokenLocalArgs = {
  username: Scalars['String'];
  password: Scalars['String'];
};


export type IMutationCreateAuthTokenArgs = {
  userId: Scalars['String'];
};


export type IMutationAddCalendarArgs = {
  name: Scalars['String'];
  url: Scalars['String'];
};


export type IMutationRemoveCalendarArgs = {
  id: Scalars['String'];
};


export type IMutationCreateContainerArgs = {
  container: ICreateContainerInput;
};


export type IMutationDeleteContainersArgs = {
  ids: Array<Scalars['String']>;
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


export type IMutationStartContainerArgs = {
  containerId: Scalars['String'];
};


export type IMutationStopContainerArgs = {
  containerId: Scalars['String'];
};


export type IMutationRedeployContainerArgs = {
  containerId: Scalars['String'];
};


export type IMutationAddMediaDownloadArgs = {
  url: Scalars['String'];
  destinationKey: Scalars['String'];
};


export type IMutationCreateHostArgs = {
  host: ICreateHostInput;
};


export type IMutationCreateNoteArgs = {
  title: Scalars['String'];
};


export type IMutationRemoveNoteArgs = {
  id: Scalars['String'];
};


export type IMutationUpdateNoteBodyArgs = {
  id: Scalars['String'];
  body: Scalars['String'];
};


export type IMutationAddPermissionsToRoleArgs = {
  roleId: Scalars['String'];
  permissions: Array<IRolePermissionInput>;
};


export type IMutationCreateRoleArgs = {
  name: Scalars['String'];
};


export type IMutationAddRoleToUserArgs = {
  userId: Scalars['String'];
  roleId: Scalars['String'];
};


export type IMutationCreateUserArgs = {
  email: Scalars['String'];
  username?: Maybe<Scalars['String']>;
  password?: Maybe<Scalars['String']>;
};


export type IMutationSetUserPasswordArgs = {
  userId: Scalars['String'];
  password: Scalars['String'];
};


export type IMutationFetchWikiPagesUntilArgs = {
  firstPageName: Scalars['String'];
  untilPageName: Scalars['String'];
};


export type IMutationCreateRummikubGameArgs = {
  name: Scalars['String'];
  privacy: IRummikubGamePrivacy;
};

export type INote = {
  __typename?: 'Note';
  _id: Scalars['String'];
  createdAt: Scalars['DateTime'];
  title: Scalars['String'];
  body: Scalars['String'];
};

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

export type IQuery = {
  __typename?: 'Query';
  hello: Scalars['String'];
  calendars: Array<ICalendar>;
  container: IContainer;
  containers: Array<IContainer>;
  mediaItems: Array<IMediaItem>;
  host: IHost;
  hosts: Array<IHost>;
  note: INote;
  notes: Array<INote>;
  progress: IProgress;
  roles: Array<IRole>;
  steamGames: Array<ISteamGame>;
  steamPlayer: ISteamPlayer;
  steamPlayers: Array<ISteamPlayer>;
  user: IUser;
  wikiPage: IWikiPage;
  /** only shows public games */
  rummikubGames: Array<IRummikubGame>;
};


export type IQueryContainerArgs = {
  id: Scalars['String'];
};


export type IQueryMediaItemsArgs = {
  dir: Scalars['String'];
};


export type IQueryHostArgs = {
  id: Scalars['String'];
};


export type IQueryNoteArgs = {
  id: Scalars['String'];
};


export type IQueryProgressArgs = {
  id: Scalars['String'];
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
  /** if null, wildcard */
  value?: Maybe<Scalars['Int']>;
};

export enum IRummikubCardColor {
  Black = 'black',
  Blue = 'blue',
  Red = 'red',
  Yellow = 'yellow'
}

/** rummikub.client.chat */
export type IRummikubClientChatPayload = {
  __typename?: 'RummikubClientChatPayload';
  message: Scalars['String'];
};

/** rummikub.client.join */
export type IRummikubClientJoinPayload = {
  __typename?: 'RummikubClientJoinPayload';
  gameId: Scalars['String'];
  displayName: Scalars['String'];
};

/** rummikub.client.placeCards */
export type IRummikubClientPlaceCardsPayload = {
  __typename?: 'RummikubClientPlaceCardsPayload';
  cards: Array<IRummikubCard>;
  /** which row these cards are going to */
  boardIndex: Scalars['Int'];
  /** where in the row these cards are going */
  rowIndex: Scalars['Int'];
};

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

/** rummikub.server.board */
export type IRummikubServerBoardPayload = {
  __typename?: 'RummikubServerBoardPayload';
  board: Array<Array<IRummikubCard>>;
};

/** rummikub.server.chat */
export type IRummikubServerChatPayload = {
  __typename?: 'RummikubServerChatPayload';
  id: Scalars['String'];
  /** if null, author is system */
  author?: Maybe<IRummikubPlayer>;
  /** ISO8601 */
  createdAt: Scalars['String'];
  message: Scalars['String'];
};

/** rummikub.server.hand */
export type IRummikubServerHandPayload = {
  __typename?: 'RummikubServerHandPayload';
  hand: Array<IRummikubCard>;
};

/** rummikub.server.players */
export type IRummikubServerPlayersPayload = {
  __typename?: 'RummikubServerPlayersPayload';
  players: Array<IRummikubPlayer>;
};

/** rummikub.server.turn */
export type IRummikubServerTurnPayload = {
  __typename?: 'RummikubServerTurnPayload';
  player: IRummikubPlayer;
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

