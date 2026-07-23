/* eslint-disable */
import { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
  JSON: { input: unknown; output: unknown; }
  Time: { input: string; output: string; }
};

export type ApiEndpoint = {
  apiGroupId: Scalars['ID']['output'];
  createdAt: Scalars['Time']['output'];
  createdBy: Scalars['ID']['output'];
  createdByCommitHash?: Maybe<Scalars['String']['output']>;
  description: Scalars['String']['output'];
  exampleRequests: Scalars['String']['output'];
  exampleResponses: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  method: Scalars['String']['output'];
  operationId: Scalars['String']['output'];
  order: Scalars['Float']['output'];
  orgId: Scalars['ID']['output'];
  parameters: Scalars['String']['output'];
  path: Scalars['String']['output'];
  requestBody: Scalars['String']['output'];
  responses: Scalars['String']['output'];
  serviceId: Scalars['ID']['output'];
  summary: Scalars['String']['output'];
  tags: Array<Scalars['String']['output']>;
  updatedAt: Scalars['Time']['output'];
  updatedBy?: Maybe<Scalars['ID']['output']>;
  updatedByCommitHash?: Maybe<Scalars['String']['output']>;
};

export type ApiGroup = {
  createdAt: Scalars['Time']['output'];
  createdBy: Scalars['ID']['output'];
  createdByCommitHash?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  label?: Maybe<Scalars['String']['output']>;
  name: Scalars['String']['output'];
  orgId: Scalars['ID']['output'];
  protocol: Scalars['String']['output'];
  serviceId: Scalars['ID']['output'];
  specHash?: Maybe<Scalars['String']['output']>;
  specKey?: Maybe<Scalars['String']['output']>;
  updatedAt: Scalars['Time']['output'];
  updatedBy?: Maybe<Scalars['ID']['output']>;
  updatedByCommitHash?: Maybe<Scalars['String']['output']>;
  version: Scalars['String']['output'];
};

export type ApiGroupVersion = {
  apiGroupId: Scalars['ID']['output'];
  createdAt: Scalars['Time']['output'];
  createdBy: Scalars['ID']['output'];
  createdByActor?: Maybe<Actor>;
  createdByCommitHash?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  isAutoVersion: Scalars['Boolean']['output'];
  label?: Maybe<Scalars['String']['output']>;
  orgId: Scalars['ID']['output'];
  specHash: Scalars['String']['output'];
  specKey: Scalars['String']['output'];
  versionNumber: Scalars['Int']['output'];
};

export type ApiTestCase = {
  apiSpecId?: Maybe<Scalars['String']['output']>;
  assertions?: Maybe<Array<Assertion>>;
  auth?: Maybe<AuthConfig>;
  expectedStatusCode?: Maybe<Scalars['Int']['output']>;
  httpMethod: Scalars['String']['output'];
  maxResponseTimeMs?: Maybe<Scalars['Int']['output']>;
  operationId?: Maybe<Scalars['String']['output']>;
  queryParams?: Maybe<Array<KeyValue>>;
  requestBody?: Maybe<Scalars['String']['output']>;
  requestHeaders?: Maybe<Array<KeyValue>>;
  responseBody?: Maybe<Scalars['String']['output']>;
};

export type ApiTestCaseInput = {
  apiSpecId?: InputMaybe<Scalars['String']['input']>;
  assertions?: InputMaybe<Array<AssertionInput>>;
  auth?: InputMaybe<AuthConfigInput>;
  expectedStatusCode?: InputMaybe<Scalars['Int']['input']>;
  httpMethod: Scalars['String']['input'];
  maxResponseTimeMs?: InputMaybe<Scalars['Int']['input']>;
  operationId?: InputMaybe<Scalars['String']['input']>;
  queryParams?: InputMaybe<Array<KeyValueInput>>;
  requestBody?: InputMaybe<Scalars['String']['input']>;
  requestHeaders?: InputMaybe<Array<KeyValueInput>>;
  responseBody?: InputMaybe<Scalars['String']['input']>;
};

export type Actor = {
  avatarUrl?: Maybe<Scalars['String']['output']>;
  disabled: Scalars['Boolean']['output'];
  email?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
  type: Scalars['String']['output'];
};

export type AddMemberInput = {
  email: Scalars['String']['input'];
  name: Scalars['String']['input'];
  password: Scalars['String']['input'];
  role: Scalars['String']['input'];
};

export type Assertion = {
  field: Scalars['String']['output'];
  type: Scalars['String']['output'];
  value: Scalars['String']['output'];
};

export type AssertionInput = {
  field: Scalars['String']['input'];
  type: Scalars['String']['input'];
  value: Scalars['String']['input'];
};

export type AssetUrl = {
  assetId: Scalars['ID']['output'];
  url: Scalars['String']['output'];
};

export type AssetUpload = {
  assetId: Scalars['ID']['output'];
  uploadUrl: Scalars['String']['output'];
};

export type AuthConfig = {
  apiKeyHeader?: Maybe<Scalars['String']['output']>;
  apiKeyValue?: Maybe<Scalars['String']['output']>;
  basicPassword?: Maybe<Scalars['String']['output']>;
  basicUsername?: Maybe<Scalars['String']['output']>;
  bearerToken?: Maybe<Scalars['String']['output']>;
  type: Scalars['String']['output'];
};

export type AuthConfigInput = {
  apiKeyHeader?: InputMaybe<Scalars['String']['input']>;
  apiKeyValue?: InputMaybe<Scalars['String']['input']>;
  basicPassword?: InputMaybe<Scalars['String']['input']>;
  basicUsername?: InputMaybe<Scalars['String']['input']>;
  bearerToken?: InputMaybe<Scalars['String']['input']>;
  type: Scalars['String']['input'];
};

export type Canvas = {
  framePositions: Scalars['String']['output'];
  mapId: Scalars['ID']['output'];
  navigationX: Scalars['Float']['output'];
  navigationY: Scalars['Float']['output'];
  orgId: Scalars['ID']['output'];
  updatedAt: Scalars['Time']['output'];
  zoom: Scalars['Float']['output'];
};

export type ChatMessage = {
  chatSessionId: Scalars['ID']['output'];
  content: Scalars['String']['output'];
  createdAt: Scalars['Time']['output'];
  id: Scalars['ID']['output'];
  orgId: Scalars['ID']['output'];
  parts?: Maybe<Scalars['JSON']['output']>;
  role: Scalars['String']['output'];
};

export type ChatSession = {
  createdAt: Scalars['Time']['output'];
  createdBy: Scalars['ID']['output'];
  id: Scalars['ID']['output'];
  isPinned: Scalars['Boolean']['output'];
  messageCount: Scalars['Int']['output'];
  orgId: Scalars['ID']['output'];
  ownerUserId: Scalars['ID']['output'];
  title: Scalars['String']['output'];
  updatedAt: Scalars['Time']['output'];
  updatedBy?: Maybe<Scalars['ID']['output']>;
};

export type ChatSessionWithMessages = {
  messages: Array<ChatMessage>;
  session: ChatSession;
};

export type ClientSavings = {
  clientName: Scalars['String']['output'];
  costSavedUsd: Scalars['Float']['output'];
  tokensSaved: Scalars['Int']['output'];
  totalCalls: Scalars['Int']['output'];
  totalDurationMs: Scalars['Int']['output'];
};

export type Comment = {
  createdAt: Scalars['Time']['output'];
  createdBy: Scalars['ID']['output'];
  createdByActor?: Maybe<Actor>;
  id: Scalars['ID']['output'];
  orgId: Scalars['ID']['output'];
  parentCommentId?: Maybe<Scalars['ID']['output']>;
  resourceId: Scalars['ID']['output'];
  text: Scalars['String']['output'];
  updatedAt: Scalars['Time']['output'];
  updatedBy?: Maybe<Scalars['ID']['output']>;
};

export type Component = {
  category: Scalars['String']['output'];
  componentFields: Array<ComponentField>;
  componentId: Scalars['String']['output'];
  createdAt: Scalars['Time']['output'];
  description: Scalars['String']['output'];
  isActive: Scalars['Boolean']['output'];
  name: Scalars['String']['output'];
  order: Scalars['Int']['output'];
  previewImageJpg: Scalars['String']['output'];
  slug: Scalars['String']['output'];
  tags: Array<Scalars['String']['output']>;
  type: Scalars['String']['output'];
  updatedAt: Scalars['Time']['output'];
};

export type ComponentField = {
  componentFieldId: Scalars['String']['output'];
  label: Scalars['String']['output'];
  options?: Maybe<Array<Scalars['String']['output']>>;
  order: Scalars['Int']['output'];
  readonly?: Maybe<Scalars['Boolean']['output']>;
  required: Scalars['Boolean']['output'];
  type: Scalars['String']['output'];
};

export type ComponentLinkUsage = {
  componentId: Scalars['String']['output'];
  focalPointId: Scalars['ID']['output'];
  focalPointName: Scalars['String']['output'];
  frameId: Scalars['ID']['output'];
  frameName: Scalars['String']['output'];
  locationX: Scalars['Float']['output'];
  locationY: Scalars['Float']['output'];
  mapId: Scalars['ID']['output'];
  mapName: Scalars['String']['output'];
  metaId: Scalars['ID']['output'];
  orgId: Scalars['ID']['output'];
  screenshotAssetId?: Maybe<Scalars['String']['output']>;
  screenshotImageUrl?: Maybe<Scalars['String']['output']>;
};

export type ComponentModalField = {
  componentFieldId?: Maybe<Scalars['String']['output']>;
  data?: Maybe<Array<Maybe<Scalars['JSON']['output']>>>;
  isReadonly?: Maybe<Scalars['Boolean']['output']>;
  label?: Maybe<Scalars['String']['output']>;
  options?: Maybe<Array<Maybe<Scalars['String']['output']>>>;
  order?: Maybe<Scalars['Int']['output']>;
  required?: Maybe<Scalars['Boolean']['output']>;
  type?: Maybe<Scalars['String']['output']>;
};

export type ComponentModalFieldInput = {
  componentFieldId?: InputMaybe<Scalars['String']['input']>;
  data?: InputMaybe<Array<InputMaybe<Scalars['JSON']['input']>>>;
  isReadonly?: InputMaybe<Scalars['Boolean']['input']>;
  label?: InputMaybe<Scalars['String']['input']>;
  options?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  order?: InputMaybe<Scalars['Int']['input']>;
  required?: InputMaybe<Scalars['Boolean']['input']>;
  type?: InputMaybe<Scalars['String']['input']>;
};

export type Components = {
  components: Array<Component>;
  customComponents: Array<Component>;
};

export type CreateApiEndpointInput = {
  description?: InputMaybe<Scalars['String']['input']>;
  exampleRequests?: InputMaybe<Scalars['String']['input']>;
  exampleResponses?: InputMaybe<Scalars['String']['input']>;
  method: Scalars['String']['input'];
  operationId?: InputMaybe<Scalars['String']['input']>;
  order?: InputMaybe<Scalars['Float']['input']>;
  parameters?: InputMaybe<Scalars['String']['input']>;
  path: Scalars['String']['input'];
  requestBody?: InputMaybe<Scalars['String']['input']>;
  responses?: InputMaybe<Scalars['String']['input']>;
  summary?: InputMaybe<Scalars['String']['input']>;
  tags?: InputMaybe<Array<Scalars['String']['input']>>;
};

export type CreateApiGroupInput = {
  label?: InputMaybe<Scalars['String']['input']>;
  name: Scalars['String']['input'];
  protocol?: InputMaybe<Scalars['String']['input']>;
  spec?: InputMaybe<Scalars['String']['input']>;
  specAssetId?: InputMaybe<Scalars['String']['input']>;
  version?: InputMaybe<Scalars['String']['input']>;
};

export type CreateChatMessageInput = {
  content: Scalars['String']['input'];
  role: Scalars['String']['input'];
};

export type CreateChatSessionInput = {
  title?: InputMaybe<Scalars['String']['input']>;
};

export type CreateCommentInput = {
  parentCommentId?: InputMaybe<Scalars['ID']['input']>;
  resourceId: Scalars['ID']['input'];
  text: Scalars['String']['input'];
};

export type CreateDiagramImageInput = {
  assetId: Scalars['String']['input'];
  fileName?: InputMaybe<Scalars['String']['input']>;
  order?: InputMaybe<Scalars['Int']['input']>;
};

export type CreateDiagramInput = {
  content: Scalars['String']['input'];
  folderId?: InputMaybe<Scalars['ID']['input']>;
  name: Scalars['String']['input'];
  source?: InputMaybe<Scalars['String']['input']>;
  teamId?: InputMaybe<Scalars['ID']['input']>;
};

export type CreateDocInput = {
  contentBase64?: InputMaybe<Scalars['String']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  fileAssetId?: InputMaybe<Scalars['String']['input']>;
  fileName: Scalars['String']['input'];
  fileType?: InputMaybe<Scalars['String']['input']>;
  folderId?: InputMaybe<Scalars['ID']['input']>;
  teamId?: InputMaybe<Scalars['ID']['input']>;
};

export type CreateFocalPointInput = {
  isActive?: InputMaybe<Scalars['Boolean']['input']>;
  locationX: Scalars['Float']['input'];
  locationY: Scalars['Float']['input'];
  name: Scalars['String']['input'];
  visibility?: InputMaybe<Scalars['String']['input']>;
};

export type CreateFocalPointMetaInput = {
  componentId: Scalars['String']['input'];
  componentLinkApiEndpointId?: InputMaybe<Scalars['ID']['input']>;
  componentLinkDiagramId?: InputMaybe<Scalars['ID']['input']>;
  componentLinkServiceDocId?: InputMaybe<Scalars['ID']['input']>;
  componentLinkTestPackId?: InputMaybe<Scalars['ID']['input']>;
  componentModalFields?: InputMaybe<Array<ComponentModalFieldInput>>;
};

export type CreateFolderInput = {
  name: Scalars['String']['input'];
  order?: InputMaybe<Scalars['Float']['input']>;
  parentId?: InputMaybe<Scalars['ID']['input']>;
  teamId?: InputMaybe<Scalars['ID']['input']>;
  type: Scalars['String']['input'];
};

export type CreateFrameGroupInput = {
  description?: InputMaybe<Scalars['String']['input']>;
  height?: InputMaybe<Scalars['Float']['input']>;
  isActive?: InputMaybe<Scalars['Boolean']['input']>;
  locationX?: InputMaybe<Scalars['Float']['input']>;
  locationY?: InputMaybe<Scalars['Float']['input']>;
  name: Scalars['String']['input'];
  order?: InputMaybe<Scalars['Float']['input']>;
  width?: InputMaybe<Scalars['Float']['input']>;
};

export type CreateFrameInput = {
  description?: InputMaybe<Scalars['String']['input']>;
  name: Scalars['String']['input'];
  order?: InputMaybe<Scalars['Float']['input']>;
  parentFrameId?: InputMaybe<Scalars['ID']['input']>;
  screenshot?: InputMaybe<Scalars['String']['input']>;
  screenshotAssetId?: InputMaybe<Scalars['String']['input']>;
  templateType: Scalars['String']['input'];
};

export type CreateFrameLinkInput = {
  isActive?: InputMaybe<Scalars['Boolean']['input']>;
  kind: Scalars['String']['input'];
  label?: InputMaybe<Scalars['String']['input']>;
  locationX?: InputMaybe<Scalars['Float']['input']>;
  locationY?: InputMaybe<Scalars['Float']['input']>;
  targetFrameId?: InputMaybe<Scalars['ID']['input']>;
  targetMapId?: InputMaybe<Scalars['ID']['input']>;
};

export type CreateMapInput = {
  description?: InputMaybe<Scalars['String']['input']>;
  folderId?: InputMaybe<Scalars['ID']['input']>;
  name: Scalars['String']['input'];
  teamId?: InputMaybe<Scalars['ID']['input']>;
};

export type CreateMlDeploymentInput = {
  deployedAt?: InputMaybe<Scalars['Time']['input']>;
  endpoint?: InputMaybe<Scalars['String']['input']>;
  environment?: InputMaybe<Scalars['String']['input']>;
  modelId: Scalars['ID']['input'];
  name: Scalars['String']['input'];
  region?: InputMaybe<Scalars['String']['input']>;
  rolledBackAt?: InputMaybe<Scalars['Time']['input']>;
  status?: InputMaybe<Scalars['String']['input']>;
  versionId: Scalars['ID']['input'];
};

export type CreateMlFindingInput = {
  description?: InputMaybe<Scalars['String']['input']>;
  modelId: Scalars['ID']['input'];
  runIds?: InputMaybe<Array<Scalars['ID']['input']>>;
  summary?: InputMaybe<Scalars['String']['input']>;
  title: Scalars['String']['input'];
  versionId?: InputMaybe<Scalars['ID']['input']>;
};

export type CreateMlProjectInput = {
  description?: InputMaybe<Scalars['String']['input']>;
  name: Scalars['String']['input'];
  teamId?: InputMaybe<Scalars['ID']['input']>;
  type: Scalars['String']['input'];
};

export type CreateOrgInput = {
  name: Scalars['String']['input'];
};

export type CreateRoleMappingInput = {
  claimKey: Scalars['String']['input'];
  claimValue: Scalars['String']['input'];
  resourceId?: InputMaybe<Scalars['String']['input']>;
  resourceType?: InputMaybe<Scalars['String']['input']>;
  role: Scalars['String']['input'];
  scope: Scalars['String']['input'];
};

export type CreateSavedQueryFolderInput = {
  name: Scalars['String']['input'];
  scope: SavedQueryScope;
};

export type CreateSavedQueryInput = {
  description?: InputMaybe<Scalars['String']['input']>;
  folderId?: InputMaybe<Scalars['ID']['input']>;
  queryText: Scalars['String']['input'];
  scope: SavedQueryScope;
  tags?: InputMaybe<Array<Scalars['String']['input']>>;
  title: Scalars['String']['input'];
};

export type CreateServerOrgInput = {
  autoJoin?: InputMaybe<Scalars['Boolean']['input']>;
  name: Scalars['String']['input'];
};

export type CreateServiceAccountInput = {
  description?: InputMaybe<Scalars['String']['input']>;
  name: Scalars['String']['input'];
  scopes: Array<Scalars['String']['input']>;
};

export type CreateServiceDbInput = {
  dbName: Scalars['String']['input'];
  dbType?: InputMaybe<Scalars['String']['input']>;
  dialect?: InputMaybe<Scalars['String']['input']>;
  schemaJson?: InputMaybe<Scalars['String']['input']>;
  source?: InputMaybe<Scalars['String']['input']>;
  sourceTs?: InputMaybe<Scalars['Time']['input']>;
};

export type CreateServiceDbVersionInput = {
  dbName?: InputMaybe<Scalars['String']['input']>;
  dbType?: InputMaybe<Scalars['String']['input']>;
  dialect?: InputMaybe<Scalars['String']['input']>;
  isAutoVersion?: InputMaybe<Scalars['Boolean']['input']>;
  label?: InputMaybe<Scalars['String']['input']>;
  schemaJson?: InputMaybe<Scalars['String']['input']>;
  source?: InputMaybe<Scalars['String']['input']>;
  sourceTs?: InputMaybe<Scalars['Time']['input']>;
};

export type CreateServiceDiagramInput = {
  content?: InputMaybe<Scalars['String']['input']>;
  diagramId?: InputMaybe<Scalars['ID']['input']>;
  folderId?: InputMaybe<Scalars['ID']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  source?: InputMaybe<Scalars['String']['input']>;
  teamId?: InputMaybe<Scalars['ID']['input']>;
};

export type CreateServiceDocInput = {
  contentBase64?: InputMaybe<Scalars['String']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  docId?: InputMaybe<Scalars['ID']['input']>;
  fileAssetId?: InputMaybe<Scalars['String']['input']>;
  fileName?: InputMaybe<Scalars['String']['input']>;
  fileType?: InputMaybe<Scalars['String']['input']>;
  folderId?: InputMaybe<Scalars['ID']['input']>;
  teamId?: InputMaybe<Scalars['ID']['input']>;
};

export type CreateServiceInput = {
  category?: InputMaybe<Scalars['String']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  folderId?: InputMaybe<Scalars['ID']['input']>;
  gitRepoUrl?: InputMaybe<Scalars['String']['input']>;
  jiraProjectUrl?: InputMaybe<Scalars['String']['input']>;
  labels?: InputMaybe<Array<Scalars['String']['input']>>;
  language?: InputMaybe<Scalars['String']['input']>;
  metadata?: InputMaybe<Scalars['String']['input']>;
  name: Scalars['String']['input'];
  slackChannelUrl?: InputMaybe<Scalars['String']['input']>;
  status?: InputMaybe<Scalars['String']['input']>;
  teamId?: InputMaybe<Scalars['ID']['input']>;
  tier?: InputMaybe<Scalars['String']['input']>;
};

export type CreateTeamInput = {
  email?: InputMaybe<Scalars['String']['input']>;
  name: Scalars['String']['input'];
};

export type CreateTestCaseInput = {
  api?: InputMaybe<ApiTestCaseInput>;
  baselineRunResultId?: InputMaybe<Scalars['ID']['input']>;
  database?: InputMaybe<DatabaseTestCaseInput>;
  dependencies?: InputMaybe<Array<Scalars['ID']['input']>>;
  description?: InputMaybe<Scalars['String']['input']>;
  estimatedDurationMins?: InputMaybe<Scalars['Int']['input']>;
  evidenceRequired?: InputMaybe<Scalars['Boolean']['input']>;
  graphql?: InputMaybe<GraphQlTestCaseInput>;
  grpc?: InputMaybe<GrpcTestCaseInput>;
  isCritical?: InputMaybe<Scalars['Boolean']['input']>;
  labels?: InputMaybe<Array<Scalars['String']['input']>>;
  linkedMapNodeId?: InputMaybe<Scalars['ID']['input']>;
  linkedTicket?: InputMaybe<Scalars['String']['input']>;
  manual?: InputMaybe<ManualTestCaseInput>;
  order?: InputMaybe<Scalars['Float']['input']>;
  priority?: InputMaybe<Scalars['String']['input']>;
  status?: InputMaybe<Scalars['String']['input']>;
  testOwner?: InputMaybe<Scalars['String']['input']>;
  testPackId: Scalars['ID']['input'];
  title: Scalars['String']['input'];
  type: Scalars['String']['input'];
  version?: InputMaybe<Scalars['Int']['input']>;
};

export type CreateTestPackInput = {
  name: Scalars['String']['input'];
  type?: InputMaybe<Scalars['String']['input']>;
};

export type CreateTestRunInput = {
  completedAt?: InputMaybe<Scalars['Time']['input']>;
  environment: Scalars['String']['input'];
  overallStatus?: InputMaybe<Scalars['String']['input']>;
  releaseLabel?: InputMaybe<Scalars['String']['input']>;
  startedAt?: InputMaybe<Scalars['Time']['input']>;
  startedBy?: InputMaybe<Scalars['ID']['input']>;
  status?: InputMaybe<Scalars['String']['input']>;
  testPackId: Scalars['ID']['input'];
};

export type CreateTestRunResultInput = {
  blockedReason?: InputMaybe<Scalars['String']['input']>;
  notes?: InputMaybe<Scalars['String']['input']>;
  responseBody?: InputMaybe<Scalars['String']['input']>;
  responseStatus?: InputMaybe<Scalars['Int']['input']>;
  responseTimeMs?: InputMaybe<Scalars['Int']['input']>;
  screenshotUrls?: InputMaybe<Array<Scalars['String']['input']>>;
  status: Scalars['String']['input'];
  testCaseId: Scalars['ID']['input'];
  testRunId: Scalars['ID']['input'];
};

export type CreateTokenInput = {
  expiresAt?: InputMaybe<Scalars['String']['input']>;
  name: Scalars['String']['input'];
};

export type CreateUserInput = {
  email: Scalars['String']['input'];
  name: Scalars['String']['input'];
  password: Scalars['String']['input'];
  role?: InputMaybe<Scalars['String']['input']>;
};

export type CreatedToken = {
  createdAt: Scalars['Time']['output'];
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
  prefix: Scalars['String']['output'];
  serviceAccountId: Scalars['ID']['output'];
  token: Scalars['String']['output'];
};

export type CustomComponentFieldInput = {
  componentFieldId?: InputMaybe<Scalars['String']['input']>;
  label: Scalars['String']['input'];
  options?: InputMaybe<Array<Scalars['String']['input']>>;
  order: Scalars['Int']['input'];
  readonly?: InputMaybe<Scalars['Boolean']['input']>;
  required: Scalars['Boolean']['input'];
  type: Scalars['String']['input'];
};

export type CustomComponentInput = {
  category?: InputMaybe<Scalars['String']['input']>;
  componentFields?: InputMaybe<Array<CustomComponentFieldInput>>;
  description?: InputMaybe<Scalars['String']['input']>;
  isActive?: InputMaybe<Scalars['Boolean']['input']>;
  name: Scalars['String']['input'];
};

export type DailySavings = {
  costRawUsd: Scalars['Float']['output'];
  costSavedUsd: Scalars['Float']['output'];
  costServedUsd: Scalars['Float']['output'];
  date: Scalars['Time']['output'];
  estAgentTimeMs: Scalars['Int']['output'];
  timeSavedMs: Scalars['Int']['output'];
  totalCalls: Scalars['Int']['output'];
  totalDurationMs: Scalars['Int']['output'];
  totalTokensSaved: Scalars['Int']['output'];
  totalTokensServed: Scalars['Int']['output'];
};

export type DatabaseTestCase = {
  assertions?: Maybe<Array<Assertion>>;
  dialect: Scalars['String']['output'];
  query: Scalars['String']['output'];
  schemaId?: Maybe<Scalars['String']['output']>;
  setupQuery?: Maybe<Scalars['String']['output']>;
  teardownQuery?: Maybe<Scalars['String']['output']>;
};

export type DatabaseTestCaseInput = {
  assertions?: InputMaybe<Array<AssertionInput>>;
  dialect: Scalars['String']['input'];
  query: Scalars['String']['input'];
  schemaId?: InputMaybe<Scalars['String']['input']>;
  setupQuery?: InputMaybe<Scalars['String']['input']>;
  teardownQuery?: InputMaybe<Scalars['String']['input']>;
};

export type DbColumn = {
  autoIncrement?: Maybe<Scalars['Boolean']['output']>;
  defaultValue?: Maybe<Scalars['String']['output']>;
  description?: Maybe<Scalars['String']['output']>;
  foreignKey?: Maybe<Scalars['String']['output']>;
  isPrimaryKey?: Maybe<Scalars['Boolean']['output']>;
  name?: Maybe<Scalars['String']['output']>;
  nullable?: Maybe<Scalars['Boolean']['output']>;
  type?: Maybe<Scalars['String']['output']>;
  unique?: Maybe<Scalars['Boolean']['output']>;
};

export type DbIndex = {
  fields?: Maybe<Array<Scalars['String']['output']>>;
  name?: Maybe<Scalars['String']['output']>;
  type?: Maybe<Scalars['String']['output']>;
};

export type DbTable = {
  columns?: Maybe<Array<DbColumn>>;
  indexes?: Maybe<Array<DbIndex>>;
  name?: Maybe<Scalars['String']['output']>;
};

export type Dependency = {
  apiEndpointNames?: Maybe<Array<Scalars['String']['output']>>;
  apiGroupName?: Maybe<Scalars['String']['output']>;
  consumerService: DependencyService;
  criticality?: Maybe<Scalars['String']['output']>;
  databaseName?: Maybe<Scalars['String']['output']>;
  description?: Maybe<Scalars['String']['output']>;
  direction?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
  providerName?: Maybe<Scalars['String']['output']>;
  providerService?: Maybe<DependencyService>;
  type?: Maybe<Scalars['String']['output']>;
};

export type DependencyService = {
  category?: Maybe<Scalars['String']['output']>;
  description?: Maybe<Scalars['String']['output']>;
  gitRepoUrl?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  language?: Maybe<Scalars['String']['output']>;
  metadata?: Maybe<Scalars['JSON']['output']>;
  name: Scalars['String']['output'];
  status?: Maybe<Scalars['String']['output']>;
  tier?: Maybe<Scalars['String']['output']>;
  updatedAt?: Maybe<Scalars['String']['output']>;
};

export type Diagram = {
  contentHash: Scalars['String']['output'];
  contentKey: Scalars['String']['output'];
  createdAt: Scalars['Time']['output'];
  createdBy: Scalars['ID']['output'];
  createdByActor?: Maybe<Actor>;
  createdByCommitHash?: Maybe<Scalars['String']['output']>;
  folderId?: Maybe<Scalars['ID']['output']>;
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
  orgId: Scalars['ID']['output'];
  previewAssetId?: Maybe<Scalars['String']['output']>;
  previewContentHash?: Maybe<Scalars['String']['output']>;
  previewImageUrl?: Maybe<Scalars['String']['output']>;
  previewStatus: Scalars['String']['output'];
  source?: Maybe<Scalars['String']['output']>;
  teamId?: Maybe<Scalars['ID']['output']>;
  updatedAt: Scalars['Time']['output'];
  updatedBy?: Maybe<Scalars['ID']['output']>;
  updatedByActor?: Maybe<Actor>;
  updatedByCommitHash?: Maybe<Scalars['String']['output']>;
};

export type DiagramContent = {
  content: Scalars['String']['output'];
  diagramId: Scalars['ID']['output'];
};

export type DiagramImage = {
  assetId: Scalars['String']['output'];
  createdAt: Scalars['Time']['output'];
  createdBy: Scalars['ID']['output'];
  diagramId: Scalars['String']['output'];
  diagramImageId: Scalars['String']['output'];
  fileName?: Maybe<Scalars['String']['output']>;
  imageUrl?: Maybe<Scalars['String']['output']>;
  order: Scalars['Int']['output'];
  orgId: Scalars['ID']['output'];
};

export type DiagramPage = {
  items: Array<Diagram>;
  totalCount: Scalars['Int']['output'];
};

export type DiagramThumbnailUpload = {
  assetId: Scalars['String']['output'];
  uploadUrl: Scalars['String']['output'];
};

export type DiagramVersion = {
  contentHash: Scalars['String']['output'];
  contentKey: Scalars['String']['output'];
  createdAt: Scalars['Time']['output'];
  createdBy: Scalars['ID']['output'];
  createdByActor?: Maybe<Actor>;
  diagramId: Scalars['ID']['output'];
  id: Scalars['ID']['output'];
  isAutoVersion: Scalars['Boolean']['output'];
  label?: Maybe<Scalars['String']['output']>;
  orgId: Scalars['ID']['output'];
  source?: Maybe<Scalars['String']['output']>;
  versionNumber: Scalars['Int']['output'];
};

export type Doc = {
  contentHash: Scalars['String']['output'];
  createdAt: Scalars['Time']['output'];
  createdBy: Scalars['ID']['output'];
  createdByActor?: Maybe<Actor>;
  description: Scalars['String']['output'];
  fileAssetId: Scalars['String']['output'];
  fileName: Scalars['String']['output'];
  fileType: Scalars['String']['output'];
  fileUrl?: Maybe<Scalars['String']['output']>;
  folderId?: Maybe<Scalars['ID']['output']>;
  id: Scalars['ID']['output'];
  orgId: Scalars['ID']['output'];
  teamId?: Maybe<Scalars['ID']['output']>;
  updatedAt: Scalars['Time']['output'];
  updatedBy?: Maybe<Scalars['ID']['output']>;
  updatedByActor?: Maybe<Actor>;
};

export type DocPage = {
  items: Array<Doc>;
  totalCount: Scalars['Int']['output'];
};

export type FileDownload = {
  apiGroupId: Scalars['ID']['output'];
  content: Scalars['String']['output'];
  fileName: Scalars['String']['output'];
};

export type FlowDiagramComponent = {
  category: Scalars['String']['output'];
  componentId: Scalars['String']['output'];
  description: Scalars['String']['output'];
  flowDiagramComponentFields: Array<FlowDiagramComponentField>;
  isActive: Scalars['Boolean']['output'];
  name: Scalars['String']['output'];
  order: Scalars['Int']['output'];
  organizationId?: Maybe<Scalars['String']['output']>;
  previewImageJpg: Scalars['String']['output'];
  slug: Scalars['String']['output'];
  tags: Array<Scalars['String']['output']>;
  type: Scalars['String']['output'];
};

export type FlowDiagramComponentField = {
  flowDiagramComponentFieldId: Scalars['String']['output'];
  label: Scalars['String']['output'];
  options?: Maybe<Array<Scalars['String']['output']>>;
  order: Scalars['Int']['output'];
  readonly?: Maybe<Scalars['Boolean']['output']>;
  required: Scalars['Boolean']['output'];
  type: Scalars['String']['output'];
};

export type FlowDiagramComponents = {
  components: Array<FlowDiagramComponent>;
  customComponents: Array<FlowDiagramComponent>;
};

export type FocalPoint = {
  createdAt: Scalars['Time']['output'];
  createdBy: Scalars['ID']['output'];
  createdByCommitHash?: Maybe<Scalars['String']['output']>;
  frameId: Scalars['ID']['output'];
  id: Scalars['ID']['output'];
  isActive: Scalars['Boolean']['output'];
  locationX: Scalars['Float']['output'];
  locationY: Scalars['Float']['output'];
  name: Scalars['String']['output'];
  orgId: Scalars['ID']['output'];
  updatedAt: Scalars['Time']['output'];
  updatedBy?: Maybe<Scalars['ID']['output']>;
  updatedByCommitHash?: Maybe<Scalars['String']['output']>;
  visibility: Scalars['String']['output'];
};

export type FocalPointMeta = {
  componentId: Scalars['String']['output'];
  componentLinkApiEndpointId?: Maybe<Scalars['ID']['output']>;
  componentLinkDiagramId?: Maybe<Scalars['ID']['output']>;
  componentLinkServiceDocId?: Maybe<Scalars['ID']['output']>;
  componentLinkTestPackId?: Maybe<Scalars['ID']['output']>;
  componentModalFields: Array<ComponentModalField>;
  createdAt: Scalars['Time']['output'];
  createdBy: Scalars['ID']['output'];
  createdByCommitHash?: Maybe<Scalars['String']['output']>;
  focalPointId: Scalars['ID']['output'];
  frameId: Scalars['ID']['output'];
  id: Scalars['ID']['output'];
  orgId: Scalars['ID']['output'];
  updatedAt: Scalars['Time']['output'];
  updatedBy?: Maybe<Scalars['ID']['output']>;
  updatedByCommitHash?: Maybe<Scalars['String']['output']>;
};

export type Folder = {
  createdAt: Scalars['Time']['output'];
  createdBy: Scalars['ID']['output'];
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
  order: Scalars['Float']['output'];
  orgId: Scalars['ID']['output'];
  parentId?: Maybe<Scalars['ID']['output']>;
  teamId?: Maybe<Scalars['ID']['output']>;
  type: Scalars['String']['output'];
  updatedAt: Scalars['Time']['output'];
};

export type Frame = {
  createdAt: Scalars['Time']['output'];
  createdBy: Scalars['ID']['output'];
  createdByActor?: Maybe<Actor>;
  createdByCommitHash?: Maybe<Scalars['String']['output']>;
  description: Scalars['String']['output'];
  focalPointCount: Scalars['Int']['output'];
  id: Scalars['ID']['output'];
  mapId: Scalars['ID']['output'];
  name: Scalars['String']['output'];
  order: Scalars['Float']['output'];
  orgId: Scalars['ID']['output'];
  parentFrameId?: Maybe<Scalars['ID']['output']>;
  screenshotAssetId?: Maybe<Scalars['String']['output']>;
  screenshotContentHash?: Maybe<Scalars['String']['output']>;
  screenshotImageUrl?: Maybe<Scalars['String']['output']>;
  source?: Maybe<Scalars['String']['output']>;
  status: Scalars['String']['output'];
  templateType: Scalars['String']['output'];
  updatedAt: Scalars['Time']['output'];
  updatedBy?: Maybe<Scalars['ID']['output']>;
  updatedByActor?: Maybe<Actor>;
  updatedByCommitHash?: Maybe<Scalars['String']['output']>;
};

export type FrameGroup = {
  createdAt: Scalars['Time']['output'];
  createdBy: Scalars['ID']['output'];
  description: Scalars['String']['output'];
  frameId: Scalars['ID']['output'];
  height: Scalars['Float']['output'];
  id: Scalars['ID']['output'];
  isActive: Scalars['Boolean']['output'];
  locationX: Scalars['Float']['output'];
  locationY: Scalars['Float']['output'];
  name: Scalars['String']['output'];
  order: Scalars['Float']['output'];
  orgId: Scalars['ID']['output'];
  updatedAt: Scalars['Time']['output'];
  updatedBy?: Maybe<Scalars['ID']['output']>;
  width: Scalars['Float']['output'];
};

export type FrameLink = {
  createdAt: Scalars['Time']['output'];
  createdBy: Scalars['ID']['output'];
  frameId: Scalars['ID']['output'];
  id: Scalars['ID']['output'];
  isActive: Scalars['Boolean']['output'];
  kind: Scalars['String']['output'];
  label: Scalars['String']['output'];
  locationX: Scalars['Float']['output'];
  locationY: Scalars['Float']['output'];
  orgId: Scalars['ID']['output'];
  targetFrameId?: Maybe<Scalars['ID']['output']>;
  targetMapId?: Maybe<Scalars['ID']['output']>;
  updatedAt: Scalars['Time']['output'];
  updatedBy?: Maybe<Scalars['ID']['output']>;
};

export type FramePage = {
  items: Array<Frame>;
  totalCount: Scalars['Int']['output'];
};

export type GrpcTestCase = {
  assertions?: Maybe<Array<Assertion>>;
  callMode: Scalars['String']['output'];
  deadlineMs?: Maybe<Scalars['Int']['output']>;
  expectError: Scalars['Boolean']['output'];
  expectedStatus: Scalars['String']['output'];
  metadata?: Maybe<Array<KeyValue>>;
  methodName: Scalars['String']['output'];
  protoFileId?: Maybe<Scalars['String']['output']>;
  requestMessage?: Maybe<Scalars['String']['output']>;
  responseBody?: Maybe<Scalars['String']['output']>;
  serverAddress?: Maybe<Scalars['String']['output']>;
  serviceName: Scalars['String']['output'];
  useTLS: Scalars['Boolean']['output'];
};

export type GrpcTestCaseInput = {
  assertions?: InputMaybe<Array<AssertionInput>>;
  callMode: Scalars['String']['input'];
  deadlineMs?: InputMaybe<Scalars['Int']['input']>;
  expectError: Scalars['Boolean']['input'];
  expectedStatus: Scalars['String']['input'];
  metadata?: InputMaybe<Array<KeyValueInput>>;
  methodName: Scalars['String']['input'];
  protoFileId?: InputMaybe<Scalars['String']['input']>;
  requestMessage?: InputMaybe<Scalars['String']['input']>;
  responseBody?: InputMaybe<Scalars['String']['input']>;
  serverAddress?: InputMaybe<Scalars['String']['input']>;
  serviceName: Scalars['String']['input'];
  useTLS: Scalars['Boolean']['input'];
};

export type GraphQlTestCase = {
  assertions?: Maybe<Array<Assertion>>;
  expectError: Scalars['Boolean']['output'];
  operationName?: Maybe<Scalars['String']['output']>;
  operationType: Scalars['String']['output'];
  query: Scalars['String']['output'];
  responseBody?: Maybe<Scalars['String']['output']>;
  variables?: Maybe<Scalars['String']['output']>;
};

export type GraphQlTestCaseInput = {
  assertions?: InputMaybe<Array<AssertionInput>>;
  expectError: Scalars['Boolean']['input'];
  operationName?: InputMaybe<Scalars['String']['input']>;
  operationType: Scalars['String']['input'];
  query: Scalars['String']['input'];
  responseBody?: InputMaybe<Scalars['String']['input']>;
  variables?: InputMaybe<Scalars['String']['input']>;
};

export type KeyValue = {
  key: Scalars['String']['output'];
  value: Scalars['String']['output'];
};

export type KeyValueInput = {
  key: Scalars['String']['input'];
  value: Scalars['String']['input'];
};

export type LdapConfig = {
  allowSignUp: Scalars['Boolean']['output'];
  bindDn: Scalars['String']['output'];
  bindPassword: Scalars['String']['output'];
  createdAt: Scalars['Time']['output'];
  emailAttribute: Scalars['String']['output'];
  host: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  memberOfAttribute: Scalars['String']['output'];
  nameAttribute: Scalars['String']['output'];
  port: Scalars['Int']['output'];
  searchBaseDn: Scalars['String']['output'];
  searchFilter: Scalars['String']['output'];
  skipTlsVerify: Scalars['Boolean']['output'];
  startTls: Scalars['Boolean']['output'];
  updatedAt: Scalars['Time']['output'];
  useSsl: Scalars['Boolean']['output'];
  usernameAttribute: Scalars['String']['output'];
};

export type ManualTestCase = {
  expectedOutcome?: Maybe<Scalars['String']['output']>;
  postconditions?: Maybe<Scalars['String']['output']>;
  preconditions?: Maybe<Scalars['String']['output']>;
  steps?: Maybe<Array<TestCaseStep>>;
  testData?: Maybe<Scalars['String']['output']>;
};

export type ManualTestCaseInput = {
  expectedOutcome?: InputMaybe<Scalars['String']['input']>;
  postconditions?: InputMaybe<Scalars['String']['input']>;
  preconditions?: InputMaybe<Scalars['String']['input']>;
  steps?: InputMaybe<Array<TestCaseStepInput>>;
  testData?: InputMaybe<Scalars['String']['input']>;
};

export type Me = {
  authProvider: Scalars['String']['output'];
  avatarUrl?: Maybe<Scalars['String']['output']>;
  email: Scalars['String']['output'];
  isServerAdmin: Scalars['Boolean']['output'];
  kind: Scalars['String']['output'];
  login: Scalars['String']['output'];
  name: Scalars['String']['output'];
  orgId: Scalars['ID']['output'];
  userId: Scalars['ID']['output'];
};

export type Member = {
  avatarUrl?: Maybe<Scalars['String']['output']>;
  createdAt: Scalars['Time']['output'];
  email: Scalars['String']['output'];
  name: Scalars['String']['output'];
  orgId: Scalars['ID']['output'];
  role: Scalars['String']['output'];
  source: Scalars['String']['output'];
  teamId?: Maybe<Scalars['ID']['output']>;
  updatedAt: Scalars['Time']['output'];
  userId: Scalars['ID']['output'];
};

export type MlArtifact = {
  format: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
  runId: Scalars['ID']['output'];
  size: Scalars['String']['output'];
  syncedAt?: Maybe<Scalars['Time']['output']>;
  type: Scalars['String']['output'];
  updatedAt?: Maybe<Scalars['Time']['output']>;
  uri: Scalars['String']['output'];
};

export type MlDataset = {
  context: Scalars['String']['output'];
  digest: Scalars['String']['output'];
  experimentId: Scalars['ID']['output'];
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
  rowCount: Scalars['Int']['output'];
  schema: Array<MlSchemaField>;
  source: Scalars['String']['output'];
  sourceType: Scalars['String']['output'];
  tags: Scalars['JSON']['output'];
};

export type MlDeployment = {
  deployedAt?: Maybe<Scalars['Time']['output']>;
  endpoint: Scalars['String']['output'];
  environment: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  modelId: Scalars['ID']['output'];
  name: Scalars['String']['output'];
  region: Scalars['String']['output'];
  rolledBackAt?: Maybe<Scalars['Time']['output']>;
  status: Scalars['String']['output'];
  versionId: Scalars['ID']['output'];
};

export type MlExperiment = {
  description: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
  projectId?: Maybe<Scalars['ID']['output']>;
  startedAt?: Maybe<Scalars['Time']['output']>;
  status: Scalars['String']['output'];
};

export type MlFinding = {
  description: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  modelId: Scalars['ID']['output'];
  runIds: Array<Scalars['ID']['output']>;
  summary: Scalars['String']['output'];
  title: Scalars['String']['output'];
  versionId?: Maybe<Scalars['ID']['output']>;
};

export type MlModel = {
  caveats: Scalars['String']['output'];
  createdAt?: Maybe<Scalars['Time']['output']>;
  description: Scalars['String']['output'];
  domain: Scalars['String']['output'];
  ethicalConsiderations: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  intendedUse: Scalars['String']['output'];
  license: Scalars['String']['output'];
  limitations: Scalars['String']['output'];
  name: Scalars['String']['output'];
  owners: Scalars['String']['output'];
  problemType: Scalars['String']['output'];
  productionVersionId?: Maybe<Scalars['ID']['output']>;
  projectId?: Maybe<Scalars['ID']['output']>;
  references: Array<Scalars['String']['output']>;
  tags: Array<Scalars['String']['output']>;
  updatedAt?: Maybe<Scalars['Time']['output']>;
};

export type MlModelVersion = {
  createdAt?: Maybe<Scalars['Time']['output']>;
  deploymentStatus: Scalars['String']['output'];
  description: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  modelId: Scalars['ID']['output'];
  runId?: Maybe<Scalars['ID']['output']>;
  version: Scalars['String']['output'];
};

export type MlProject = {
  description: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
  sourceType: Scalars['String']['output'];
  sourceUrl: Scalars['String']['output'];
  stats?: Maybe<MlProjectStats>;
  teamId?: Maybe<Scalars['ID']['output']>;
  type: Scalars['String']['output'];
};

export type MlProjectStats = {
  experimentCount: Scalars['Int']['output'];
  modelCount: Scalars['Int']['output'];
  runCount: Scalars['Int']['output'];
};

export type MlRun = {
  datasetId?: Maybe<Scalars['ID']['output']>;
  duration: Scalars['String']['output'];
  endedAt?: Maybe<Scalars['Time']['output']>;
  experimentId: Scalars['ID']['output'];
  id: Scalars['ID']['output'];
  metrics: Scalars['JSON']['output'];
  name: Scalars['String']['output'];
  notes: Scalars['String']['output'];
  orgId: Scalars['ID']['output'];
  parameters: Scalars['JSON']['output'];
  series: Scalars['JSON']['output'];
  startedAt?: Maybe<Scalars['Time']['output']>;
  status: Scalars['String']['output'];
  syncedAt?: Maybe<Scalars['Time']['output']>;
  updatedAt?: Maybe<Scalars['Time']['output']>;
};

export type MlSchemaField = {
  description: Scalars['String']['output'];
  name: Scalars['String']['output'];
  type: Scalars['String']['output'];
};

export type MlVersionDeploymentUpdate = {
  changedAt?: Maybe<Scalars['Time']['output']>;
  changedBy: Scalars['ID']['output'];
  fromStatus?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  toStatus: Scalars['String']['output'];
  versionId: Scalars['ID']['output'];
};

export type ModelSavings = {
  costRawUsd: Scalars['Float']['output'];
  costSavedUsd: Scalars['Float']['output'];
  displayName: Scalars['String']['output'];
  modelId: Scalars['String']['output'];
  provider: Scalars['String']['output'];
  tokensSaved: Scalars['Int']['output'];
  totalCalls: Scalars['Int']['output'];
};

export type Mutation = {
  addMember: Member;
  addTeamMember: Scalars['Boolean']['output'];
  completeOnboarding: Scalars['Boolean']['output'];
  confirmDiagramThumbnailUpload: Scalars['Boolean']['output'];
  createAPIEndpoint: ApiEndpoint;
  createAPIGroup: ApiGroup;
  createAssetUpload: AssetUpload;
  createChatMessage: ChatMessage;
  createChatSession: ChatSession;
  createComment: Comment;
  createCustomComponent: Component;
  createDiagram: Diagram;
  createDiagramImage: DiagramImage;
  createDiagramVersion: DiagramVersion;
  createDoc: Doc;
  createFocalPoint: FocalPoint;
  createFocalPointMeta: FocalPointMeta;
  createFolder: Folder;
  createFrame: Frame;
  createFrameGroup: FrameGroup;
  createFrameLink: FrameLink;
  createMap: UiMap;
  createMlDeployment: MlDeployment;
  createMlFinding: MlFinding;
  createMlProject: MlProject;
  createMlVersionDeploymentUpdate: MlVersionDeploymentUpdate;
  createOrg: Org;
  createRoleMapping: Scalars['Boolean']['output'];
  createSavedQuery: SavedQuery;
  createSavedQueryFolder: SavedQueryFolder;
  createServerOrg: Org;
  createService: Service;
  createServiceAccount: ServiceAccount;
  createServiceAccountToken: CreatedToken;
  createServiceDB: ServiceDb;
  createServiceDBVersion: ServiceDbVersion;
  createServiceDiagram: ServiceDiagram;
  createServiceDoc: ServiceDoc;
  createTeam: Team;
  createTestCase: TestCase;
  createTestPack: TestPack;
  createTestRun: TestRun;
  createTestRunResult: TestRunResult;
  createUser: User;
  deleteAPIEndpoint: Scalars['Boolean']['output'];
  deleteAPIGroup: Scalars['Boolean']['output'];
  deleteChatSession: Scalars['Boolean']['output'];
  deleteComment: Scalars['Boolean']['output'];
  deleteCustomComponent: Scalars['Boolean']['output'];
  deleteDiagram: Scalars['Boolean']['output'];
  deleteDoc: Scalars['Boolean']['output'];
  deleteFocalPoint: Scalars['Boolean']['output'];
  deleteFocalPointMeta: Scalars['Boolean']['output'];
  deleteFolder: Scalars['Boolean']['output'];
  deleteFrame: Scalars['Boolean']['output'];
  deleteFrameGroup: Scalars['Boolean']['output'];
  deleteFrameLink: Scalars['Boolean']['output'];
  deleteLDAP: Scalars['Boolean']['output'];
  deleteMap: Scalars['Boolean']['output'];
  deleteMlDeployment: Scalars['Boolean']['output'];
  deleteMlFinding: Scalars['Boolean']['output'];
  deleteOAuthProvider: Scalars['Boolean']['output'];
  deleteOrg: Scalars['Boolean']['output'];
  deleteRoleMapping: Scalars['Boolean']['output'];
  deleteSavedQuery: Scalars['Boolean']['output'];
  deleteSavedQueryFolder: Scalars['Boolean']['output'];
  deleteServerOrg: Scalars['Boolean']['output'];
  deleteService: Scalars['Boolean']['output'];
  deleteServiceAccount: Scalars['Boolean']['output'];
  deleteServiceDB: Scalars['Boolean']['output'];
  deleteServiceDiagram: Scalars['Boolean']['output'];
  deleteServiceDoc: Scalars['Boolean']['output'];
  deleteTeam: Scalars['Boolean']['output'];
  deleteTestCase: Scalars['Boolean']['output'];
  deleteTestPack: Scalars['Boolean']['output'];
  disableUser: Scalars['Boolean']['output'];
  prepareDiagramThumbnailUpload: DiagramThumbnailUpload;
  prepareOAuthProviderIconUpload: AssetUpload;
  prepareServerOrgLogoUpload: AssetUpload;
  prepareServiceAccountAvatarUpload: AssetUpload;
  prepareUserAvatarUpload: AssetUpload;
  removeMember: Scalars['Boolean']['output'];
  removeOAuthProviderIcon: Scalars['Boolean']['output'];
  removeServerOrgLogo: Scalars['Boolean']['output'];
  removeTeamMember: Scalars['Boolean']['output'];
  restoreAPIGroupVersion: ApiGroup;
  restoreDiagramVersion: Diagram;
  restoreServiceDBVersion: ServiceDb;
  revokeServiceAccountToken: Scalars['Boolean']['output'];
  setMyAvatar: Scalars['Boolean']['output'];
  setOAuthProviderIcon: Scalars['Boolean']['output'];
  setServerOrgLogo: Scalars['Boolean']['output'];
  setServiceAccountAvatar: Scalars['Boolean']['output'];
  switchOrg: Scalars['Boolean']['output'];
  syncAPIGroup: SyncApiGroupResult;
  syncDiagram: SyncDiagramResult;
  syncFrame: SyncFrameResult;
  updateAPIEndpoint: ApiEndpoint;
  updateAPIGroup: ApiGroup;
  updateChatSession: ChatSession;
  updateComment: Comment;
  updateCustomComponent: Component;
  updateDiagram: Diagram;
  updateDoc: Doc;
  updateFocalPoint: FocalPoint;
  updateFocalPointMeta: FocalPointMeta;
  updateFolder: Folder;
  updateFrame: Frame;
  updateFrameGroup: FrameGroup;
  updateFrameLink: FrameLink;
  updateMap: UiMap;
  updateMember: Member;
  updateMlDeployment: MlDeployment;
  updateMlFinding: MlFinding;
  updateMlModel: MlModel;
  updateOrg: Org;
  updateSavedQuery: SavedQuery;
  updateServerOrg: Org;
  updateService: Service;
  updateServiceAccount: ServiceAccount;
  updateServiceDB: ServiceDb;
  updateServiceDependencies: Array<Dependency>;
  updateTeam: Team;
  updateTestCase: TestCase;
  updateTestPack: TestPack;
  updateTestRun: TestRun;
  updateTestRunResult: TestRunResult;
  updateUser: User;
  upsertCanvas: Canvas;
  upsertLDAP: Scalars['Boolean']['output'];
  upsertOAuthProvider: Scalars['Boolean']['output'];
  upsertSAML: Scalars['Boolean']['output'];
};


export type MutationAddMemberArgs = {
  input: AddMemberInput;
  orgId: Scalars['ID']['input'];
};


export type MutationAddTeamMemberArgs = {
  orgId: Scalars['ID']['input'];
  permission?: InputMaybe<Scalars['String']['input']>;
  teamId: Scalars['ID']['input'];
  userId: Scalars['ID']['input'];
};


export type MutationCompleteOnboardingArgs = {
  orgId: Scalars['ID']['input'];
};


export type MutationConfirmDiagramThumbnailUploadArgs = {
  contentHash: Scalars['String']['input'];
  diagramId: Scalars['ID']['input'];
  orgId: Scalars['ID']['input'];
};


export type MutationCreateApiEndpointArgs = {
  apiGroupId: Scalars['ID']['input'];
  input: CreateApiEndpointInput;
  orgId: Scalars['ID']['input'];
  serviceId: Scalars['ID']['input'];
};


export type MutationCreateApiGroupArgs = {
  input: CreateApiGroupInput;
  orgId: Scalars['ID']['input'];
  serviceId: Scalars['ID']['input'];
};


export type MutationCreateAssetUploadArgs = {
  orgId: Scalars['ID']['input'];
};


export type MutationCreateChatMessageArgs = {
  input: CreateChatMessageInput;
  orgId: Scalars['ID']['input'];
  sessionId: Scalars['ID']['input'];
};


export type MutationCreateChatSessionArgs = {
  input: CreateChatSessionInput;
  orgId: Scalars['ID']['input'];
};


export type MutationCreateCommentArgs = {
  input: CreateCommentInput;
  orgId: Scalars['ID']['input'];
};


export type MutationCreateCustomComponentArgs = {
  input: CustomComponentInput;
  orgId: Scalars['ID']['input'];
};


export type MutationCreateDiagramArgs = {
  input: CreateDiagramInput;
  orgId: Scalars['ID']['input'];
};


export type MutationCreateDiagramImageArgs = {
  diagramId: Scalars['ID']['input'];
  input: CreateDiagramImageInput;
  orgId: Scalars['ID']['input'];
};


export type MutationCreateDiagramVersionArgs = {
  diagramId: Scalars['ID']['input'];
  label?: InputMaybe<Scalars['String']['input']>;
  orgId: Scalars['ID']['input'];
};


export type MutationCreateDocArgs = {
  input: CreateDocInput;
  orgId: Scalars['ID']['input'];
};


export type MutationCreateFocalPointArgs = {
  frameId: Scalars['ID']['input'];
  input: CreateFocalPointInput;
  mapId: Scalars['ID']['input'];
  orgId: Scalars['ID']['input'];
};


export type MutationCreateFocalPointMetaArgs = {
  focalPointId: Scalars['ID']['input'];
  frameId: Scalars['ID']['input'];
  input: CreateFocalPointMetaInput;
  mapId: Scalars['ID']['input'];
  orgId: Scalars['ID']['input'];
};


export type MutationCreateFolderArgs = {
  input: CreateFolderInput;
  orgId: Scalars['ID']['input'];
};


export type MutationCreateFrameArgs = {
  input: CreateFrameInput;
  mapId: Scalars['ID']['input'];
  orgId: Scalars['ID']['input'];
};


export type MutationCreateFrameGroupArgs = {
  frameId: Scalars['ID']['input'];
  input: CreateFrameGroupInput;
  mapId: Scalars['ID']['input'];
  orgId: Scalars['ID']['input'];
};


export type MutationCreateFrameLinkArgs = {
  frameId: Scalars['ID']['input'];
  input: CreateFrameLinkInput;
  mapId: Scalars['ID']['input'];
  orgId: Scalars['ID']['input'];
};


export type MutationCreateMapArgs = {
  input: CreateMapInput;
  orgId: Scalars['ID']['input'];
};


export type MutationCreateMlDeploymentArgs = {
  input: CreateMlDeploymentInput;
  orgId: Scalars['ID']['input'];
};


export type MutationCreateMlFindingArgs = {
  input: CreateMlFindingInput;
  orgId: Scalars['ID']['input'];
};


export type MutationCreateMlProjectArgs = {
  input: CreateMlProjectInput;
  orgId: Scalars['ID']['input'];
};


export type MutationCreateMlVersionDeploymentUpdateArgs = {
  orgId: Scalars['ID']['input'];
  toStatus: Scalars['String']['input'];
  versionId: Scalars['ID']['input'];
};


export type MutationCreateOrgArgs = {
  input: CreateOrgInput;
};


export type MutationCreateRoleMappingArgs = {
  input: CreateRoleMappingInput;
};


export type MutationCreateSavedQueryArgs = {
  input: CreateSavedQueryInput;
  orgId: Scalars['ID']['input'];
  serviceDbId: Scalars['ID']['input'];
  serviceId: Scalars['ID']['input'];
};


export type MutationCreateSavedQueryFolderArgs = {
  input: CreateSavedQueryFolderInput;
  orgId: Scalars['ID']['input'];
  serviceDbId: Scalars['ID']['input'];
  serviceId: Scalars['ID']['input'];
};


export type MutationCreateServerOrgArgs = {
  input: CreateServerOrgInput;
};


export type MutationCreateServiceArgs = {
  input: CreateServiceInput;
  orgId: Scalars['ID']['input'];
};


export type MutationCreateServiceAccountArgs = {
  input: CreateServiceAccountInput;
  orgId: Scalars['ID']['input'];
};


export type MutationCreateServiceAccountTokenArgs = {
  input: CreateTokenInput;
  orgId: Scalars['ID']['input'];
  saId: Scalars['ID']['input'];
};


export type MutationCreateServiceDbArgs = {
  input: CreateServiceDbInput;
  orgId: Scalars['ID']['input'];
  serviceId: Scalars['ID']['input'];
};


export type MutationCreateServiceDbVersionArgs = {
  input: CreateServiceDbVersionInput;
  orgId: Scalars['ID']['input'];
  serviceDbId: Scalars['ID']['input'];
  serviceId: Scalars['ID']['input'];
};


export type MutationCreateServiceDiagramArgs = {
  input: CreateServiceDiagramInput;
  orgId: Scalars['ID']['input'];
  serviceId: Scalars['ID']['input'];
};


export type MutationCreateServiceDocArgs = {
  input: CreateServiceDocInput;
  orgId: Scalars['ID']['input'];
  serviceId: Scalars['ID']['input'];
};


export type MutationCreateTeamArgs = {
  input: CreateTeamInput;
  orgId: Scalars['ID']['input'];
};


export type MutationCreateTestCaseArgs = {
  input: CreateTestCaseInput;
  orgId: Scalars['ID']['input'];
  serviceId: Scalars['ID']['input'];
};


export type MutationCreateTestPackArgs = {
  input: CreateTestPackInput;
  orgId: Scalars['ID']['input'];
  serviceId: Scalars['ID']['input'];
};


export type MutationCreateTestRunArgs = {
  input: CreateTestRunInput;
  orgId: Scalars['ID']['input'];
  serviceId: Scalars['ID']['input'];
};


export type MutationCreateTestRunResultArgs = {
  input: CreateTestRunResultInput;
  orgId: Scalars['ID']['input'];
  serviceId: Scalars['ID']['input'];
};


export type MutationCreateUserArgs = {
  input: CreateUserInput;
};


export type MutationDeleteApiEndpointArgs = {
  apiGroupId: Scalars['ID']['input'];
  id: Scalars['ID']['input'];
  orgId: Scalars['ID']['input'];
  serviceId: Scalars['ID']['input'];
};


export type MutationDeleteApiGroupArgs = {
  id: Scalars['ID']['input'];
  orgId: Scalars['ID']['input'];
  serviceId: Scalars['ID']['input'];
};


export type MutationDeleteChatSessionArgs = {
  id: Scalars['ID']['input'];
  orgId: Scalars['ID']['input'];
};


export type MutationDeleteCommentArgs = {
  id: Scalars['ID']['input'];
  orgId: Scalars['ID']['input'];
};


export type MutationDeleteCustomComponentArgs = {
  id: Scalars['ID']['input'];
  orgId: Scalars['ID']['input'];
};


export type MutationDeleteDiagramArgs = {
  id: Scalars['ID']['input'];
  orgId: Scalars['ID']['input'];
};


export type MutationDeleteDocArgs = {
  id: Scalars['ID']['input'];
  orgId: Scalars['ID']['input'];
};


export type MutationDeleteFocalPointArgs = {
  frameId: Scalars['ID']['input'];
  id: Scalars['ID']['input'];
  mapId: Scalars['ID']['input'];
  orgId: Scalars['ID']['input'];
};


export type MutationDeleteFocalPointMetaArgs = {
  focalPointId: Scalars['ID']['input'];
  frameId: Scalars['ID']['input'];
  id: Scalars['ID']['input'];
  mapId: Scalars['ID']['input'];
  orgId: Scalars['ID']['input'];
};


export type MutationDeleteFolderArgs = {
  id: Scalars['ID']['input'];
  orgId: Scalars['ID']['input'];
};


export type MutationDeleteFrameArgs = {
  id: Scalars['ID']['input'];
  mapId: Scalars['ID']['input'];
  orgId: Scalars['ID']['input'];
};


export type MutationDeleteFrameGroupArgs = {
  frameId: Scalars['ID']['input'];
  id: Scalars['ID']['input'];
  mapId: Scalars['ID']['input'];
  orgId: Scalars['ID']['input'];
};


export type MutationDeleteFrameLinkArgs = {
  frameId: Scalars['ID']['input'];
  id: Scalars['ID']['input'];
  mapId: Scalars['ID']['input'];
  orgId: Scalars['ID']['input'];
};


export type MutationDeleteMapArgs = {
  id: Scalars['ID']['input'];
  orgId: Scalars['ID']['input'];
};


export type MutationDeleteMlDeploymentArgs = {
  id: Scalars['ID']['input'];
  orgId: Scalars['ID']['input'];
};


export type MutationDeleteMlFindingArgs = {
  id: Scalars['ID']['input'];
  orgId: Scalars['ID']['input'];
};


export type MutationDeleteOAuthProviderArgs = {
  provider: Scalars['String']['input'];
};


export type MutationDeleteOrgArgs = {
  id: Scalars['ID']['input'];
};


export type MutationDeleteRoleMappingArgs = {
  id: Scalars['ID']['input'];
};


export type MutationDeleteSavedQueryArgs = {
  id: Scalars['ID']['input'];
  orgId: Scalars['ID']['input'];
  serviceDbId: Scalars['ID']['input'];
  serviceId: Scalars['ID']['input'];
};


export type MutationDeleteSavedQueryFolderArgs = {
  id: Scalars['ID']['input'];
  orgId: Scalars['ID']['input'];
  serviceDbId: Scalars['ID']['input'];
  serviceId: Scalars['ID']['input'];
};


export type MutationDeleteServerOrgArgs = {
  id: Scalars['ID']['input'];
};


export type MutationDeleteServiceArgs = {
  id: Scalars['ID']['input'];
  orgId: Scalars['ID']['input'];
};


export type MutationDeleteServiceAccountArgs = {
  id: Scalars['ID']['input'];
  orgId: Scalars['ID']['input'];
};


export type MutationDeleteServiceDbArgs = {
  id: Scalars['ID']['input'];
  orgId: Scalars['ID']['input'];
  serviceId: Scalars['ID']['input'];
};


export type MutationDeleteServiceDiagramArgs = {
  diagramId: Scalars['ID']['input'];
  orgId: Scalars['ID']['input'];
  serviceId: Scalars['ID']['input'];
};


export type MutationDeleteServiceDocArgs = {
  docId: Scalars['ID']['input'];
  orgId: Scalars['ID']['input'];
  serviceId: Scalars['ID']['input'];
};


export type MutationDeleteTeamArgs = {
  orgId: Scalars['ID']['input'];
  teamId: Scalars['ID']['input'];
};


export type MutationDeleteTestCaseArgs = {
  id: Scalars['ID']['input'];
  orgId: Scalars['ID']['input'];
  serviceId: Scalars['ID']['input'];
};


export type MutationDeleteTestPackArgs = {
  id: Scalars['ID']['input'];
  orgId: Scalars['ID']['input'];
  serviceId: Scalars['ID']['input'];
};


export type MutationDisableUserArgs = {
  id: Scalars['ID']['input'];
};


export type MutationPrepareDiagramThumbnailUploadArgs = {
  diagramId: Scalars['ID']['input'];
  orgId: Scalars['ID']['input'];
};


export type MutationPrepareOAuthProviderIconUploadArgs = {
  provider: Scalars['String']['input'];
};


export type MutationPrepareServerOrgLogoUploadArgs = {
  orgId: Scalars['ID']['input'];
};


export type MutationPrepareServiceAccountAvatarUploadArgs = {
  orgId: Scalars['ID']['input'];
  saId: Scalars['ID']['input'];
};


export type MutationRemoveMemberArgs = {
  orgId: Scalars['ID']['input'];
  userId: Scalars['ID']['input'];
};


export type MutationRemoveOAuthProviderIconArgs = {
  provider: Scalars['String']['input'];
};


export type MutationRemoveServerOrgLogoArgs = {
  orgId: Scalars['ID']['input'];
};


export type MutationRemoveTeamMemberArgs = {
  orgId: Scalars['ID']['input'];
  teamId: Scalars['ID']['input'];
  userId: Scalars['ID']['input'];
};


export type MutationRestoreApiGroupVersionArgs = {
  apiGroupId: Scalars['ID']['input'];
  orgId: Scalars['ID']['input'];
  serviceId: Scalars['ID']['input'];
  versionId: Scalars['ID']['input'];
};


export type MutationRestoreDiagramVersionArgs = {
  diagramId: Scalars['ID']['input'];
  orgId: Scalars['ID']['input'];
  versionId: Scalars['ID']['input'];
};


export type MutationRestoreServiceDbVersionArgs = {
  orgId: Scalars['ID']['input'];
  serviceDbId: Scalars['ID']['input'];
  serviceId: Scalars['ID']['input'];
  versionId: Scalars['ID']['input'];
};


export type MutationRevokeServiceAccountTokenArgs = {
  orgId: Scalars['ID']['input'];
  saId: Scalars['ID']['input'];
  tokenId: Scalars['ID']['input'];
};


export type MutationSetOAuthProviderIconArgs = {
  provider: Scalars['String']['input'];
};


export type MutationSetServerOrgLogoArgs = {
  orgId: Scalars['ID']['input'];
};


export type MutationSetServiceAccountAvatarArgs = {
  orgId: Scalars['ID']['input'];
  saId: Scalars['ID']['input'];
};


export type MutationSwitchOrgArgs = {
  orgId: Scalars['ID']['input'];
};


export type MutationSyncApiGroupArgs = {
  input: SyncApiGroupInput;
  orgId: Scalars['ID']['input'];
  serviceId: Scalars['ID']['input'];
};


export type MutationSyncDiagramArgs = {
  input: SyncDiagramInput;
  orgId: Scalars['ID']['input'];
};


export type MutationSyncFrameArgs = {
  input: SyncFrameInput;
  mapId: Scalars['ID']['input'];
  orgId: Scalars['ID']['input'];
};


export type MutationUpdateApiEndpointArgs = {
  apiGroupId: Scalars['ID']['input'];
  id: Scalars['ID']['input'];
  input: UpdateApiEndpointInput;
  orgId: Scalars['ID']['input'];
  serviceId: Scalars['ID']['input'];
};


export type MutationUpdateApiGroupArgs = {
  id: Scalars['ID']['input'];
  input: UpdateApiGroupInput;
  orgId: Scalars['ID']['input'];
  serviceId: Scalars['ID']['input'];
};


export type MutationUpdateChatSessionArgs = {
  id: Scalars['ID']['input'];
  input: UpdateChatSessionInput;
  orgId: Scalars['ID']['input'];
};


export type MutationUpdateCommentArgs = {
  id: Scalars['ID']['input'];
  input: UpdateCommentInput;
  orgId: Scalars['ID']['input'];
};


export type MutationUpdateCustomComponentArgs = {
  id: Scalars['ID']['input'];
  input: CustomComponentInput;
  orgId: Scalars['ID']['input'];
};


export type MutationUpdateDiagramArgs = {
  id: Scalars['ID']['input'];
  input: UpdateDiagramInput;
  orgId: Scalars['ID']['input'];
};


export type MutationUpdateDocArgs = {
  id: Scalars['ID']['input'];
  input: UpdateDocInput;
  orgId: Scalars['ID']['input'];
};


export type MutationUpdateFocalPointArgs = {
  frameId: Scalars['ID']['input'];
  id: Scalars['ID']['input'];
  input: UpdateFocalPointInput;
  mapId: Scalars['ID']['input'];
  orgId: Scalars['ID']['input'];
};


export type MutationUpdateFocalPointMetaArgs = {
  focalPointId: Scalars['ID']['input'];
  frameId: Scalars['ID']['input'];
  id: Scalars['ID']['input'];
  input: UpdateFocalPointMetaInput;
  mapId: Scalars['ID']['input'];
  orgId: Scalars['ID']['input'];
};


export type MutationUpdateFolderArgs = {
  id: Scalars['ID']['input'];
  input: UpdateFolderInput;
  orgId: Scalars['ID']['input'];
};


export type MutationUpdateFrameArgs = {
  id: Scalars['ID']['input'];
  input: UpdateFrameInput;
  mapId: Scalars['ID']['input'];
  orgId: Scalars['ID']['input'];
};


export type MutationUpdateFrameGroupArgs = {
  frameId: Scalars['ID']['input'];
  id: Scalars['ID']['input'];
  input: UpdateFrameGroupInput;
  mapId: Scalars['ID']['input'];
  orgId: Scalars['ID']['input'];
};


export type MutationUpdateFrameLinkArgs = {
  frameId: Scalars['ID']['input'];
  id: Scalars['ID']['input'];
  input: UpdateFrameLinkInput;
  mapId: Scalars['ID']['input'];
  orgId: Scalars['ID']['input'];
};


export type MutationUpdateMapArgs = {
  id: Scalars['ID']['input'];
  input: UpdateMapInput;
  orgId: Scalars['ID']['input'];
};


export type MutationUpdateMemberArgs = {
  input: UpdateMemberInput;
  orgId: Scalars['ID']['input'];
  userId: Scalars['ID']['input'];
};


export type MutationUpdateMlDeploymentArgs = {
  id: Scalars['ID']['input'];
  input: UpdateMlDeploymentInput;
  orgId: Scalars['ID']['input'];
};


export type MutationUpdateMlFindingArgs = {
  id: Scalars['ID']['input'];
  input: UpdateMlFindingInput;
  orgId: Scalars['ID']['input'];
};


export type MutationUpdateMlModelArgs = {
  caveats?: InputMaybe<Scalars['String']['input']>;
  domain?: InputMaybe<Scalars['String']['input']>;
  ethicalConsiderations?: InputMaybe<Scalars['String']['input']>;
  id: Scalars['ID']['input'];
  intendedUse?: InputMaybe<Scalars['String']['input']>;
  license?: InputMaybe<Scalars['String']['input']>;
  limitations?: InputMaybe<Scalars['String']['input']>;
  orgId: Scalars['ID']['input'];
  owners?: InputMaybe<Scalars['String']['input']>;
  problemType?: InputMaybe<Scalars['String']['input']>;
  references?: InputMaybe<Array<Scalars['String']['input']>>;
};


export type MutationUpdateOrgArgs = {
  id: Scalars['ID']['input'];
  input: UpdateOrgInput;
};


export type MutationUpdateSavedQueryArgs = {
  id: Scalars['ID']['input'];
  input: UpdateSavedQueryInput;
  orgId: Scalars['ID']['input'];
  serviceDbId: Scalars['ID']['input'];
  serviceId: Scalars['ID']['input'];
};


export type MutationUpdateServerOrgArgs = {
  id: Scalars['ID']['input'];
  input: UpdateServerOrgInput;
};


export type MutationUpdateServiceArgs = {
  id: Scalars['ID']['input'];
  input: UpdateServiceInput;
  orgId: Scalars['ID']['input'];
};


export type MutationUpdateServiceAccountArgs = {
  id: Scalars['ID']['input'];
  input: UpdateServiceAccountInput;
  orgId: Scalars['ID']['input'];
};


export type MutationUpdateServiceDbArgs = {
  id: Scalars['ID']['input'];
  input: UpdateServiceDbInput;
  orgId: Scalars['ID']['input'];
  serviceId: Scalars['ID']['input'];
};


export type MutationUpdateServiceDependenciesArgs = {
  input: UpdateServiceDependenciesInput;
  orgId: Scalars['ID']['input'];
  serviceId: Scalars['ID']['input'];
};


export type MutationUpdateTeamArgs = {
  input: UpdateTeamInput;
  orgId: Scalars['ID']['input'];
  teamId: Scalars['ID']['input'];
};


export type MutationUpdateTestCaseArgs = {
  id: Scalars['ID']['input'];
  input: UpdateTestCaseInput;
  orgId: Scalars['ID']['input'];
  serviceId: Scalars['ID']['input'];
};


export type MutationUpdateTestPackArgs = {
  id: Scalars['ID']['input'];
  input: UpdateTestPackInput;
  orgId: Scalars['ID']['input'];
  serviceId: Scalars['ID']['input'];
};


export type MutationUpdateTestRunArgs = {
  id: Scalars['ID']['input'];
  input: UpdateTestRunInput;
  orgId: Scalars['ID']['input'];
  serviceId: Scalars['ID']['input'];
};


export type MutationUpdateTestRunResultArgs = {
  id: Scalars['ID']['input'];
  input: UpdateTestRunResultInput;
  orgId: Scalars['ID']['input'];
  serviceId: Scalars['ID']['input'];
};


export type MutationUpdateUserArgs = {
  id: Scalars['ID']['input'];
  input: UpdateUserInput;
};


export type MutationUpsertCanvasArgs = {
  input: UpsertCanvasInput;
  mapId: Scalars['ID']['input'];
  orgId: Scalars['ID']['input'];
};


export type MutationUpsertLdapArgs = {
  input: UpsertLdapInput;
};


export type MutationUpsertOAuthProviderArgs = {
  input: UpsertOAuthInput;
  provider: Scalars['String']['input'];
};


export type MutationUpsertSamlArgs = {
  input: UpsertSamlInput;
};

export type OAuthProvider = {
  allowSignUp: Scalars['Boolean']['output'];
  allowedDomains: Scalars['String']['output'];
  apiUrl: Scalars['String']['output'];
  authUrl: Scalars['String']['output'];
  clientId: Scalars['String']['output'];
  clientSecret: Scalars['String']['output'];
  createdAt: Scalars['Time']['output'];
  displayName: Scalars['String']['output'];
  emailClaim: Scalars['String']['output'];
  iconUrl: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  nameClaim: Scalars['String']['output'];
  providerName: Scalars['String']['output'];
  scopes: Scalars['String']['output'];
  subClaim: Scalars['String']['output'];
  tokenUrl: Scalars['String']['output'];
  type: Scalars['String']['output'];
  updatedAt: Scalars['Time']['output'];
  userinfoUrl: Scalars['String']['output'];
};

export type Org = {
  autoJoin: Scalars['Boolean']['output'];
  createdAt: Scalars['Time']['output'];
  disabled: Scalars['Boolean']['output'];
  id: Scalars['ID']['output'];
  logoUrl?: Maybe<Scalars['String']['output']>;
  name: Scalars['String']['output'];
  updatedAt: Scalars['Time']['output'];
};

export type OrgSummary = {
  active: Scalars['Boolean']['output'];
  id: Scalars['ID']['output'];
  logoUrl?: Maybe<Scalars['String']['output']>;
  name: Scalars['String']['output'];
  onboardingDone: Scalars['Boolean']['output'];
  role: Scalars['String']['output'];
};

export type Query = {
  actor?: Maybe<Actor>;
  apiEndpoint: ApiEndpoint;
  apiEndpointById: ApiEndpoint;
  apiEndpoints: Array<ApiEndpoint>;
  apiGroup: ApiGroup;
  apiGroupSpec: FileDownload;
  apiGroupVersions: Array<ApiGroupVersion>;
  apiGroups: Array<ApiGroup>;
  assetUrl?: Maybe<Scalars['String']['output']>;
  assetUrls: Array<AssetUrl>;
  canvas: Canvas;
  chatMessages: Array<ChatMessage>;
  chatSession: ChatSessionWithMessages;
  chatSessions: Array<ChatSession>;
  comments: Array<Comment>;
  componentLinkUsages: Array<ComponentLinkUsage>;
  components: Components;
  costSavingsByClient: Array<ClientSavings>;
  costSavingsByModel: Array<ModelSavings>;
  costSavingsByTool: Array<ToolSavings>;
  costSavingsByUser: Array<UserSavings>;
  costSavingsSummary: SavingsSummary;
  costSavingsTimeseries: Array<DailySavings>;
  dependencies: Array<Dependency>;
  dependencyGraph: Array<Dependency>;
  diagram: Diagram;
  diagramContent: DiagramContent;
  diagramImages: Array<DiagramImage>;
  diagramVersionContent: DiagramContent;
  diagramVersions: Array<DiagramVersion>;
  diagrams: DiagramPage;
  doc: Doc;
  docs: DocPage;
  flowDiagramComponents: FlowDiagramComponents;
  focalPointMeta: Array<FocalPointMeta>;
  focalPointMetaByLink: Array<FocalPointMeta>;
  focalPoints: Array<FocalPoint>;
  folder: Folder;
  folders: Array<Folder>;
  frame: Frame;
  frameById: Frame;
  frameGroups: Array<FrameGroup>;
  frameLinks: Array<FrameLink>;
  frames: FramePage;
  ldap?: Maybe<LdapConfig>;
  map: UiMap;
  maps: UiMapPage;
  me: Me;
  members: Array<Member>;
  mlArtifacts: Array<MlArtifact>;
  mlDataset: MlDataset;
  mlDatasets: Array<MlDataset>;
  mlDeployments: Array<MlDeployment>;
  mlExperiment: MlExperiment;
  mlExperiments: Array<MlExperiment>;
  mlFindings: Array<MlFinding>;
  mlModel: MlModel;
  mlModelVersion: MlModelVersion;
  mlModelVersions: Array<MlModelVersion>;
  mlModels: Array<MlModel>;
  mlProject: MlProject;
  mlProjects: Array<MlProject>;
  mlRun: MlRun;
  mlRuns: Array<MlRun>;
  mlVersionDeploymentUpdates: Array<MlVersionDeploymentUpdate>;
  myOrgs: Array<OrgSummary>;
  oauthProviders: Array<OAuthProvider>;
  org: Org;
  orgs: Array<Org>;
  roleMappings: Array<RoleMapping>;
  saml?: Maybe<SamlConfig>;
  savedQueries: Array<SavedQuery>;
  savedQueryFolders: Array<SavedQueryFolder>;
  scim?: Maybe<ScimConfig>;
  serverConfig: ServerConfig;
  serverOrgs: Array<Org>;
  serverOverview: ServerOverview;
  service: Service;
  serviceAccount: ServiceAccount;
  serviceAccountScopes: Array<Scalars['String']['output']>;
  serviceAccountTokens: Array<ServiceAccountToken>;
  serviceAccounts: Array<ServiceAccount>;
  serviceDB: ServiceDb;
  serviceDBVersions: Array<ServiceDbVersion>;
  serviceDBs: Array<ServiceDb>;
  serviceDependencyGraph: Array<Dependency>;
  serviceDiagrams: Array<ServiceDiagram>;
  serviceDocById: ServiceDoc;
  serviceDocs: Array<ServiceDoc>;
  serviceImpact: Array<Dependency>;
  services: ServicePage;
  team: Team;
  teamMembers: Array<TeamMember>;
  teams: Array<Team>;
  testCases: Array<TestCase>;
  testPackById: TestPack;
  testPacks: Array<TestPack>;
  testRun: TestRun;
  testRunResults: Array<TestRunResult>;
  testRuns: Array<TestRun>;
  testRunsSummary: Array<TestRunSummary>;
  user: User;
  users: Array<User>;
};


export type QueryActorArgs = {
  id: Scalars['ID']['input'];
  orgId: Scalars['ID']['input'];
};


export type QueryApiEndpointArgs = {
  apiGroupId: Scalars['ID']['input'];
  id: Scalars['ID']['input'];
  orgId: Scalars['ID']['input'];
  serviceId: Scalars['ID']['input'];
};


export type QueryApiEndpointByIdArgs = {
  id: Scalars['ID']['input'];
  orgId: Scalars['ID']['input'];
};


export type QueryApiEndpointsArgs = {
  apiGroupId: Scalars['ID']['input'];
  orgId: Scalars['ID']['input'];
  serviceId: Scalars['ID']['input'];
  versionId?: InputMaybe<Scalars['ID']['input']>;
};


export type QueryApiGroupArgs = {
  id: Scalars['ID']['input'];
  orgId: Scalars['ID']['input'];
  serviceId: Scalars['ID']['input'];
};


export type QueryApiGroupSpecArgs = {
  apiGroupId: Scalars['ID']['input'];
  orgId: Scalars['ID']['input'];
  serviceId: Scalars['ID']['input'];
  versionId?: InputMaybe<Scalars['ID']['input']>;
};


export type QueryApiGroupVersionsArgs = {
  apiGroupId: Scalars['ID']['input'];
  orgId: Scalars['ID']['input'];
  serviceId: Scalars['ID']['input'];
};


export type QueryApiGroupsArgs = {
  orgId: Scalars['ID']['input'];
  serviceId: Scalars['ID']['input'];
};


export type QueryAssetUrlArgs = {
  assetId: Scalars['ID']['input'];
  orgId: Scalars['ID']['input'];
};


export type QueryAssetUrlsArgs = {
  assetIds: Array<Scalars['ID']['input']>;
  orgId: Scalars['ID']['input'];
};


export type QueryCanvasArgs = {
  mapId: Scalars['ID']['input'];
  orgId: Scalars['ID']['input'];
};


export type QueryChatMessagesArgs = {
  orgId: Scalars['ID']['input'];
  sessionId: Scalars['ID']['input'];
};


export type QueryChatSessionArgs = {
  id: Scalars['ID']['input'];
  orgId: Scalars['ID']['input'];
};


export type QueryChatSessionsArgs = {
  orgId: Scalars['ID']['input'];
};


export type QueryCommentsArgs = {
  orgId: Scalars['ID']['input'];
  resourceId: Scalars['ID']['input'];
};


export type QueryComponentLinkUsagesArgs = {
  linkId: Scalars['ID']['input'];
  orgId: Scalars['ID']['input'];
};


export type QueryComponentsArgs = {
  orgId: Scalars['ID']['input'];
};


export type QueryCostSavingsByClientArgs = {
  modelId?: InputMaybe<Scalars['String']['input']>;
  orgId: Scalars['ID']['input'];
  period?: InputMaybe<Scalars['String']['input']>;
};


export type QueryCostSavingsByModelArgs = {
  orgId: Scalars['ID']['input'];
  period?: InputMaybe<Scalars['String']['input']>;
};


export type QueryCostSavingsByToolArgs = {
  modelId?: InputMaybe<Scalars['String']['input']>;
  orgId: Scalars['ID']['input'];
  period?: InputMaybe<Scalars['String']['input']>;
};


export type QueryCostSavingsByUserArgs = {
  modelId?: InputMaybe<Scalars['String']['input']>;
  orgId: Scalars['ID']['input'];
  period?: InputMaybe<Scalars['String']['input']>;
};


export type QueryCostSavingsSummaryArgs = {
  modelId?: InputMaybe<Scalars['String']['input']>;
  orgId: Scalars['ID']['input'];
  period?: InputMaybe<Scalars['String']['input']>;
};


export type QueryCostSavingsTimeseriesArgs = {
  modelId?: InputMaybe<Scalars['String']['input']>;
  orgId: Scalars['ID']['input'];
  period?: InputMaybe<Scalars['String']['input']>;
};


export type QueryDependenciesArgs = {
  criticality?: InputMaybe<Scalars['String']['input']>;
  direction?: InputMaybe<Scalars['String']['input']>;
  orgId: Scalars['ID']['input'];
  serviceId: Scalars['ID']['input'];
};


export type QueryDependencyGraphArgs = {
  orgId: Scalars['ID']['input'];
};


export type QueryDiagramArgs = {
  id: Scalars['ID']['input'];
  orgId: Scalars['ID']['input'];
};


export type QueryDiagramContentArgs = {
  id: Scalars['ID']['input'];
  orgId: Scalars['ID']['input'];
};


export type QueryDiagramImagesArgs = {
  diagramId: Scalars['ID']['input'];
  orgId: Scalars['ID']['input'];
};


export type QueryDiagramVersionContentArgs = {
  diagramId: Scalars['ID']['input'];
  orgId: Scalars['ID']['input'];
  versionId: Scalars['ID']['input'];
};


export type QueryDiagramVersionsArgs = {
  diagramId: Scalars['ID']['input'];
  orgId: Scalars['ID']['input'];
};


export type QueryDiagramsArgs = {
  folderId?: InputMaybe<Scalars['ID']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  orgId: Scalars['ID']['input'];
  search?: InputMaybe<Scalars['String']['input']>;
  serviceId?: InputMaybe<Scalars['ID']['input']>;
  sortBy?: InputMaybe<Scalars['String']['input']>;
  sortDir?: InputMaybe<Scalars['String']['input']>;
  teamId?: InputMaybe<Scalars['ID']['input']>;
};


export type QueryDocArgs = {
  id: Scalars['ID']['input'];
  orgId: Scalars['ID']['input'];
};


export type QueryDocsArgs = {
  folderId?: InputMaybe<Scalars['ID']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  orgId: Scalars['ID']['input'];
  search?: InputMaybe<Scalars['String']['input']>;
  sortBy?: InputMaybe<Scalars['String']['input']>;
  sortDir?: InputMaybe<Scalars['String']['input']>;
  teamId?: InputMaybe<Scalars['ID']['input']>;
};


export type QueryFlowDiagramComponentsArgs = {
  orgId: Scalars['ID']['input'];
};


export type QueryFocalPointMetaArgs = {
  focalPointId: Scalars['ID']['input'];
  frameId: Scalars['ID']['input'];
  mapId: Scalars['ID']['input'];
  orgId: Scalars['ID']['input'];
};


export type QueryFocalPointMetaByLinkArgs = {
  linkId: Scalars['ID']['input'];
  orgId: Scalars['ID']['input'];
};


export type QueryFocalPointsArgs = {
  frameId: Scalars['ID']['input'];
  mapId: Scalars['ID']['input'];
  orgId: Scalars['ID']['input'];
};


export type QueryFolderArgs = {
  id: Scalars['ID']['input'];
  orgId: Scalars['ID']['input'];
};


export type QueryFoldersArgs = {
  orgId: Scalars['ID']['input'];
  parentId?: InputMaybe<Scalars['ID']['input']>;
  type?: InputMaybe<Scalars['String']['input']>;
};


export type QueryFrameArgs = {
  id: Scalars['ID']['input'];
  mapId: Scalars['ID']['input'];
  orgId: Scalars['ID']['input'];
};


export type QueryFrameByIdArgs = {
  id: Scalars['ID']['input'];
  orgId: Scalars['ID']['input'];
};


export type QueryFrameGroupsArgs = {
  frameId: Scalars['ID']['input'];
  mapId: Scalars['ID']['input'];
  orgId: Scalars['ID']['input'];
};


export type QueryFrameLinksArgs = {
  frameId: Scalars['ID']['input'];
  mapId: Scalars['ID']['input'];
  orgId: Scalars['ID']['input'];
};


export type QueryFramesArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  mapId: Scalars['ID']['input'];
  offset?: InputMaybe<Scalars['Int']['input']>;
  orgId: Scalars['ID']['input'];
  search?: InputMaybe<Scalars['String']['input']>;
  sortBy?: InputMaybe<Scalars['String']['input']>;
  sortDir?: InputMaybe<Scalars['String']['input']>;
};


export type QueryMapArgs = {
  id: Scalars['ID']['input'];
  orgId: Scalars['ID']['input'];
};


export type QueryMapsArgs = {
  folderId?: InputMaybe<Scalars['ID']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  orgId: Scalars['ID']['input'];
  search?: InputMaybe<Scalars['String']['input']>;
  sortBy?: InputMaybe<Scalars['String']['input']>;
  sortDir?: InputMaybe<Scalars['String']['input']>;
  teamId?: InputMaybe<Scalars['ID']['input']>;
};


export type QueryMembersArgs = {
  orgId: Scalars['ID']['input'];
};


export type QueryMlArtifactsArgs = {
  orgId: Scalars['ID']['input'];
  runId?: InputMaybe<Scalars['ID']['input']>;
};


export type QueryMlDatasetArgs = {
  id: Scalars['ID']['input'];
  orgId: Scalars['ID']['input'];
};


export type QueryMlDatasetsArgs = {
  experimentId?: InputMaybe<Scalars['ID']['input']>;
  orgId: Scalars['ID']['input'];
};


export type QueryMlDeploymentsArgs = {
  modelId?: InputMaybe<Scalars['ID']['input']>;
  orgId: Scalars['ID']['input'];
  versionId?: InputMaybe<Scalars['ID']['input']>;
};


export type QueryMlExperimentArgs = {
  id: Scalars['ID']['input'];
  orgId: Scalars['ID']['input'];
};


export type QueryMlExperimentsArgs = {
  orgId: Scalars['ID']['input'];
  projectId?: InputMaybe<Scalars['ID']['input']>;
};


export type QueryMlFindingsArgs = {
  modelId?: InputMaybe<Scalars['ID']['input']>;
  orgId: Scalars['ID']['input'];
  projectId?: InputMaybe<Scalars['ID']['input']>;
};


export type QueryMlModelArgs = {
  id: Scalars['ID']['input'];
  orgId: Scalars['ID']['input'];
};


export type QueryMlModelVersionArgs = {
  id: Scalars['ID']['input'];
  orgId: Scalars['ID']['input'];
};


export type QueryMlModelVersionsArgs = {
  modelId?: InputMaybe<Scalars['ID']['input']>;
  orgId: Scalars['ID']['input'];
  projectId?: InputMaybe<Scalars['ID']['input']>;
};


export type QueryMlModelsArgs = {
  orgId: Scalars['ID']['input'];
  projectId?: InputMaybe<Scalars['ID']['input']>;
};


export type QueryMlProjectArgs = {
  id: Scalars['ID']['input'];
  orgId: Scalars['ID']['input'];
};


export type QueryMlProjectsArgs = {
  orgId: Scalars['ID']['input'];
};


export type QueryMlRunArgs = {
  id: Scalars['ID']['input'];
  orgId: Scalars['ID']['input'];
};


export type QueryMlRunsArgs = {
  experimentId?: InputMaybe<Scalars['ID']['input']>;
  orgId: Scalars['ID']['input'];
  projectId?: InputMaybe<Scalars['ID']['input']>;
};


export type QueryMlVersionDeploymentUpdatesArgs = {
  orgId: Scalars['ID']['input'];
  projectId?: InputMaybe<Scalars['ID']['input']>;
  versionId?: InputMaybe<Scalars['ID']['input']>;
};


export type QueryOrgArgs = {
  id: Scalars['ID']['input'];
};


export type QuerySavedQueriesArgs = {
  orgId: Scalars['ID']['input'];
  scope: SavedQueryScope;
  serviceDbId: Scalars['ID']['input'];
  serviceId: Scalars['ID']['input'];
};


export type QuerySavedQueryFoldersArgs = {
  orgId: Scalars['ID']['input'];
  scope: SavedQueryScope;
  serviceDbId: Scalars['ID']['input'];
  serviceId: Scalars['ID']['input'];
};


export type QueryServiceArgs = {
  id: Scalars['ID']['input'];
  orgId: Scalars['ID']['input'];
};


export type QueryServiceAccountArgs = {
  id: Scalars['ID']['input'];
  orgId: Scalars['ID']['input'];
};


export type QueryServiceAccountScopesArgs = {
  orgId: Scalars['ID']['input'];
};


export type QueryServiceAccountTokensArgs = {
  orgId: Scalars['ID']['input'];
  saId: Scalars['ID']['input'];
};


export type QueryServiceAccountsArgs = {
  orgId: Scalars['ID']['input'];
};


export type QueryServiceDbArgs = {
  id: Scalars['ID']['input'];
  orgId: Scalars['ID']['input'];
  serviceId: Scalars['ID']['input'];
};


export type QueryServiceDbVersionsArgs = {
  orgId: Scalars['ID']['input'];
  serviceDbId: Scalars['ID']['input'];
  serviceId: Scalars['ID']['input'];
};


export type QueryServiceDBsArgs = {
  orgId: Scalars['ID']['input'];
  serviceId: Scalars['ID']['input'];
};


export type QueryServiceDependencyGraphArgs = {
  orgId: Scalars['ID']['input'];
  serviceId: Scalars['ID']['input'];
};


export type QueryServiceDiagramsArgs = {
  orgId: Scalars['ID']['input'];
  serviceId: Scalars['ID']['input'];
};


export type QueryServiceDocByIdArgs = {
  id: Scalars['ID']['input'];
  orgId: Scalars['ID']['input'];
};


export type QueryServiceDocsArgs = {
  orgId: Scalars['ID']['input'];
  serviceId: Scalars['ID']['input'];
};


export type QueryServiceImpactArgs = {
  direction?: InputMaybe<Scalars['String']['input']>;
  maxDepth?: InputMaybe<Scalars['Int']['input']>;
  orgId: Scalars['ID']['input'];
  serviceId: Scalars['ID']['input'];
};


export type QueryServicesArgs = {
  folderId?: InputMaybe<Scalars['ID']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  orgId: Scalars['ID']['input'];
  search?: InputMaybe<Scalars['String']['input']>;
  sortBy?: InputMaybe<Scalars['String']['input']>;
  sortDir?: InputMaybe<Scalars['String']['input']>;
  teamId?: InputMaybe<Scalars['ID']['input']>;
};


export type QueryTeamArgs = {
  orgId: Scalars['ID']['input'];
  teamId: Scalars['ID']['input'];
};


export type QueryTeamMembersArgs = {
  orgId: Scalars['ID']['input'];
  teamId: Scalars['ID']['input'];
};


export type QueryTeamsArgs = {
  orgId: Scalars['ID']['input'];
};


export type QueryTestCasesArgs = {
  orgId: Scalars['ID']['input'];
  serviceId: Scalars['ID']['input'];
  testPackId?: InputMaybe<Scalars['ID']['input']>;
};


export type QueryTestPackByIdArgs = {
  id: Scalars['ID']['input'];
  orgId: Scalars['ID']['input'];
};


export type QueryTestPacksArgs = {
  orgId: Scalars['ID']['input'];
  serviceId: Scalars['ID']['input'];
};


export type QueryTestRunArgs = {
  id: Scalars['ID']['input'];
  orgId: Scalars['ID']['input'];
  serviceId: Scalars['ID']['input'];
};


export type QueryTestRunResultsArgs = {
  orgId: Scalars['ID']['input'];
  serviceId: Scalars['ID']['input'];
  testRunId: Scalars['ID']['input'];
};


export type QueryTestRunsArgs = {
  orgId: Scalars['ID']['input'];
  serviceId: Scalars['ID']['input'];
  testPackId?: InputMaybe<Scalars['ID']['input']>;
};


export type QueryTestRunsSummaryArgs = {
  environment?: InputMaybe<Scalars['String']['input']>;
  executedBy?: InputMaybe<Scalars['ID']['input']>;
  fromDate?: InputMaybe<Scalars['Time']['input']>;
  orgId: Scalars['ID']['input'];
  serviceId: Scalars['ID']['input'];
  status?: InputMaybe<Scalars['String']['input']>;
  testPackId?: InputMaybe<Scalars['ID']['input']>;
  toDate?: InputMaybe<Scalars['Time']['input']>;
};


export type QueryUserArgs = {
  id: Scalars['ID']['input'];
};

export type RoleMapping = {
  claimKey: Scalars['String']['output'];
  claimValue: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  organizationId: Scalars['ID']['output'];
  resourceId: Scalars['String']['output'];
  resourceType: Scalars['String']['output'];
  role: Scalars['String']['output'];
  scope: Scalars['String']['output'];
};

export type SamlConfig = {
  allowSignUp: Scalars['Boolean']['output'];
  createdAt: Scalars['Time']['output'];
  emailAttribute: Scalars['String']['output'];
  groupsAttribute: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  idpCert: Scalars['String']['output'];
  idpEntityId: Scalars['String']['output'];
  idpMetadataUrl: Scalars['String']['output'];
  idpMetadataXml: Scalars['String']['output'];
  idpSsoUrl: Scalars['String']['output'];
  loginAttribute: Scalars['String']['output'];
  nameAttribute: Scalars['String']['output'];
  nameIdFormat: Scalars['String']['output'];
  signRequests: Scalars['Boolean']['output'];
  spCert: Scalars['String']['output'];
  spEntityId: Scalars['String']['output'];
  spKey: Scalars['String']['output'];
  updatedAt: Scalars['Time']['output'];
};

export type ScimConfig = {
  id: Scalars['ID']['output'];
};

export type SavedQuery = {
  createdAt: Scalars['Time']['output'];
  createdBy: Scalars['ID']['output'];
  createdByActor?: Maybe<Actor>;
  createdByCommitHash?: Maybe<Scalars['String']['output']>;
  description: Scalars['String']['output'];
  folderId?: Maybe<Scalars['ID']['output']>;
  id: Scalars['ID']['output'];
  orgId: Scalars['ID']['output'];
  ownerUserId?: Maybe<Scalars['ID']['output']>;
  queryText: Scalars['String']['output'];
  scope: SavedQueryScope;
  serviceDbId: Scalars['ID']['output'];
  source?: Maybe<Scalars['String']['output']>;
  tags: Array<Scalars['String']['output']>;
  teamId?: Maybe<Scalars['ID']['output']>;
  title: Scalars['String']['output'];
  updatedAt: Scalars['Time']['output'];
  updatedBy?: Maybe<Scalars['ID']['output']>;
  updatedByActor?: Maybe<Actor>;
  updatedByCommitHash?: Maybe<Scalars['String']['output']>;
};

export type SavedQueryFolder = {
  createdAt: Scalars['Time']['output'];
  createdBy: Scalars['ID']['output'];
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
  orgId: Scalars['ID']['output'];
  ownerUserId?: Maybe<Scalars['ID']['output']>;
  scope: SavedQueryScope;
  serviceDbId: Scalars['ID']['output'];
  teamId?: Maybe<Scalars['ID']['output']>;
  updatedAt: Scalars['Time']['output'];
};

export enum SavedQueryScope {
  Personal = 'PERSONAL',
  Team = 'TEAM'
}

export type SavingsSummary = {
  costRawUsd: Scalars['Float']['output'];
  costSavedUsd: Scalars['Float']['output'];
  costServedUsd: Scalars['Float']['output'];
  estAgentTimeMs: Scalars['Int']['output'];
  modelId?: Maybe<Scalars['String']['output']>;
  orgId: Scalars['ID']['output'];
  period: Scalars['String']['output'];
  timeSavedMs: Scalars['Int']['output'];
  totalCalls: Scalars['Int']['output'];
  totalDurationMs: Scalars['Int']['output'];
  totalTokensSaved: Scalars['Int']['output'];
  totalTokensServed: Scalars['Int']['output'];
  uniqueUsersCount: Scalars['Int']['output'];
};

export type ServerConfig = {
  embeddingBackend: Scalars['String']['output'];
  embeddingModel: Scalars['String']['output'];
  storageBackend: Scalars['String']['output'];
  storageBucket: Scalars['String']['output'];
  storageEndpoint: Scalars['String']['output'];
  vectorBackend: Scalars['String']['output'];
};

export type ServerOverview = {
  activeUsers: Scalars['Int']['output'];
  totalOrgs: Scalars['Int']['output'];
  totalUsers: Scalars['Int']['output'];
};

export type Service = {
  category: Scalars['String']['output'];
  createdAt: Scalars['Time']['output'];
  createdBy: Scalars['ID']['output'];
  createdByActor?: Maybe<Actor>;
  createdByCommitHash?: Maybe<Scalars['String']['output']>;
  description: Scalars['String']['output'];
  folderId?: Maybe<Scalars['ID']['output']>;
  gitRepoUrl?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  jiraProjectUrl?: Maybe<Scalars['String']['output']>;
  labels: Array<Scalars['String']['output']>;
  language: Scalars['String']['output'];
  lastCommitSha?: Maybe<Scalars['String']['output']>;
  metadata: Scalars['String']['output'];
  name: Scalars['String']['output'];
  orgId: Scalars['ID']['output'];
  slackChannelUrl?: Maybe<Scalars['String']['output']>;
  stats?: Maybe<ServiceStats>;
  status: Scalars['String']['output'];
  teamId?: Maybe<Scalars['ID']['output']>;
  tier: Scalars['String']['output'];
  updatedAt: Scalars['Time']['output'];
  updatedBy?: Maybe<Scalars['ID']['output']>;
  updatedByActor?: Maybe<Actor>;
  updatedByCommitHash?: Maybe<Scalars['String']['output']>;
};

export type ServiceAccount = {
  createdAt: Scalars['Time']['output'];
  description: Scalars['String']['output'];
  disabled: Scalars['Boolean']['output'];
  id: Scalars['ID']['output'];
  isInternal: Scalars['Boolean']['output'];
  name: Scalars['String']['output'];
  orgId: Scalars['ID']['output'];
  scopes: Array<Scalars['String']['output']>;
  updatedAt: Scalars['Time']['output'];
};

export type ServiceAccountToken = {
  createdAt: Scalars['Time']['output'];
  expiresAt?: Maybe<Scalars['Time']['output']>;
  id: Scalars['ID']['output'];
  lastUsedAt?: Maybe<Scalars['Time']['output']>;
  name: Scalars['String']['output'];
  prefix: Scalars['String']['output'];
  revoked: Scalars['Boolean']['output'];
  serviceAccountId: Scalars['ID']['output'];
};

export type ServiceDb = {
  createdAt: Scalars['Time']['output'];
  createdBy: Scalars['ID']['output'];
  createdByActor?: Maybe<Actor>;
  createdByCommitHash?: Maybe<Scalars['String']['output']>;
  dbDiagramId?: Maybe<Scalars['String']['output']>;
  dbName: Scalars['String']['output'];
  dbType: Scalars['String']['output'];
  dialect: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  noSQLSchema?: Maybe<Scalars['JSON']['output']>;
  orgId: Scalars['ID']['output'];
  pgDumpFileId?: Maybe<Scalars['String']['output']>;
  schemaJson: Scalars['String']['output'];
  serviceId: Scalars['ID']['output'];
  source?: Maybe<Scalars['String']['output']>;
  sourceTs?: Maybe<Scalars['Time']['output']>;
  tables: Array<DbTable>;
  updatedAt: Scalars['Time']['output'];
  updatedBy?: Maybe<Scalars['ID']['output']>;
  updatedByActor?: Maybe<Actor>;
  updatedByCommitHash?: Maybe<Scalars['String']['output']>;
};

export type ServiceDbVersion = {
  createdAt: Scalars['Time']['output'];
  createdBy: Scalars['ID']['output'];
  createdByActor?: Maybe<Actor>;
  createdByCommitHash?: Maybe<Scalars['String']['output']>;
  dbDiagramId?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  isAutoVersion: Scalars['Boolean']['output'];
  label?: Maybe<Scalars['String']['output']>;
  noSQLSchema?: Maybe<Scalars['JSON']['output']>;
  orgId: Scalars['ID']['output'];
  pgDumpFileId?: Maybe<Scalars['String']['output']>;
  schemaJson: Scalars['String']['output'];
  serviceDbId: Scalars['ID']['output'];
  source?: Maybe<Scalars['String']['output']>;
  sourceTs?: Maybe<Scalars['Time']['output']>;
  tables: Array<DbTable>;
  versionNumber: Scalars['Int']['output'];
};

export type ServiceDependencyInput = {
  apiEndpointNames?: InputMaybe<Array<Scalars['String']['input']>>;
  apiGroupName?: InputMaybe<Scalars['String']['input']>;
  criticality: Scalars['String']['input'];
  databaseName?: InputMaybe<Scalars['String']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  name: Scalars['String']['input'];
  service: Scalars['String']['input'];
  type?: InputMaybe<Scalars['String']['input']>;
};

export type ServiceDiagram = {
  createdAt: Scalars['Time']['output'];
  createdBy: Scalars['ID']['output'];
  createdByCommitHash?: Maybe<Scalars['String']['output']>;
  diagram?: Maybe<Diagram>;
  diagramId: Scalars['ID']['output'];
  orgId: Scalars['ID']['output'];
  serviceId: Scalars['ID']['output'];
  updatedAt: Scalars['Time']['output'];
  updatedBy?: Maybe<Scalars['ID']['output']>;
  updatedByCommitHash?: Maybe<Scalars['String']['output']>;
};

export type ServiceDoc = {
  createdAt: Scalars['Time']['output'];
  createdBy: Scalars['ID']['output'];
  createdByCommitHash?: Maybe<Scalars['String']['output']>;
  doc?: Maybe<Doc>;
  docId: Scalars['ID']['output'];
  orgId: Scalars['ID']['output'];
  serviceId: Scalars['ID']['output'];
  updatedAt: Scalars['Time']['output'];
  updatedBy?: Maybe<Scalars['ID']['output']>;
  updatedByCommitHash?: Maybe<Scalars['String']['output']>;
};

export type ServicePage = {
  items: Array<Service>;
  totalCount: Scalars['Int']['output'];
};

export type ServiceStats = {
  dbTableCount: Scalars['Int']['output'];
  diagramCount: Scalars['Int']['output'];
  docCount: Scalars['Int']['output'];
  endpointCount: Scalars['Int']['output'];
  serviceId: Scalars['ID']['output'];
  testCaseCount: Scalars['Int']['output'];
};

export type SyncApiGroupInput = {
  apiGroupId?: InputMaybe<Scalars['ID']['input']>;
  name: Scalars['String']['input'];
  protocol?: InputMaybe<Scalars['String']['input']>;
  spec?: InputMaybe<Scalars['String']['input']>;
  specAssetId?: InputMaybe<Scalars['String']['input']>;
  version?: InputMaybe<Scalars['String']['input']>;
};

export type SyncApiGroupResult = {
  apiGroupId: Scalars['ID']['output'];
  versionCreated: Scalars['Boolean']['output'];
};

export type SyncDiagramInput = {
  content: Scalars['String']['input'];
  diagramId?: InputMaybe<Scalars['ID']['input']>;
  folderId?: InputMaybe<Scalars['ID']['input']>;
  name: Scalars['String']['input'];
  source?: InputMaybe<Scalars['String']['input']>;
  teamId?: InputMaybe<Scalars['ID']['input']>;
};

export type SyncDiagramResult = {
  diagramId: Scalars['ID']['output'];
  versionCreated: Scalars['Boolean']['output'];
  versionId?: Maybe<Scalars['ID']['output']>;
};

export type SyncFrameInput = {
  description?: InputMaybe<Scalars['String']['input']>;
  frameId?: InputMaybe<Scalars['ID']['input']>;
  name: Scalars['String']['input'];
  screenshot: Scalars['String']['input'];
  source?: InputMaybe<Scalars['String']['input']>;
  templateType: Scalars['String']['input'];
};

export type SyncFrameResult = {
  frameId: Scalars['ID']['output'];
  versionCreated: Scalars['Boolean']['output'];
};

export type Team = {
  createdAt: Scalars['Time']['output'];
  email?: Maybe<Scalars['String']['output']>;
  externalId?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  memberCount: Scalars['Int']['output'];
  name: Scalars['String']['output'];
  orgId: Scalars['ID']['output'];
  updatedAt: Scalars['Time']['output'];
};

export type TeamMember = {
  createdAt: Scalars['Time']['output'];
  permission: Scalars['String']['output'];
  teamId: Scalars['ID']['output'];
  userId: Scalars['ID']['output'];
};

export type TestCase = {
  api?: Maybe<ApiTestCase>;
  baselineRunResultId?: Maybe<Scalars['ID']['output']>;
  createdAt: Scalars['Time']['output'];
  createdBy: Scalars['ID']['output'];
  createdByCommitHash?: Maybe<Scalars['String']['output']>;
  database?: Maybe<DatabaseTestCase>;
  deletedAt?: Maybe<Scalars['Time']['output']>;
  deletedBy?: Maybe<Scalars['ID']['output']>;
  dependencies: Array<Scalars['ID']['output']>;
  description?: Maybe<Scalars['String']['output']>;
  estimatedDurationMins?: Maybe<Scalars['Int']['output']>;
  evidenceRequired: Scalars['Boolean']['output'];
  graphql?: Maybe<GraphQlTestCase>;
  grpc?: Maybe<GrpcTestCase>;
  isCritical: Scalars['Boolean']['output'];
  labels: Array<Scalars['String']['output']>;
  linkedMapNodeId?: Maybe<Scalars['ID']['output']>;
  linkedTicket?: Maybe<Scalars['String']['output']>;
  manual?: Maybe<ManualTestCase>;
  order: Scalars['Float']['output'];
  orgId: Scalars['ID']['output'];
  priority?: Maybe<Scalars['String']['output']>;
  serviceId: Scalars['ID']['output'];
  status: Scalars['String']['output'];
  testCaseId: Scalars['ID']['output'];
  testOwner?: Maybe<Scalars['String']['output']>;
  testPackId: Scalars['ID']['output'];
  title: Scalars['String']['output'];
  type: Scalars['String']['output'];
  updatedAt: Scalars['Time']['output'];
  updatedBy?: Maybe<Scalars['ID']['output']>;
  updatedByCommitHash?: Maybe<Scalars['String']['output']>;
  version: Scalars['Int']['output'];
};

export type TestCaseStep = {
  action: Scalars['String']['output'];
  expectedResult: Scalars['String']['output'];
  order: Scalars['Int']['output'];
};

export type TestCaseStepInput = {
  action: Scalars['String']['input'];
  expectedResult: Scalars['String']['input'];
  order: Scalars['Int']['input'];
};

export type TestPack = {
  createdAt: Scalars['Time']['output'];
  createdBy: Scalars['ID']['output'];
  createdByCommitHash?: Maybe<Scalars['String']['output']>;
  deletedAt?: Maybe<Scalars['Time']['output']>;
  deletedBy?: Maybe<Scalars['ID']['output']>;
  name: Scalars['String']['output'];
  orgId: Scalars['ID']['output'];
  serviceId: Scalars['ID']['output'];
  testPackId: Scalars['ID']['output'];
  type: Scalars['String']['output'];
  updatedAt: Scalars['Time']['output'];
  updatedBy?: Maybe<Scalars['ID']['output']>;
  updatedByCommitHash?: Maybe<Scalars['String']['output']>;
};

export type TestRun = {
  completedAt?: Maybe<Scalars['Time']['output']>;
  environment: Scalars['String']['output'];
  executedAt: Scalars['Time']['output'];
  executedBy: Scalars['ID']['output'];
  orgId: Scalars['ID']['output'];
  overallStatus: Scalars['String']['output'];
  releaseLabel?: Maybe<Scalars['String']['output']>;
  serviceId: Scalars['ID']['output'];
  startedAt?: Maybe<Scalars['Time']['output']>;
  startedBy?: Maybe<Scalars['ID']['output']>;
  status: Scalars['String']['output'];
  testPackId: Scalars['ID']['output'];
  testRunId: Scalars['ID']['output'];
};

export type TestRunResult = {
  blockedReason?: Maybe<Scalars['String']['output']>;
  executedAt: Scalars['Time']['output'];
  executedBy: Scalars['ID']['output'];
  notes?: Maybe<Scalars['String']['output']>;
  orgId: Scalars['ID']['output'];
  responseBody?: Maybe<Scalars['String']['output']>;
  responseStatus?: Maybe<Scalars['Int']['output']>;
  responseTimeMs?: Maybe<Scalars['Int']['output']>;
  screenshotUrls: Array<Scalars['String']['output']>;
  serviceId: Scalars['ID']['output'];
  status: Scalars['String']['output'];
  testCaseId: Scalars['ID']['output'];
  testRunId: Scalars['ID']['output'];
  testRunResultId: Scalars['ID']['output'];
};

export type TestRunSummary = {
  blockedCount: Scalars['Int']['output'];
  completedAt?: Maybe<Scalars['Time']['output']>;
  environment: Scalars['String']['output'];
  executedAt: Scalars['Time']['output'];
  executedBy: Scalars['ID']['output'];
  failedCount: Scalars['Int']['output'];
  overallStatus: Scalars['String']['output'];
  passedCount: Scalars['Int']['output'];
  releaseLabel?: Maybe<Scalars['String']['output']>;
  serviceId: Scalars['ID']['output'];
  skippedCount: Scalars['Int']['output'];
  startedAt?: Maybe<Scalars['Time']['output']>;
  startedBy?: Maybe<Scalars['ID']['output']>;
  status: Scalars['String']['output'];
  testPackId: Scalars['ID']['output'];
  testRunId: Scalars['ID']['output'];
};

export type ToolSavings = {
  costSavedUsd: Scalars['Float']['output'];
  estAgentTimeMs: Scalars['Int']['output'];
  timeSavedMs: Scalars['Int']['output'];
  tokensSaved: Scalars['Int']['output'];
  toolName: Scalars['String']['output'];
  totalCalls: Scalars['Int']['output'];
  totalDurationMs: Scalars['Int']['output'];
};

export type UiMap = {
  createdAt: Scalars['Time']['output'];
  createdBy: Scalars['ID']['output'];
  createdByCommitHash?: Maybe<Scalars['String']['output']>;
  description: Scalars['String']['output'];
  folderId?: Maybe<Scalars['ID']['output']>;
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
  orgId: Scalars['ID']['output'];
  previewImgUrls: Array<Scalars['String']['output']>;
  status: Scalars['String']['output'];
  teamId?: Maybe<Scalars['ID']['output']>;
  updatedAt: Scalars['Time']['output'];
  updatedBy?: Maybe<Scalars['ID']['output']>;
  updatedByCommitHash?: Maybe<Scalars['String']['output']>;
};

export type UiMapPage = {
  items: Array<UiMap>;
  totalCount: Scalars['Int']['output'];
};

export type UpdateApiEndpointInput = {
  description?: InputMaybe<Scalars['String']['input']>;
  exampleRequests?: InputMaybe<Scalars['String']['input']>;
  exampleResponses?: InputMaybe<Scalars['String']['input']>;
  method?: InputMaybe<Scalars['String']['input']>;
  operationId?: InputMaybe<Scalars['String']['input']>;
  order?: InputMaybe<Scalars['Float']['input']>;
  parameters?: InputMaybe<Scalars['String']['input']>;
  path?: InputMaybe<Scalars['String']['input']>;
  requestBody?: InputMaybe<Scalars['String']['input']>;
  responses?: InputMaybe<Scalars['String']['input']>;
  summary?: InputMaybe<Scalars['String']['input']>;
  tags?: InputMaybe<Array<Scalars['String']['input']>>;
};

export type UpdateApiGroupInput = {
  label?: InputMaybe<Scalars['String']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  protocol?: InputMaybe<Scalars['String']['input']>;
  spec?: InputMaybe<Scalars['String']['input']>;
  specAssetId?: InputMaybe<Scalars['String']['input']>;
  version?: InputMaybe<Scalars['String']['input']>;
};

export type UpdateChatSessionInput = {
  isPinned?: InputMaybe<Scalars['Boolean']['input']>;
  title?: InputMaybe<Scalars['String']['input']>;
};

export type UpdateCommentInput = {
  text?: InputMaybe<Scalars['String']['input']>;
};

export type UpdateDiagramInput = {
  content?: InputMaybe<Scalars['String']['input']>;
  folderId?: InputMaybe<Scalars['ID']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  source?: InputMaybe<Scalars['String']['input']>;
  teamId?: InputMaybe<Scalars['ID']['input']>;
};

export type UpdateDocInput = {
  contentBase64?: InputMaybe<Scalars['String']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  fileAssetId?: InputMaybe<Scalars['String']['input']>;
  fileName?: InputMaybe<Scalars['String']['input']>;
  fileType?: InputMaybe<Scalars['String']['input']>;
  folderId?: InputMaybe<Scalars['ID']['input']>;
  teamId?: InputMaybe<Scalars['ID']['input']>;
};

export type UpdateFocalPointInput = {
  isActive?: InputMaybe<Scalars['Boolean']['input']>;
  locationX?: InputMaybe<Scalars['Float']['input']>;
  locationY?: InputMaybe<Scalars['Float']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  visibility?: InputMaybe<Scalars['String']['input']>;
};

export type UpdateFocalPointMetaInput = {
  componentId?: InputMaybe<Scalars['String']['input']>;
  componentLinkApiEndpointId?: InputMaybe<Scalars['ID']['input']>;
  componentLinkDiagramId?: InputMaybe<Scalars['ID']['input']>;
  componentLinkServiceDocId?: InputMaybe<Scalars['ID']['input']>;
  componentLinkTestPackId?: InputMaybe<Scalars['ID']['input']>;
  componentModalFields?: InputMaybe<Array<ComponentModalFieldInput>>;
};

export type UpdateFolderInput = {
  name?: InputMaybe<Scalars['String']['input']>;
  order?: InputMaybe<Scalars['Float']['input']>;
  parentId?: InputMaybe<Scalars['ID']['input']>;
  teamId?: InputMaybe<Scalars['ID']['input']>;
};

export type UpdateFrameGroupInput = {
  description?: InputMaybe<Scalars['String']['input']>;
  height?: InputMaybe<Scalars['Float']['input']>;
  isActive?: InputMaybe<Scalars['Boolean']['input']>;
  locationX?: InputMaybe<Scalars['Float']['input']>;
  locationY?: InputMaybe<Scalars['Float']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  order?: InputMaybe<Scalars['Float']['input']>;
  width?: InputMaybe<Scalars['Float']['input']>;
};

export type UpdateFrameInput = {
  description?: InputMaybe<Scalars['String']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  order?: InputMaybe<Scalars['Float']['input']>;
  screenshot?: InputMaybe<Scalars['String']['input']>;
  screenshotAssetId?: InputMaybe<Scalars['String']['input']>;
  status?: InputMaybe<Scalars['String']['input']>;
  templateType?: InputMaybe<Scalars['String']['input']>;
};

export type UpdateFrameLinkInput = {
  isActive?: InputMaybe<Scalars['Boolean']['input']>;
  kind?: InputMaybe<Scalars['String']['input']>;
  label?: InputMaybe<Scalars['String']['input']>;
  locationX?: InputMaybe<Scalars['Float']['input']>;
  locationY?: InputMaybe<Scalars['Float']['input']>;
  targetFrameId?: InputMaybe<Scalars['ID']['input']>;
  targetMapId?: InputMaybe<Scalars['ID']['input']>;
};

export type UpdateMapInput = {
  description?: InputMaybe<Scalars['String']['input']>;
  folderId?: InputMaybe<Scalars['ID']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  status?: InputMaybe<Scalars['String']['input']>;
  teamId?: InputMaybe<Scalars['ID']['input']>;
};

export type UpdateMemberInput = {
  email: Scalars['String']['input'];
  name: Scalars['String']['input'];
  role: Scalars['String']['input'];
  teamId?: InputMaybe<Scalars['ID']['input']>;
};

export type UpdateMlDeploymentInput = {
  deployedAt?: InputMaybe<Scalars['Time']['input']>;
  endpoint?: InputMaybe<Scalars['String']['input']>;
  environment?: InputMaybe<Scalars['String']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  region?: InputMaybe<Scalars['String']['input']>;
  rolledBackAt?: InputMaybe<Scalars['Time']['input']>;
  status?: InputMaybe<Scalars['String']['input']>;
};

export type UpdateMlFindingInput = {
  description?: InputMaybe<Scalars['String']['input']>;
  runIds?: InputMaybe<Array<Scalars['ID']['input']>>;
  summary?: InputMaybe<Scalars['String']['input']>;
  title?: InputMaybe<Scalars['String']['input']>;
  versionId?: InputMaybe<Scalars['ID']['input']>;
};

export type UpdateOrgInput = {
  disabled?: InputMaybe<Scalars['Boolean']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
};

export type UpdateSavedQueryInput = {
  description?: InputMaybe<Scalars['String']['input']>;
  folderId?: InputMaybe<Scalars['ID']['input']>;
  queryText?: InputMaybe<Scalars['String']['input']>;
  tags?: InputMaybe<Array<Scalars['String']['input']>>;
  title?: InputMaybe<Scalars['String']['input']>;
};

export type UpdateServerOrgInput = {
  autoJoin?: InputMaybe<Scalars['Boolean']['input']>;
  disabled?: InputMaybe<Scalars['Boolean']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
};

export type UpdateServiceAccountInput = {
  description?: InputMaybe<Scalars['String']['input']>;
  disabled?: InputMaybe<Scalars['Boolean']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  scopes?: InputMaybe<Array<Scalars['String']['input']>>;
};

export type UpdateServiceDbInput = {
  dbName?: InputMaybe<Scalars['String']['input']>;
  dbType?: InputMaybe<Scalars['String']['input']>;
  dialect?: InputMaybe<Scalars['String']['input']>;
  schemaJson?: InputMaybe<Scalars['String']['input']>;
  source?: InputMaybe<Scalars['String']['input']>;
  sourceTs?: InputMaybe<Scalars['Time']['input']>;
};

export type UpdateServiceDependenciesInput = {
  commitHash?: InputMaybe<Scalars['String']['input']>;
  dependencies: Array<ServiceDependencyInput>;
};

export type UpdateServiceInput = {
  category?: InputMaybe<Scalars['String']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  folderId?: InputMaybe<Scalars['ID']['input']>;
  gitRepoUrl?: InputMaybe<Scalars['String']['input']>;
  jiraProjectUrl?: InputMaybe<Scalars['String']['input']>;
  labels?: InputMaybe<Array<Scalars['String']['input']>>;
  language?: InputMaybe<Scalars['String']['input']>;
  lastCommitSha?: InputMaybe<Scalars['String']['input']>;
  metadata?: InputMaybe<Scalars['String']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  slackChannelUrl?: InputMaybe<Scalars['String']['input']>;
  status?: InputMaybe<Scalars['String']['input']>;
  teamId?: InputMaybe<Scalars['ID']['input']>;
  tier?: InputMaybe<Scalars['String']['input']>;
};

export type UpdateTeamInput = {
  email?: InputMaybe<Scalars['String']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
};

export type UpdateTestCaseInput = {
  api?: InputMaybe<ApiTestCaseInput>;
  baselineRunResultId?: InputMaybe<Scalars['ID']['input']>;
  database?: InputMaybe<DatabaseTestCaseInput>;
  dependencies?: InputMaybe<Array<Scalars['ID']['input']>>;
  description?: InputMaybe<Scalars['String']['input']>;
  estimatedDurationMins?: InputMaybe<Scalars['Int']['input']>;
  evidenceRequired?: InputMaybe<Scalars['Boolean']['input']>;
  graphql?: InputMaybe<GraphQlTestCaseInput>;
  grpc?: InputMaybe<GrpcTestCaseInput>;
  isCritical?: InputMaybe<Scalars['Boolean']['input']>;
  labels?: InputMaybe<Array<Scalars['String']['input']>>;
  linkedMapNodeId?: InputMaybe<Scalars['ID']['input']>;
  linkedTicket?: InputMaybe<Scalars['String']['input']>;
  manual?: InputMaybe<ManualTestCaseInput>;
  order?: InputMaybe<Scalars['Float']['input']>;
  priority?: InputMaybe<Scalars['String']['input']>;
  status?: InputMaybe<Scalars['String']['input']>;
  testOwner?: InputMaybe<Scalars['String']['input']>;
  testPackId?: InputMaybe<Scalars['ID']['input']>;
  title?: InputMaybe<Scalars['String']['input']>;
  type?: InputMaybe<Scalars['String']['input']>;
  version?: InputMaybe<Scalars['Int']['input']>;
};

export type UpdateTestPackInput = {
  name?: InputMaybe<Scalars['String']['input']>;
  type?: InputMaybe<Scalars['String']['input']>;
};

export type UpdateTestRunInput = {
  completedAt?: InputMaybe<Scalars['Time']['input']>;
  overallStatus?: InputMaybe<Scalars['String']['input']>;
  status?: InputMaybe<Scalars['String']['input']>;
};

export type UpdateTestRunResultInput = {
  blockedReason?: InputMaybe<Scalars['String']['input']>;
  notes?: InputMaybe<Scalars['String']['input']>;
  responseBody?: InputMaybe<Scalars['String']['input']>;
  responseStatus?: InputMaybe<Scalars['Int']['input']>;
  responseTimeMs?: InputMaybe<Scalars['Int']['input']>;
  screenshotUrls?: InputMaybe<Array<Scalars['String']['input']>>;
  status?: InputMaybe<Scalars['String']['input']>;
};

export type UpdateUserInput = {
  disabled?: InputMaybe<Scalars['Boolean']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  role?: InputMaybe<Scalars['String']['input']>;
};

export type UpsertCanvasInput = {
  framePositions?: InputMaybe<Scalars['String']['input']>;
  navigationX?: InputMaybe<Scalars['Float']['input']>;
  navigationY?: InputMaybe<Scalars['Float']['input']>;
  zoom?: InputMaybe<Scalars['Float']['input']>;
};

export type UpsertLdapInput = {
  allowSignUp: Scalars['Boolean']['input'];
  bindDn?: InputMaybe<Scalars['String']['input']>;
  bindPassword?: InputMaybe<Scalars['String']['input']>;
  emailAttribute: Scalars['String']['input'];
  host: Scalars['String']['input'];
  memberOfAttribute: Scalars['String']['input'];
  nameAttribute: Scalars['String']['input'];
  port: Scalars['Int']['input'];
  searchBaseDn: Scalars['String']['input'];
  searchFilter: Scalars['String']['input'];
  skipTlsVerify: Scalars['Boolean']['input'];
  startTls: Scalars['Boolean']['input'];
  useSsl: Scalars['Boolean']['input'];
  usernameAttribute: Scalars['String']['input'];
};

export type UpsertOAuthInput = {
  allowSignUp: Scalars['Boolean']['input'];
  allowedDomains?: InputMaybe<Scalars['String']['input']>;
  apiUrl?: InputMaybe<Scalars['String']['input']>;
  authUrl?: InputMaybe<Scalars['String']['input']>;
  clientId: Scalars['String']['input'];
  clientSecret?: InputMaybe<Scalars['String']['input']>;
  displayName: Scalars['String']['input'];
  emailClaim: Scalars['String']['input'];
  iconUrl?: InputMaybe<Scalars['String']['input']>;
  nameClaim: Scalars['String']['input'];
  scopes: Scalars['String']['input'];
  subClaim: Scalars['String']['input'];
  tokenUrl?: InputMaybe<Scalars['String']['input']>;
  type: Scalars['String']['input'];
  userinfoUrl?: InputMaybe<Scalars['String']['input']>;
};

export type UpsertSamlInput = {
  allowSignUp: Scalars['Boolean']['input'];
  emailAttribute: Scalars['String']['input'];
  groupsAttribute?: InputMaybe<Scalars['String']['input']>;
  idpMetadataUrl?: InputMaybe<Scalars['String']['input']>;
  idpMetadataXml?: InputMaybe<Scalars['String']['input']>;
  loginAttribute: Scalars['String']['input'];
  nameAttribute: Scalars['String']['input'];
  nameIdFormat: Scalars['String']['input'];
  signRequests: Scalars['Boolean']['input'];
  spEntityId: Scalars['String']['input'];
};

export type User = {
  avatarUrl?: Maybe<Scalars['String']['output']>;
  createdAt: Scalars['Time']['output'];
  disabled: Scalars['Boolean']['output'];
  email: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  lastSeenAt?: Maybe<Scalars['Time']['output']>;
  login: Scalars['String']['output'];
  name: Scalars['String']['output'];
  role: Scalars['String']['output'];
  updatedAt: Scalars['Time']['output'];
};

export type UserSavings = {
  avatarUrl?: Maybe<Scalars['String']['output']>;
  costSavedUsd: Scalars['Float']['output'];
  displayName: Scalars['String']['output'];
  serviceAccountId?: Maybe<Scalars['ID']['output']>;
  tokensSaved: Scalars['Int']['output'];
  totalCalls: Scalars['Int']['output'];
  totalDurationMs: Scalars['Int']['output'];
  userId?: Maybe<Scalars['ID']['output']>;
};

export type ChatSessionsQueryVariables = Exact<{
  orgId: Scalars['ID']['input'];
}>;


export type ChatSessionsQuery = { chatSessions: Array<{ id: string, orgId: string, ownerUserId: string, title: string, isPinned: boolean, messageCount: number, createdAt: string, updatedAt: string }> };

export type ChatSessionQueryVariables = Exact<{
  orgId: Scalars['ID']['input'];
  id: Scalars['ID']['input'];
}>;


export type ChatSessionQuery = { chatSession: { session: { id: string, orgId: string, ownerUserId: string, title: string, isPinned: boolean, messageCount: number, createdAt: string, updatedAt: string }, messages: Array<{ id: string, chatSessionId: string, role: string, content: string, parts?: unknown | null, createdAt: string }> } };

export type CreateChatSessionMutationVariables = Exact<{
  orgId: Scalars['ID']['input'];
  input: CreateChatSessionInput;
}>;


export type CreateChatSessionMutation = { createChatSession: { id: string, orgId: string, ownerUserId: string, title: string, isPinned: boolean, messageCount: number, createdAt: string, updatedAt: string } };

export type UpdateChatSessionMutationVariables = Exact<{
  orgId: Scalars['ID']['input'];
  id: Scalars['ID']['input'];
  input: UpdateChatSessionInput;
}>;


export type UpdateChatSessionMutation = { updateChatSession: { id: string, orgId: string, ownerUserId: string, title: string, isPinned: boolean, messageCount: number, createdAt: string, updatedAt: string } };

export type DeleteChatSessionMutationVariables = Exact<{
  orgId: Scalars['ID']['input'];
  id: Scalars['ID']['input'];
}>;


export type DeleteChatSessionMutation = { deleteChatSession: boolean };

export type CreateChatMessageMutationVariables = Exact<{
  orgId: Scalars['ID']['input'];
  sessionId: Scalars['ID']['input'];
  input: CreateChatMessageInput;
}>;


export type CreateChatMessageMutation = { createChatMessage: { id: string, chatSessionId: string, role: string, content: string, createdAt: string } };

export type CommentsQueryVariables = Exact<{
  orgId: Scalars['ID']['input'];
  resourceId: Scalars['ID']['input'];
}>;


export type CommentsQuery = { comments: Array<{ id: string, resourceId: string, parentCommentId?: string | null, text: string, createdBy: string, createdAt: string, createdByActor?: { id: string, name: string, avatarUrl?: string | null } | null }> };

export type CreateCommentMutationVariables = Exact<{
  orgId: Scalars['ID']['input'];
  input: CreateCommentInput;
}>;


export type CreateCommentMutation = { createComment: { id: string } };

export type UpdateCommentMutationVariables = Exact<{
  orgId: Scalars['ID']['input'];
  id: Scalars['ID']['input'];
  input: UpdateCommentInput;
}>;


export type UpdateCommentMutation = { updateComment: { id: string } };

export type DeleteCommentMutationVariables = Exact<{
  orgId: Scalars['ID']['input'];
  id: Scalars['ID']['input'];
}>;


export type DeleteCommentMutation = { deleteComment: boolean };

export type ComponentsQueryVariables = Exact<{
  orgId: Scalars['ID']['input'];
}>;


export type ComponentsQuery = { components: { components: Array<{ componentId: string, type: string, name: string, description: string, tags: Array<string>, category: string, slug: string, previewImageJpg: string, isActive: boolean, order: number, createdAt: string, updatedAt: string, componentFields: Array<{ componentFieldId: string, label: string, type: string, required: boolean, readonly?: boolean | null, options?: Array<string> | null, order: number }> }>, customComponents: Array<{ componentId: string, type: string, name: string, description: string, tags: Array<string>, category: string, slug: string, previewImageJpg: string, isActive: boolean, order: number, createdAt: string, updatedAt: string, componentFields: Array<{ componentFieldId: string, label: string, type: string, required: boolean, readonly?: boolean | null, options?: Array<string> | null, order: number }> }> } };

export type CreateCustomComponentMutationVariables = Exact<{
  orgId: Scalars['ID']['input'];
  input: CustomComponentInput;
}>;


export type CreateCustomComponentMutation = { createCustomComponent: { componentId: string } };

export type UpdateCustomComponentMutationVariables = Exact<{
  orgId: Scalars['ID']['input'];
  id: Scalars['ID']['input'];
  input: CustomComponentInput;
}>;


export type UpdateCustomComponentMutation = { updateCustomComponent: { componentId: string } };

export type DeleteCustomComponentMutationVariables = Exact<{
  orgId: Scalars['ID']['input'];
  id: Scalars['ID']['input'];
}>;


export type DeleteCustomComponentMutation = { deleteCustomComponent: boolean };

export type DiagramsQueryVariables = Exact<{
  orgId: Scalars['ID']['input'];
  folderId?: InputMaybe<Scalars['ID']['input']>;
  teamId?: InputMaybe<Scalars['ID']['input']>;
  serviceId?: InputMaybe<Scalars['ID']['input']>;
  search?: InputMaybe<Scalars['String']['input']>;
  sortBy?: InputMaybe<Scalars['String']['input']>;
  sortDir?: InputMaybe<Scalars['String']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
}>;


export type DiagramsQuery = { diagrams: { totalCount: number, items: Array<{ id: string, orgId: string, folderId?: string | null, teamId?: string | null, name: string, previewAssetId?: string | null, previewImageUrl?: string | null, previewContentHash?: string | null, previewStatus: string, createdBy: string, updatedBy?: string | null, createdByCommitHash?: string | null, updatedByCommitHash?: string | null, createdAt: string, updatedAt: string, createdByActor?: { id: string, type: string, name: string, email?: string | null, avatarUrl?: string | null } | null, updatedByActor?: { id: string, type: string, name: string, email?: string | null, avatarUrl?: string | null } | null }> } };

export type CreateDiagramMutationVariables = Exact<{
  orgId: Scalars['ID']['input'];
  input: CreateDiagramInput;
}>;


export type CreateDiagramMutation = { createDiagram: { id: string } };

export type UpdateDiagramMetaMutationVariables = Exact<{
  orgId: Scalars['ID']['input'];
  id: Scalars['ID']['input'];
  input: UpdateDiagramInput;
}>;


export type UpdateDiagramMetaMutation = { updateDiagram: { id: string } };

export type DeleteDiagramMutationVariables = Exact<{
  orgId: Scalars['ID']['input'];
  id: Scalars['ID']['input'];
}>;


export type DeleteDiagramMutation = { deleteDiagram: boolean };

export type FoldersQueryVariables = Exact<{
  orgId: Scalars['ID']['input'];
  type?: InputMaybe<Scalars['String']['input']>;
}>;


export type FoldersQuery = { folders: Array<{ id: string, orgId: string, parentId?: string | null, teamId?: string | null, type: string, name: string, order: number, createdAt: string, updatedAt: string }> };

export type FolderQueryVariables = Exact<{
  orgId: Scalars['ID']['input'];
  id: Scalars['ID']['input'];
}>;


export type FolderQuery = { folder: { id: string, orgId: string, parentId?: string | null, teamId?: string | null, type: string, name: string, order: number, createdAt: string, updatedAt: string } };

export type CreateFolderMutationVariables = Exact<{
  orgId: Scalars['ID']['input'];
  input: CreateFolderInput;
}>;


export type CreateFolderMutation = { createFolder: { id: string, orgId: string, parentId?: string | null, teamId?: string | null, type: string, name: string, order: number } };

export type UpdateFolderMutationVariables = Exact<{
  orgId: Scalars['ID']['input'];
  id: Scalars['ID']['input'];
  input: UpdateFolderInput;
}>;


export type UpdateFolderMutation = { updateFolder: { id: string, name: string, parentId?: string | null, teamId?: string | null, order: number } };

export type DeleteFolderMutationVariables = Exact<{
  orgId: Scalars['ID']['input'];
  id: Scalars['ID']['input'];
}>;


export type DeleteFolderMutation = { deleteFolder: boolean };

export type TeamsQueryVariables = Exact<{
  orgId: Scalars['ID']['input'];
}>;


export type TeamsQuery = { teams: Array<{ id: string, name: string }> };

export type DocsQueryVariables = Exact<{
  orgId: Scalars['ID']['input'];
  folderId?: InputMaybe<Scalars['ID']['input']>;
  teamId?: InputMaybe<Scalars['ID']['input']>;
  search?: InputMaybe<Scalars['String']['input']>;
  sortBy?: InputMaybe<Scalars['String']['input']>;
  sortDir?: InputMaybe<Scalars['String']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
}>;


export type DocsQuery = { docs: { totalCount: number, items: Array<{ id: string, orgId: string, folderId?: string | null, teamId?: string | null, fileAssetId: string, fileUrl?: string | null, fileName: string, fileType: string, description: string, contentHash: string, createdBy: string, updatedBy?: string | null, createdAt: string, updatedAt: string, createdByActor?: { id: string, type: string, name: string, email?: string | null, avatarUrl?: string | null } | null, updatedByActor?: { id: string, type: string, name: string, email?: string | null, avatarUrl?: string | null } | null }> } };

export type CreateDocMutationVariables = Exact<{
  orgId: Scalars['ID']['input'];
  input: CreateDocInput;
}>;


export type CreateDocMutation = { createDoc: { id: string, fileName: string } };

export type UpdateDocMutationVariables = Exact<{
  orgId: Scalars['ID']['input'];
  id: Scalars['ID']['input'];
  input: UpdateDocInput;
}>;


export type UpdateDocMutation = { updateDoc: { id: string, fileName: string } };

export type DeleteDocMutationVariables = Exact<{
  orgId: Scalars['ID']['input'];
  id: Scalars['ID']['input'];
}>;


export type DeleteDocMutation = { deleteDoc: boolean };

export type CostSavingsSummaryQueryVariables = Exact<{
  orgId: Scalars['ID']['input'];
  period?: InputMaybe<Scalars['String']['input']>;
  modelId?: InputMaybe<Scalars['String']['input']>;
}>;


export type CostSavingsSummaryQuery = { costSavingsSummary: { orgId: string, period: string, modelId?: string | null, totalCalls: number, totalTokensServed: number, totalTokensSaved: number, costServedUsd: number, costRawUsd: number, costSavedUsd: number, uniqueUsersCount: number, totalDurationMs: number, estAgentTimeMs: number, timeSavedMs: number } };

export type CostSavingsTimeseriesQueryVariables = Exact<{
  orgId: Scalars['ID']['input'];
  period?: InputMaybe<Scalars['String']['input']>;
  modelId?: InputMaybe<Scalars['String']['input']>;
}>;


export type CostSavingsTimeseriesQuery = { costSavingsTimeseries: Array<{ date: string, totalCalls: number, totalTokensServed: number, totalTokensSaved: number, costServedUsd: number, costRawUsd: number, costSavedUsd: number, totalDurationMs: number, estAgentTimeMs: number, timeSavedMs: number }> };

export type CostSavingsByToolQueryVariables = Exact<{
  orgId: Scalars['ID']['input'];
  period?: InputMaybe<Scalars['String']['input']>;
  modelId?: InputMaybe<Scalars['String']['input']>;
}>;


export type CostSavingsByToolQuery = { costSavingsByTool: Array<{ toolName: string, totalCalls: number, tokensSaved: number, costSavedUsd: number, totalDurationMs: number }> };

export type CostSavingsByClientQueryVariables = Exact<{
  orgId: Scalars['ID']['input'];
  period?: InputMaybe<Scalars['String']['input']>;
  modelId?: InputMaybe<Scalars['String']['input']>;
}>;


export type CostSavingsByClientQuery = { costSavingsByClient: Array<{ clientName: string, totalCalls: number, tokensSaved: number, costSavedUsd: number, totalDurationMs: number }> };

export type CostSavingsByModelQueryVariables = Exact<{
  orgId: Scalars['ID']['input'];
  period?: InputMaybe<Scalars['String']['input']>;
}>;


export type CostSavingsByModelQuery = { costSavingsByModel: Array<{ modelId: string, displayName: string, provider: string, totalCalls: number, tokensSaved: number, costRawUsd: number, costSavedUsd: number }> };

export type CostSavingsByUserQueryVariables = Exact<{
  orgId: Scalars['ID']['input'];
  period?: InputMaybe<Scalars['String']['input']>;
  modelId?: InputMaybe<Scalars['String']['input']>;
}>;


export type CostSavingsByUserQuery = { costSavingsByUser: Array<{ userId?: string | null, serviceAccountId?: string | null, displayName: string, avatarUrl?: string | null, totalCalls: number, tokensSaved: number, costSavedUsd: number, totalDurationMs: number }> };

export type CanvasQueryVariables = Exact<{
  orgId: Scalars['ID']['input'];
  mapId: Scalars['ID']['input'];
}>;


export type CanvasQuery = { canvas: { mapId: string, orgId: string, zoom: number, navigationX: number, navigationY: number, framePositions: string, updatedAt: string } };

export type UpsertCanvasMutationVariables = Exact<{
  orgId: Scalars['ID']['input'];
  mapId: Scalars['ID']['input'];
  input: UpsertCanvasInput;
}>;


export type UpsertCanvasMutation = { upsertCanvas: { mapId: string, orgId: string, zoom: number, navigationX: number, navigationY: number, framePositions: string, updatedAt: string } };

export type FocalPointsQueryVariables = Exact<{
  orgId: Scalars['ID']['input'];
  mapId: Scalars['ID']['input'];
  frameId: Scalars['ID']['input'];
}>;


export type FocalPointsQuery = { focalPoints: Array<{ id: string, frameId: string, orgId: string, name: string, locationX: number, locationY: number, visibility: string, isActive: boolean, createdBy: string, updatedBy?: string | null, createdAt: string, updatedAt: string }> };

export type CreateFocalPointMutationVariables = Exact<{
  orgId: Scalars['ID']['input'];
  mapId: Scalars['ID']['input'];
  frameId: Scalars['ID']['input'];
  input: CreateFocalPointInput;
}>;


export type CreateFocalPointMutation = { createFocalPoint: { id: string } };

export type UpdateFocalPointMutationVariables = Exact<{
  orgId: Scalars['ID']['input'];
  mapId: Scalars['ID']['input'];
  frameId: Scalars['ID']['input'];
  id: Scalars['ID']['input'];
  input: UpdateFocalPointInput;
}>;


export type UpdateFocalPointMutation = { updateFocalPoint: { id: string } };

export type DeleteFocalPointMutationVariables = Exact<{
  orgId: Scalars['ID']['input'];
  mapId: Scalars['ID']['input'];
  frameId: Scalars['ID']['input'];
  id: Scalars['ID']['input'];
}>;


export type DeleteFocalPointMutation = { deleteFocalPoint: boolean };

export type FrameGroupsQueryVariables = Exact<{
  orgId: Scalars['ID']['input'];
  mapId: Scalars['ID']['input'];
  frameId: Scalars['ID']['input'];
}>;


export type FrameGroupsQuery = { frameGroups: Array<{ id: string, frameId: string, orgId: string, name: string, description: string, locationX: number, locationY: number, width: number, height: number, order: number, isActive: boolean, createdAt: string, updatedAt: string }> };

export type CreateFrameGroupMutationVariables = Exact<{
  orgId: Scalars['ID']['input'];
  mapId: Scalars['ID']['input'];
  frameId: Scalars['ID']['input'];
  input: CreateFrameGroupInput;
}>;


export type CreateFrameGroupMutation = { createFrameGroup: { id: string } };

export type UpdateFrameGroupMutationVariables = Exact<{
  orgId: Scalars['ID']['input'];
  mapId: Scalars['ID']['input'];
  frameId: Scalars['ID']['input'];
  id: Scalars['ID']['input'];
  input: UpdateFrameGroupInput;
}>;


export type UpdateFrameGroupMutation = { updateFrameGroup: { id: string } };

export type DeleteFrameGroupMutationVariables = Exact<{
  orgId: Scalars['ID']['input'];
  mapId: Scalars['ID']['input'];
  frameId: Scalars['ID']['input'];
  id: Scalars['ID']['input'];
}>;


export type DeleteFrameGroupMutation = { deleteFrameGroup: boolean };

export type FrameLinksQueryVariables = Exact<{
  orgId: Scalars['ID']['input'];
  mapId: Scalars['ID']['input'];
  frameId: Scalars['ID']['input'];
}>;


export type FrameLinksQuery = { frameLinks: Array<{ id: string, frameId: string, orgId: string, kind: string, targetFrameId?: string | null, targetMapId?: string | null, label: string, locationX: number, locationY: number, isActive: boolean, createdAt: string, updatedAt: string }> };

export type CreateFrameLinkMutationVariables = Exact<{
  orgId: Scalars['ID']['input'];
  mapId: Scalars['ID']['input'];
  frameId: Scalars['ID']['input'];
  input: CreateFrameLinkInput;
}>;


export type CreateFrameLinkMutation = { createFrameLink: { id: string } };

export type UpdateFrameLinkMutationVariables = Exact<{
  orgId: Scalars['ID']['input'];
  mapId: Scalars['ID']['input'];
  frameId: Scalars['ID']['input'];
  id: Scalars['ID']['input'];
  input: UpdateFrameLinkInput;
}>;


export type UpdateFrameLinkMutation = { updateFrameLink: { id: string } };

export type DeleteFrameLinkMutationVariables = Exact<{
  orgId: Scalars['ID']['input'];
  mapId: Scalars['ID']['input'];
  frameId: Scalars['ID']['input'];
  id: Scalars['ID']['input'];
}>;


export type DeleteFrameLinkMutation = { deleteFrameLink: boolean };

export type FramesQueryVariables = Exact<{
  orgId: Scalars['ID']['input'];
  mapId: Scalars['ID']['input'];
  search?: InputMaybe<Scalars['String']['input']>;
  sortBy?: InputMaybe<Scalars['String']['input']>;
  sortDir?: InputMaybe<Scalars['String']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
}>;


export type FramesQuery = { frames: { totalCount: number, items: Array<{ id: string, mapId: string, orgId: string, parentFrameId?: string | null, name: string, description: string, templateType: string, screenshotAssetId?: string | null, screenshotImageUrl?: string | null, screenshotContentHash?: string | null, status: string, order: number, source?: string | null, focalPointCount: number, createdBy: string, updatedBy?: string | null, createdByCommitHash?: string | null, updatedByCommitHash?: string | null, createdAt: string, updatedAt: string, createdByActor?: { id: string, name: string, avatarUrl?: string | null, type: string, email?: string | null } | null, updatedByActor?: { id: string, name: string, avatarUrl?: string | null, type: string, email?: string | null } | null }> } };

export type FrameQueryVariables = Exact<{
  orgId: Scalars['ID']['input'];
  mapId: Scalars['ID']['input'];
  id: Scalars['ID']['input'];
}>;


export type FrameQuery = { frame: { id: string, mapId: string, orgId: string, parentFrameId?: string | null, name: string, description: string, templateType: string, screenshotAssetId?: string | null, screenshotImageUrl?: string | null, screenshotContentHash?: string | null, status: string, order: number, source?: string | null, focalPointCount: number, createdBy: string, updatedBy?: string | null, createdByCommitHash?: string | null, updatedByCommitHash?: string | null, createdAt: string, updatedAt: string, createdByActor?: { id: string, name: string, avatarUrl?: string | null, type: string, email?: string | null } | null, updatedByActor?: { id: string, name: string, avatarUrl?: string | null, type: string, email?: string | null } | null } };

export type FrameByIdQueryVariables = Exact<{
  orgId: Scalars['ID']['input'];
  id: Scalars['ID']['input'];
}>;


export type FrameByIdQuery = { frameById: { id: string, mapId: string, orgId: string, parentFrameId?: string | null, name: string, description: string, templateType: string, screenshotAssetId?: string | null, screenshotImageUrl?: string | null, screenshotContentHash?: string | null, status: string, order: number, source?: string | null, focalPointCount: number, createdBy: string, updatedBy?: string | null, createdByCommitHash?: string | null, updatedByCommitHash?: string | null, createdAt: string, updatedAt: string, createdByActor?: { id: string, name: string, avatarUrl?: string | null, type: string, email?: string | null } | null, updatedByActor?: { id: string, name: string, avatarUrl?: string | null, type: string, email?: string | null } | null } };

export type CreateFrameMutationVariables = Exact<{
  orgId: Scalars['ID']['input'];
  mapId: Scalars['ID']['input'];
  input: CreateFrameInput;
}>;


export type CreateFrameMutation = { createFrame: { id: string } };

export type UpdateFrameMutationVariables = Exact<{
  orgId: Scalars['ID']['input'];
  mapId: Scalars['ID']['input'];
  id: Scalars['ID']['input'];
  input: UpdateFrameInput;
}>;


export type UpdateFrameMutation = { updateFrame: { id: string } };

export type DeleteFrameMutationVariables = Exact<{
  orgId: Scalars['ID']['input'];
  mapId: Scalars['ID']['input'];
  id: Scalars['ID']['input'];
}>;


export type DeleteFrameMutation = { deleteFrame: boolean };

export type MapsQueryVariables = Exact<{
  orgId: Scalars['ID']['input'];
  folderId?: InputMaybe<Scalars['ID']['input']>;
  teamId?: InputMaybe<Scalars['ID']['input']>;
  search?: InputMaybe<Scalars['String']['input']>;
  sortBy?: InputMaybe<Scalars['String']['input']>;
  sortDir?: InputMaybe<Scalars['String']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
}>;


export type MapsQuery = { maps: { totalCount: number, items: Array<{ id: string, orgId: string, folderId?: string | null, teamId?: string | null, name: string, description: string, status: string, createdBy: string, updatedBy?: string | null, createdAt: string, updatedAt: string, previewImgUrls: Array<string> }> } };

export type MapQueryVariables = Exact<{
  orgId: Scalars['ID']['input'];
  id: Scalars['ID']['input'];
}>;


export type MapQuery = { map: { id: string, orgId: string, folderId?: string | null, teamId?: string | null, name: string, description: string, status: string, createdBy: string, updatedBy?: string | null, createdAt: string, updatedAt: string } };

export type CreateMapMutationVariables = Exact<{
  orgId: Scalars['ID']['input'];
  input: CreateMapInput;
}>;


export type CreateMapMutation = { createMap: { id: string } };

export type UpdateMapMutationVariables = Exact<{
  orgId: Scalars['ID']['input'];
  id: Scalars['ID']['input'];
  input: UpdateMapInput;
}>;


export type UpdateMapMutation = { updateMap: { id: string } };

export type DeleteMapMutationVariables = Exact<{
  orgId: Scalars['ID']['input'];
  id: Scalars['ID']['input'];
}>;


export type DeleteMapMutation = { deleteMap: boolean };

export type MeQueryVariables = Exact<{ [key: string]: never; }>;


export type MeQuery = { me: { userId: string, name: string, avatarUrl?: string | null } };

export type MembersQueryVariables = Exact<{
  orgId: Scalars['ID']['input'];
}>;


export type MembersQuery = { members: Array<{ userId: string, email: string, name: string, avatarUrl?: string | null, role: string, teamId?: string | null }> };

export type AddMemberMutationVariables = Exact<{
  orgId: Scalars['ID']['input'];
  input: AddMemberInput;
}>;


export type AddMemberMutation = { addMember: { userId: string } };

export type UpdateMemberMutationVariables = Exact<{
  orgId: Scalars['ID']['input'];
  userId: Scalars['ID']['input'];
  input: UpdateMemberInput;
}>;


export type UpdateMemberMutation = { updateMember: { userId: string } };

export type RemoveMemberMutationVariables = Exact<{
  orgId: Scalars['ID']['input'];
  userId: Scalars['ID']['input'];
}>;


export type RemoveMemberMutation = { removeMember: boolean };

export type SettingsTeamsQueryVariables = Exact<{
  orgId: Scalars['ID']['input'];
}>;


export type SettingsTeamsQuery = { teams: Array<{ id: string, name: string, email?: string | null, memberCount: number }> };

export type CreateTeamMutationVariables = Exact<{
  orgId: Scalars['ID']['input'];
  input: CreateTeamInput;
}>;


export type CreateTeamMutation = { createTeam: { id: string } };

export type UpdateTeamMutationVariables = Exact<{
  orgId: Scalars['ID']['input'];
  teamId: Scalars['ID']['input'];
  input: UpdateTeamInput;
}>;


export type UpdateTeamMutation = { updateTeam: { id: string } };

export type DeleteTeamMutationVariables = Exact<{
  orgId: Scalars['ID']['input'];
  teamId: Scalars['ID']['input'];
}>;


export type DeleteTeamMutation = { deleteTeam: boolean };

export type UpdateUserMutationVariables = Exact<{
  id: Scalars['ID']['input'];
  input: UpdateUserInput;
}>;


export type UpdateUserMutation = { updateUser: { id: string, name: string } };

export type PrepareUserAvatarUploadMutationVariables = Exact<{ [key: string]: never; }>;


export type PrepareUserAvatarUploadMutation = { prepareUserAvatarUpload: { assetId: string, uploadUrl: string } };

export type SetMyAvatarMutationVariables = Exact<{ [key: string]: never; }>;


export type SetMyAvatarMutation = { setMyAvatar: boolean };

export type ServiceAccountsQueryVariables = Exact<{
  orgId: Scalars['ID']['input'];
}>;


export type ServiceAccountsQuery = { serviceAccounts: Array<{ id: string, orgId: string, name: string, description: string, scopes: Array<string>, disabled: boolean, isInternal: boolean, createdAt: string, updatedAt: string }> };

export type ServiceAccountScopesQueryVariables = Exact<{
  orgId: Scalars['ID']['input'];
}>;


export type ServiceAccountScopesQuery = { serviceAccountScopes: Array<string> };

export type ServiceAccountTokensQueryVariables = Exact<{
  orgId: Scalars['ID']['input'];
  saId: Scalars['ID']['input'];
}>;


export type ServiceAccountTokensQuery = { serviceAccountTokens: Array<{ id: string, serviceAccountId: string, name: string, prefix: string, expiresAt?: string | null, lastUsedAt?: string | null, revoked: boolean, createdAt: string }> };

export type CreateServiceAccountMutationVariables = Exact<{
  orgId: Scalars['ID']['input'];
  input: CreateServiceAccountInput;
}>;


export type CreateServiceAccountMutation = { createServiceAccount: { id: string } };

export type UpdateServiceAccountMutationVariables = Exact<{
  orgId: Scalars['ID']['input'];
  id: Scalars['ID']['input'];
  input: UpdateServiceAccountInput;
}>;


export type UpdateServiceAccountMutation = { updateServiceAccount: { id: string } };

export type DeleteServiceAccountMutationVariables = Exact<{
  orgId: Scalars['ID']['input'];
  id: Scalars['ID']['input'];
}>;


export type DeleteServiceAccountMutation = { deleteServiceAccount: boolean };

export type CreateServiceAccountTokenMutationVariables = Exact<{
  orgId: Scalars['ID']['input'];
  saId: Scalars['ID']['input'];
  input: CreateTokenInput;
}>;


export type CreateServiceAccountTokenMutation = { createServiceAccountToken: { id: string, name: string, token: string } };

export type RevokeServiceAccountTokenMutationVariables = Exact<{
  orgId: Scalars['ID']['input'];
  saId: Scalars['ID']['input'];
  tokenId: Scalars['ID']['input'];
}>;


export type RevokeServiceAccountTokenMutation = { revokeServiceAccountToken: boolean };

export type PrepareServiceAccountAvatarUploadMutationVariables = Exact<{
  orgId: Scalars['ID']['input'];
  saId: Scalars['ID']['input'];
}>;


export type PrepareServiceAccountAvatarUploadMutation = { prepareServiceAccountAvatarUpload: { assetId: string, uploadUrl: string } };

export type SetServiceAccountAvatarMutationVariables = Exact<{
  orgId: Scalars['ID']['input'];
  saId: Scalars['ID']['input'];
}>;


export type SetServiceAccountAvatarMutation = { setServiceAccountAvatar: boolean };

export type DiagramQueryVariables = Exact<{
  orgId: Scalars['ID']['input'];
  id: Scalars['ID']['input'];
}>;


export type DiagramQuery = { diagram: { id: string, orgId: string, folderId?: string | null, teamId?: string | null, name: string, previewAssetId?: string | null, previewImageUrl?: string | null, previewContentHash?: string | null, createdAt: string, updatedAt: string } };

export type DiagramContentQueryVariables = Exact<{
  orgId: Scalars['ID']['input'];
  id: Scalars['ID']['input'];
}>;


export type DiagramContentQuery = { diagramContent: { diagramId: string, content: string } };

export type UpdateDiagramMutationVariables = Exact<{
  orgId: Scalars['ID']['input'];
  id: Scalars['ID']['input'];
  input: UpdateDiagramInput;
}>;


export type UpdateDiagramMutation = { updateDiagram: { id: string, updatedAt: string } };

export type FlowDiagramComponentsQueryVariables = Exact<{
  orgId: Scalars['ID']['input'];
}>;


export type FlowDiagramComponentsQuery = { flowDiagramComponents: { components: Array<{ componentId: string, type: string, name: string, description: string, category: string, tags: Array<string>, slug: string, previewImageJpg: string, isActive: boolean, order: number, flowDiagramComponentFields: Array<{ flowDiagramComponentFieldId: string, label: string, type: string, required: boolean, readonly?: boolean | null, options?: Array<string> | null, order: number }> }>, customComponents: Array<{ componentId: string, type: string, name: string, description: string, category: string, tags: Array<string>, slug: string, previewImageJpg: string, isActive: boolean, order: number, organizationId?: string | null, flowDiagramComponentFields: Array<{ flowDiagramComponentFieldId: string, label: string, type: string, required: boolean, readonly?: boolean | null, options?: Array<string> | null, order: number }> }> } };

export type DiagramImagesQueryVariables = Exact<{
  orgId: Scalars['ID']['input'];
  diagramId: Scalars['ID']['input'];
}>;


export type DiagramImagesQuery = { diagramImages: Array<{ diagramImageId: string, diagramId: string, assetId: string, imageUrl?: string | null, fileName?: string | null, order: number, createdAt: string }> };

export type CreateDiagramImageMutationVariables = Exact<{
  orgId: Scalars['ID']['input'];
  diagramId: Scalars['ID']['input'];
  input: CreateDiagramImageInput;
}>;


export type CreateDiagramImageMutation = { createDiagramImage: { diagramImageId: string, assetId: string, imageUrl?: string | null, fileName?: string | null, order: number } };

export type PrepareDiagramThumbnailUploadMutationVariables = Exact<{
  orgId: Scalars['ID']['input'];
  diagramId: Scalars['ID']['input'];
}>;


export type PrepareDiagramThumbnailUploadMutation = { prepareDiagramThumbnailUpload: { uploadUrl: string, assetId: string } };

export type ConfirmDiagramThumbnailUploadMutationVariables = Exact<{
  orgId: Scalars['ID']['input'];
  diagramId: Scalars['ID']['input'];
  contentHash: Scalars['String']['input'];
}>;


export type ConfirmDiagramThumbnailUploadMutation = { confirmDiagramThumbnailUpload: boolean };

export type DiagramVersionsQueryVariables = Exact<{
  orgId: Scalars['ID']['input'];
  diagramId: Scalars['ID']['input'];
}>;


export type DiagramVersionsQuery = { diagramVersions: Array<{ id: string, diagramId: string, versionNumber: number, label?: string | null, isAutoVersion: boolean, createdBy: string, createdAt: string, createdByActor?: { id: string, name: string, avatarUrl?: string | null } | null }> };

export type DiagramVersionContentQueryVariables = Exact<{
  orgId: Scalars['ID']['input'];
  diagramId: Scalars['ID']['input'];
  versionId: Scalars['ID']['input'];
}>;


export type DiagramVersionContentQuery = { diagramVersionContent: { diagramId: string, content: string } };

export type CreateDiagramVersionMutationVariables = Exact<{
  orgId: Scalars['ID']['input'];
  diagramId: Scalars['ID']['input'];
  label?: InputMaybe<Scalars['String']['input']>;
}>;


export type CreateDiagramVersionMutation = { createDiagramVersion: { id: string, versionNumber: number } };

export type RestoreDiagramVersionMutationVariables = Exact<{
  orgId: Scalars['ID']['input'];
  diagramId: Scalars['ID']['input'];
  versionId: Scalars['ID']['input'];
}>;


export type RestoreDiagramVersionMutation = { restoreDiagramVersion: { id: string } };

export type ApiEndpointByIdQueryVariables = Exact<{
  orgId: Scalars['ID']['input'];
  id: Scalars['ID']['input'];
}>;


export type ApiEndpointByIdQuery = { apiEndpointById: { id: string, serviceId: string, apiGroupId: string, method: string, path: string, summary: string, description: string, tags: Array<string>, parameters: string, requestBody: string, responses: string, exampleRequests: string, exampleResponses: string, updatedAt: string, createdAt: string } };

export type TestPackByIdQueryVariables = Exact<{
  orgId: Scalars['ID']['input'];
  id: Scalars['ID']['input'];
}>;


export type TestPackByIdQuery = { testPackById: { testPackId: string, serviceId: string, name: string, type: string, updatedAt: string } };

export type ServiceDocByIdQueryVariables = Exact<{
  orgId: Scalars['ID']['input'];
  id: Scalars['ID']['input'];
}>;


export type ServiceDocByIdQuery = { serviceDocById: { serviceId: string, docId: string } };

export type DocByIdQueryVariables = Exact<{
  orgId: Scalars['ID']['input'];
  id: Scalars['ID']['input'];
}>;


export type DocByIdQuery = { doc: { id: string, fileUrl?: string | null, fileName: string, fileType: string } };

export type FocalPointMetaQueryVariables = Exact<{
  orgId: Scalars['ID']['input'];
  mapId: Scalars['ID']['input'];
  frameId: Scalars['ID']['input'];
  focalPointId: Scalars['ID']['input'];
}>;


export type FocalPointMetaQuery = { focalPointMeta: Array<{ id: string, focalPointId: string, orgId: string, frameId: string, componentId: string, componentLinkDiagramId?: string | null, componentLinkApiEndpointId?: string | null, componentLinkTestPackId?: string | null, componentLinkServiceDocId?: string | null, createdBy: string, createdAt: string, updatedAt: string, componentModalFields: Array<{ componentFieldId?: string | null, label?: string | null, type?: string | null, required?: boolean | null, isReadonly?: boolean | null, data?: Array<unknown | null> | null, options?: Array<string | null> | null, order?: number | null }> }> };

export type FocalPointMetaByLinkQueryVariables = Exact<{
  orgId: Scalars['ID']['input'];
  linkId: Scalars['ID']['input'];
}>;


export type FocalPointMetaByLinkQuery = { focalPointMetaByLink: Array<{ id: string, focalPointId: string, orgId: string, frameId: string, componentId: string, componentLinkDiagramId?: string | null, componentLinkApiEndpointId?: string | null, componentLinkTestPackId?: string | null, componentLinkServiceDocId?: string | null, createdBy: string, createdAt: string, updatedAt: string, componentModalFields: Array<{ componentFieldId?: string | null, label?: string | null, type?: string | null, required?: boolean | null, isReadonly?: boolean | null, data?: Array<unknown | null> | null, options?: Array<string | null> | null, order?: number | null }> }> };

export type ComponentLinkUsagesQueryVariables = Exact<{
  orgId: Scalars['ID']['input'];
  linkId: Scalars['ID']['input'];
}>;


export type ComponentLinkUsagesQuery = { componentLinkUsages: Array<{ metaId: string, orgId: string, componentId: string, mapId: string, mapName: string, frameId: string, frameName: string, screenshotImageUrl?: string | null, focalPointId: string, focalPointName: string, locationX: number, locationY: number }> };

export type CreateFocalPointMetaMutationVariables = Exact<{
  orgId: Scalars['ID']['input'];
  mapId: Scalars['ID']['input'];
  frameId: Scalars['ID']['input'];
  focalPointId: Scalars['ID']['input'];
  input: CreateFocalPointMetaInput;
}>;


export type CreateFocalPointMetaMutation = { createFocalPointMeta: { id: string } };

export type UpdateFocalPointMetaMutationVariables = Exact<{
  orgId: Scalars['ID']['input'];
  mapId: Scalars['ID']['input'];
  frameId: Scalars['ID']['input'];
  focalPointId: Scalars['ID']['input'];
  id: Scalars['ID']['input'];
  input: UpdateFocalPointMetaInput;
}>;


export type UpdateFocalPointMetaMutation = { updateFocalPointMeta: { id: string } };

export type DeleteFocalPointMetaMutationVariables = Exact<{
  orgId: Scalars['ID']['input'];
  mapId: Scalars['ID']['input'];
  frameId: Scalars['ID']['input'];
  focalPointId: Scalars['ID']['input'];
  id: Scalars['ID']['input'];
}>;


export type DeleteFocalPointMetaMutation = { deleteFocalPointMeta: boolean };

export type MlStudioProjectsQueryVariables = Exact<{
  orgId: Scalars['ID']['input'];
}>;


export type MlStudioProjectsQuery = { mlProjects: Array<{ id: string, name: string, type: string, description: string, sourceType: string, sourceUrl: string, teamId?: string | null, stats?: { modelCount: number, experimentCount: number, runCount: number } | null }> };

export type MlStudioProjectQueryVariables = Exact<{
  orgId: Scalars['ID']['input'];
  id: Scalars['ID']['input'];
}>;


export type MlStudioProjectQuery = { mlProject: { id: string, name: string, type: string, description: string, sourceType: string, sourceUrl: string, teamId?: string | null } };

export type MlStudioModelQueryVariables = Exact<{
  orgId: Scalars['ID']['input'];
  id: Scalars['ID']['input'];
}>;


export type MlStudioModelQuery = { mlModel: { id: string, projectId?: string | null, name: string, description: string, domain: string, problemType: string, tags: Array<string>, owners: string, license: string, references: Array<string>, intendedUse: string, limitations: string, ethicalConsiderations: string, caveats: string, productionVersionId?: string | null, createdAt?: string | null, updatedAt?: string | null } };

export type MlStudioModelsQueryVariables = Exact<{
  orgId: Scalars['ID']['input'];
  projectId?: InputMaybe<Scalars['ID']['input']>;
}>;


export type MlStudioModelsQuery = { mlModels: Array<{ id: string, projectId?: string | null, name: string, description: string, domain: string, problemType: string, tags: Array<string>, owners: string, license: string, references: Array<string>, intendedUse: string, limitations: string, ethicalConsiderations: string, caveats: string, productionVersionId?: string | null, createdAt?: string | null, updatedAt?: string | null }> };

export type MlStudioVersionsQueryVariables = Exact<{
  orgId: Scalars['ID']['input'];
}>;


export type MlStudioVersionsQuery = { mlModelVersions: Array<{ id: string, modelId: string, version: string, description: string, deploymentStatus: string, runId?: string | null, createdAt?: string | null }> };

export type MlStudioModelVersionsQueryVariables = Exact<{
  orgId: Scalars['ID']['input'];
  modelId?: InputMaybe<Scalars['ID']['input']>;
  projectId?: InputMaybe<Scalars['ID']['input']>;
}>;


export type MlStudioModelVersionsQuery = { mlModelVersions: Array<{ id: string, modelId: string, version: string, description: string, deploymentStatus: string, runId?: string | null, createdAt?: string | null }> };

export type MlStudioModelVersionQueryVariables = Exact<{
  orgId: Scalars['ID']['input'];
  id: Scalars['ID']['input'];
}>;


export type MlStudioModelVersionQuery = { mlModelVersion: { id: string, modelId: string, version: string, description: string, deploymentStatus: string, runId?: string | null, createdAt?: string | null } };

export type MlVersionDeploymentUpdatesQueryVariables = Exact<{
  orgId: Scalars['ID']['input'];
  versionId: Scalars['ID']['input'];
}>;


export type MlVersionDeploymentUpdatesQuery = { mlVersionDeploymentUpdates: Array<{ id: string, versionId: string, fromStatus?: string | null, toStatus: string, changedBy: string, changedAt?: string | null }> };

export type MlStudioDeploymentUpdatesQueryVariables = Exact<{
  orgId: Scalars['ID']['input'];
  projectId?: InputMaybe<Scalars['ID']['input']>;
}>;


export type MlStudioDeploymentUpdatesQuery = { mlVersionDeploymentUpdates: Array<{ id: string, versionId: string, fromStatus?: string | null, toStatus: string, changedBy: string, changedAt?: string | null }> };

export type MlStudioExperimentQueryVariables = Exact<{
  orgId: Scalars['ID']['input'];
  id: Scalars['ID']['input'];
}>;


export type MlStudioExperimentQuery = { mlExperiment: { id: string, projectId?: string | null, name: string, description: string, status: string, startedAt?: string | null } };

export type MlStudioExperimentsQueryVariables = Exact<{
  orgId: Scalars['ID']['input'];
  projectId?: InputMaybe<Scalars['ID']['input']>;
}>;


export type MlStudioExperimentsQuery = { mlExperiments: Array<{ id: string, projectId?: string | null, name: string, description: string, status: string, startedAt?: string | null }> };

export type MlStudioRunQueryVariables = Exact<{
  orgId: Scalars['ID']['input'];
  id: Scalars['ID']['input'];
}>;


export type MlStudioRunQuery = { mlRun: { id: string, experimentId: string, name: string, status: string, startedAt?: string | null, endedAt?: string | null, duration: string, notes: string, parameters: unknown, metrics: unknown, datasetId?: string | null, series: unknown, updatedAt?: string | null, syncedAt?: string | null } };

export type MlStudioExperimentRunsQueryVariables = Exact<{
  orgId: Scalars['ID']['input'];
  experimentId?: InputMaybe<Scalars['ID']['input']>;
  projectId?: InputMaybe<Scalars['ID']['input']>;
}>;


export type MlStudioExperimentRunsQuery = { mlRuns: Array<{ id: string, experimentId: string, name: string, status: string, startedAt?: string | null, endedAt?: string | null, duration: string, notes: string, parameters: unknown, metrics: unknown, datasetId?: string | null, series: unknown, updatedAt?: string | null, syncedAt?: string | null }> };

export type MlStudioRunsQueryVariables = Exact<{
  orgId: Scalars['ID']['input'];
}>;


export type MlStudioRunsQuery = { mlRuns: Array<{ id: string, experimentId: string, name: string, status: string, startedAt?: string | null, endedAt?: string | null, duration: string, notes: string, parameters: unknown, metrics: unknown, datasetId?: string | null, series: unknown, updatedAt?: string | null, syncedAt?: string | null }> };

export type MlStudioArtifactsQueryVariables = Exact<{
  orgId: Scalars['ID']['input'];
}>;


export type MlStudioArtifactsQuery = { mlArtifacts: Array<{ id: string, runId: string, name: string, type: string, uri: string, size: string, format: string, updatedAt?: string | null, syncedAt?: string | null }> };

export type MlStudioRunArtifactsQueryVariables = Exact<{
  orgId: Scalars['ID']['input'];
  runId?: InputMaybe<Scalars['ID']['input']>;
}>;


export type MlStudioRunArtifactsQuery = { mlArtifacts: Array<{ id: string, runId: string, name: string, type: string, uri: string, size: string, format: string, updatedAt?: string | null, syncedAt?: string | null }> };

export type MlStudioDatasetQueryVariables = Exact<{
  orgId: Scalars['ID']['input'];
  id: Scalars['ID']['input'];
}>;


export type MlStudioDatasetQuery = { mlDataset: { id: string, experimentId: string, name: string, digest: string, source: string, sourceType: string, context: string, rowCount: number, schema: Array<{ name: string, type: string, description: string }> } };

export type MlStudioDatasetsQueryVariables = Exact<{
  orgId: Scalars['ID']['input'];
  experimentId?: InputMaybe<Scalars['ID']['input']>;
}>;


export type MlStudioDatasetsQuery = { mlDatasets: Array<{ id: string, experimentId: string, name: string, digest: string, source: string, sourceType: string, context: string, rowCount: number, schema: Array<{ name: string, type: string, description: string }> }> };

export type MlStudioDeploymentsQueryVariables = Exact<{
  orgId: Scalars['ID']['input'];
}>;


export type MlStudioDeploymentsQuery = { mlDeployments: Array<{ id: string, modelId: string, versionId: string, name: string, environment: string, status: string, endpoint: string, region: string, deployedAt?: string | null, rolledBackAt?: string | null }> };

export type MlStudioFindingsQueryVariables = Exact<{
  orgId: Scalars['ID']['input'];
  projectId?: InputMaybe<Scalars['ID']['input']>;
}>;


export type MlStudioFindingsQuery = { mlFindings: Array<{ id: string, modelId: string, versionId?: string | null, title: string, summary: string, description: string, runIds: Array<string> }> };

export type UpdateMlModelMutationVariables = Exact<{
  orgId: Scalars['ID']['input'];
  id: Scalars['ID']['input'];
  domain?: InputMaybe<Scalars['String']['input']>;
  problemType?: InputMaybe<Scalars['String']['input']>;
  owners?: InputMaybe<Scalars['String']['input']>;
  license?: InputMaybe<Scalars['String']['input']>;
  references?: InputMaybe<Array<Scalars['String']['input']> | Scalars['String']['input']>;
  intendedUse?: InputMaybe<Scalars['String']['input']>;
  limitations?: InputMaybe<Scalars['String']['input']>;
  ethicalConsiderations?: InputMaybe<Scalars['String']['input']>;
  caveats?: InputMaybe<Scalars['String']['input']>;
}>;


export type UpdateMlModelMutation = { updateMlModel: { id: string, domain: string, problemType: string, owners: string, license: string, references: Array<string>, intendedUse: string, limitations: string, ethicalConsiderations: string, caveats: string } };

export type CreateMlDeploymentMutationVariables = Exact<{
  orgId: Scalars['ID']['input'];
  input: CreateMlDeploymentInput;
}>;


export type CreateMlDeploymentMutation = { createMlDeployment: { id: string } };

export type UpdateMlDeploymentMutationVariables = Exact<{
  orgId: Scalars['ID']['input'];
  id: Scalars['ID']['input'];
  input: UpdateMlDeploymentInput;
}>;


export type UpdateMlDeploymentMutation = { updateMlDeployment: { id: string } };

export type DeleteMlDeploymentMutationVariables = Exact<{
  orgId: Scalars['ID']['input'];
  id: Scalars['ID']['input'];
}>;


export type DeleteMlDeploymentMutation = { deleteMlDeployment: boolean };

export type CreateMlVersionDeploymentUpdateMutationVariables = Exact<{
  orgId: Scalars['ID']['input'];
  versionId: Scalars['ID']['input'];
  toStatus: Scalars['String']['input'];
}>;


export type CreateMlVersionDeploymentUpdateMutation = { createMlVersionDeploymentUpdate: { id: string, versionId: string, fromStatus?: string | null, toStatus: string, changedBy: string, changedAt?: string | null } };

export type CreateMlProjectMutationVariables = Exact<{
  orgId: Scalars['ID']['input'];
  input: CreateMlProjectInput;
}>;


export type CreateMlProjectMutation = { createMlProject: { id: string } };

export type CreateMlFindingMutationVariables = Exact<{
  orgId: Scalars['ID']['input'];
  input: CreateMlFindingInput;
}>;


export type CreateMlFindingMutation = { createMlFinding: { id: string } };

export type UpdateMlFindingMutationVariables = Exact<{
  orgId: Scalars['ID']['input'];
  id: Scalars['ID']['input'];
  input: UpdateMlFindingInput;
}>;


export type UpdateMlFindingMutation = { updateMlFinding: { id: string } };

export type DeleteMlFindingMutationVariables = Exact<{
  orgId: Scalars['ID']['input'];
  id: Scalars['ID']['input'];
}>;


export type DeleteMlFindingMutation = { deleteMlFinding: boolean };

export type CompleteOnboardingMutationVariables = Exact<{
  orgId: Scalars['ID']['input'];
}>;


export type CompleteOnboardingMutation = { completeOnboarding: boolean };

export type ServerOverviewQueryVariables = Exact<{ [key: string]: never; }>;


export type ServerOverviewQuery = { serverOverview: { totalUsers: number, activeUsers: number, totalOrgs: number }, serverConfig: { storageBackend: string, storageBucket: string, storageEndpoint: string, vectorBackend: string, embeddingBackend: string, embeddingModel: string } };

export type ServerOrgsQueryVariables = Exact<{ [key: string]: never; }>;


export type ServerOrgsQuery = { orgs: Array<{ id: string, name: string, logoUrl?: string | null, disabled: boolean, autoJoin: boolean, createdAt: string, updatedAt: string }> };

export type PrepareServerOrgLogoUploadMutationVariables = Exact<{
  orgId: Scalars['ID']['input'];
}>;


export type PrepareServerOrgLogoUploadMutation = { prepareServerOrgLogoUpload: { assetId: string, uploadUrl: string } };

export type SetServerOrgLogoMutationVariables = Exact<{
  orgId: Scalars['ID']['input'];
}>;


export type SetServerOrgLogoMutation = { setServerOrgLogo: boolean };

export type RemoveServerOrgLogoMutationVariables = Exact<{
  orgId: Scalars['ID']['input'];
}>;


export type RemoveServerOrgLogoMutation = { removeServerOrgLogo: boolean };

export type CreateServerOrgMutationVariables = Exact<{
  input: CreateServerOrgInput;
}>;


export type CreateServerOrgMutation = { createServerOrg: { id: string, name: string, disabled: boolean, autoJoin: boolean, createdAt: string, updatedAt: string } };

export type UpdateServerOrgMutationVariables = Exact<{
  id: Scalars['ID']['input'];
  input: UpdateServerOrgInput;
}>;


export type UpdateServerOrgMutation = { updateServerOrg: { id: string, name: string, disabled: boolean, autoJoin: boolean, createdAt: string, updatedAt: string } };

export type DeleteServerOrgMutationVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type DeleteServerOrgMutation = { deleteServerOrg: boolean };

export type OAuthProvidersQueryVariables = Exact<{ [key: string]: never; }>;


export type OAuthProvidersQuery = { oauthProviders: Array<{ id: string, providerName: string, type: string, displayName: string, iconUrl: string, clientId: string, clientSecret: string, authUrl: string, tokenUrl: string, userinfoUrl: string, apiUrl: string, scopes: string, allowedDomains: string, allowSignUp: boolean, emailClaim: string, nameClaim: string, subClaim: string }> };

export type PrepareOAuthProviderIconUploadMutationVariables = Exact<{
  provider: Scalars['String']['input'];
}>;


export type PrepareOAuthProviderIconUploadMutation = { prepareOAuthProviderIconUpload: { assetId: string, uploadUrl: string } };

export type SetOAuthProviderIconMutationVariables = Exact<{
  provider: Scalars['String']['input'];
}>;


export type SetOAuthProviderIconMutation = { setOAuthProviderIcon: boolean };

export type RemoveOAuthProviderIconMutationVariables = Exact<{
  provider: Scalars['String']['input'];
}>;


export type RemoveOAuthProviderIconMutation = { removeOAuthProviderIcon: boolean };

export type UpsertOAuthProviderMutationVariables = Exact<{
  provider: Scalars['String']['input'];
  input: UpsertOAuthInput;
}>;


export type UpsertOAuthProviderMutation = { upsertOAuthProvider: boolean };

export type DeleteOAuthProviderMutationVariables = Exact<{
  provider: Scalars['String']['input'];
}>;


export type DeleteOAuthProviderMutation = { deleteOAuthProvider: boolean };

export type LdapConfigQueryVariables = Exact<{ [key: string]: never; }>;


export type LdapConfigQuery = { ldap?: { id: string, host: string, port: number, useSsl: boolean, startTls: boolean, skipTlsVerify: boolean, bindDn: string, searchBaseDn: string, searchFilter: string, usernameAttribute: string, emailAttribute: string, nameAttribute: string, memberOfAttribute: string, allowSignUp: boolean } | null };

export type SamlConfigQueryVariables = Exact<{ [key: string]: never; }>;


export type SamlConfigQuery = { saml?: { id: string, spEntityId: string, spCert: string, idpEntityId: string, idpMetadataUrl: string, idpMetadataXml: string, nameIdFormat: string, loginAttribute: string, emailAttribute: string, nameAttribute: string, groupsAttribute: string, signRequests: boolean, allowSignUp: boolean } | null };

export type ScimStatusQueryVariables = Exact<{ [key: string]: never; }>;


export type ScimStatusQuery = { scim?: { id: string } | null };

export type UpsertLdapMutationVariables = Exact<{
  input: UpsertLdapInput;
}>;


export type UpsertLdapMutation = { upsertLDAP: boolean };

export type DeleteLdapMutationVariables = Exact<{ [key: string]: never; }>;


export type DeleteLdapMutation = { deleteLDAP: boolean };

export type UpsertSamlMutationVariables = Exact<{
  input: UpsertSamlInput;
}>;


export type UpsertSamlMutation = { upsertSAML: boolean };

export type ServerUsersQueryVariables = Exact<{ [key: string]: never; }>;


export type ServerUsersQuery = { users: Array<{ id: string, email: string, name: string, login: string, disabled: boolean, role: string, avatarUrl?: string | null, lastSeenAt?: string | null, createdAt: string, updatedAt: string }> };

export type CreateServerUserMutationVariables = Exact<{
  input: CreateUserInput;
}>;


export type CreateServerUserMutation = { createUser: { id: string, email: string, name: string, login: string, disabled: boolean, role: string, lastSeenAt?: string | null, createdAt: string, updatedAt: string } };

export type UpdateServerUserMutationVariables = Exact<{
  id: Scalars['ID']['input'];
  input: UpdateUserInput;
}>;


export type UpdateServerUserMutation = { updateUser: { id: string, email: string, name: string, login: string, disabled: boolean, role: string, lastSeenAt?: string | null, createdAt: string, updatedAt: string } };

export type DisableServerUserMutationVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type DisableServerUserMutation = { disableUser: boolean };

export type ActorQueryVariables = Exact<{
  orgId: Scalars['ID']['input'];
  id: Scalars['ID']['input'];
}>;


export type ActorQuery = { actor?: { id: string, name: string, avatarUrl?: string | null } | null };

export type ApiGroupsQueryVariables = Exact<{
  orgId: Scalars['ID']['input'];
  serviceId: Scalars['ID']['input'];
}>;


export type ApiGroupsQuery = { apiGroups: Array<{ id: string, serviceId: string, orgId: string, name: string, version: string, label?: string | null, protocol: string, specKey?: string | null, specHash?: string | null, createdBy: string, updatedBy?: string | null, createdAt: string, updatedAt: string }> };

export type ApiGroupQueryVariables = Exact<{
  orgId: Scalars['ID']['input'];
  serviceId: Scalars['ID']['input'];
  id: Scalars['ID']['input'];
}>;


export type ApiGroupQuery = { apiGroup: { id: string, serviceId: string, orgId: string, name: string, version: string, label?: string | null, protocol: string, specKey?: string | null, specHash?: string | null, createdBy: string, updatedBy?: string | null, createdAt: string, updatedAt: string } };

export type ApiEndpointsQueryVariables = Exact<{
  orgId: Scalars['ID']['input'];
  serviceId: Scalars['ID']['input'];
  apiGroupId: Scalars['ID']['input'];
  versionId?: InputMaybe<Scalars['ID']['input']>;
}>;


export type ApiEndpointsQuery = { apiEndpoints: Array<{ id: string, apiGroupId: string, serviceId: string, orgId: string, operationId: string, method: string, path: string, summary: string, description: string, tags: Array<string>, parameters: string, requestBody: string, responses: string, exampleRequests: string, exampleResponses: string, order: number, createdBy: string, updatedBy?: string | null, createdAt: string, updatedAt: string }> };

export type CreateApiGroupMutationVariables = Exact<{
  orgId: Scalars['ID']['input'];
  serviceId: Scalars['ID']['input'];
  input: CreateApiGroupInput;
}>;


export type CreateApiGroupMutation = { createAPIGroup: { id: string, name: string, protocol: string } };

export type UpdateApiGroupMutationVariables = Exact<{
  orgId: Scalars['ID']['input'];
  serviceId: Scalars['ID']['input'];
  id: Scalars['ID']['input'];
  input: UpdateApiGroupInput;
}>;


export type UpdateApiGroupMutation = { updateAPIGroup: { id: string, name: string } };

export type DeleteApiGroupMutationVariables = Exact<{
  orgId: Scalars['ID']['input'];
  serviceId: Scalars['ID']['input'];
  id: Scalars['ID']['input'];
}>;


export type DeleteApiGroupMutation = { deleteAPIGroup: boolean };

export type SyncApiGroupMutationVariables = Exact<{
  orgId: Scalars['ID']['input'];
  serviceId: Scalars['ID']['input'];
  input: SyncApiGroupInput;
}>;


export type SyncApiGroupMutation = { syncAPIGroup: { apiGroupId: string, versionCreated: boolean } };

export type RestoreApiGroupVersionMutationVariables = Exact<{
  orgId: Scalars['ID']['input'];
  serviceId: Scalars['ID']['input'];
  apiGroupId: Scalars['ID']['input'];
  versionId: Scalars['ID']['input'];
}>;


export type RestoreApiGroupVersionMutation = { restoreAPIGroupVersion: { id: string, version: string } };

export type CreateApiEndpointMutationVariables = Exact<{
  orgId: Scalars['ID']['input'];
  serviceId: Scalars['ID']['input'];
  apiGroupId: Scalars['ID']['input'];
  input: CreateApiEndpointInput;
}>;


export type CreateApiEndpointMutation = { createAPIEndpoint: { id: string } };

export type UpdateApiEndpointMutationVariables = Exact<{
  orgId: Scalars['ID']['input'];
  serviceId: Scalars['ID']['input'];
  apiGroupId: Scalars['ID']['input'];
  id: Scalars['ID']['input'];
  input: UpdateApiEndpointInput;
}>;


export type UpdateApiEndpointMutation = { updateAPIEndpoint: { id: string } };

export type DeleteApiEndpointMutationVariables = Exact<{
  orgId: Scalars['ID']['input'];
  serviceId: Scalars['ID']['input'];
  apiGroupId: Scalars['ID']['input'];
  id: Scalars['ID']['input'];
}>;


export type DeleteApiEndpointMutation = { deleteAPIEndpoint: boolean };

export type ApiGroupAndVersionsQueryVariables = Exact<{
  orgId: Scalars['ID']['input'];
  serviceId: Scalars['ID']['input'];
  apiGroupId: Scalars['ID']['input'];
}>;


export type ApiGroupAndVersionsQuery = { apiGroups: Array<{ id: string, serviceId: string, orgId: string, name: string, version: string, label?: string | null, protocol: string, specKey?: string | null, specHash?: string | null, createdBy: string, updatedBy?: string | null, createdAt: string, updatedAt: string }>, apiGroupVersions: Array<{ id: string, apiGroupId: string, versionNumber: number, label?: string | null, specKey: string, specHash: string, isAutoVersion: boolean, createdBy: string, createdAt: string }> };

export type ApiGroupVersionsQueryVariables = Exact<{
  orgId: Scalars['ID']['input'];
  serviceId: Scalars['ID']['input'];
  apiGroupId: Scalars['ID']['input'];
}>;


export type ApiGroupVersionsQuery = { apiGroupVersions: Array<{ id: string, apiGroupId: string, versionNumber: number, label?: string | null, specKey: string, specHash: string, isAutoVersion: boolean, createdBy: string, createdAt: string }> };

export type ApiGroupSpecQueryVariables = Exact<{
  orgId: Scalars['ID']['input'];
  serviceId: Scalars['ID']['input'];
  apiGroupId: Scalars['ID']['input'];
  versionId?: InputMaybe<Scalars['ID']['input']>;
}>;


export type ApiGroupSpecQuery = { apiGroupSpec: { apiGroupId: string, fileName: string, content: string } };

export type ServiceDependenciesQueryVariables = Exact<{
  orgId: Scalars['ID']['input'];
  serviceId: Scalars['ID']['input'];
  direction?: InputMaybe<Scalars['String']['input']>;
  criticality?: InputMaybe<Scalars['String']['input']>;
}>;


export type ServiceDependenciesQuery = { dependencies: Array<{ id: string, name: string, type?: string | null, criticality?: string | null, description?: string | null, apiGroupName?: string | null, apiEndpointNames?: Array<string> | null, databaseName?: string | null, direction?: string | null, providerName?: string | null, consumerService: { id: string, name: string }, providerService?: { id: string, name: string } | null }> };

export type ServiceDependencyGraphQueryVariables = Exact<{
  orgId: Scalars['ID']['input'];
  serviceId: Scalars['ID']['input'];
}>;


export type ServiceDependencyGraphQuery = { serviceDependencyGraph: Array<{ id: string, name: string, type?: string | null, criticality?: string | null, apiGroupName?: string | null, apiEndpointNames?: Array<string> | null, databaseName?: string | null, direction?: string | null, providerName?: string | null, consumerService: { id: string, name: string, description?: string | null, gitRepoUrl?: string | null, updatedAt?: string | null }, providerService?: { id: string, name: string, description?: string | null, gitRepoUrl?: string | null, updatedAt?: string | null } | null }> };

export type UpdateServiceDependenciesMutationVariables = Exact<{
  orgId: Scalars['ID']['input'];
  serviceId: Scalars['ID']['input'];
  input: UpdateServiceDependenciesInput;
}>;


export type UpdateServiceDependenciesMutation = { updateServiceDependencies: Array<{ id: string, name: string, direction?: string | null, providerName?: string | null, consumerService: { id: string, name: string }, providerService?: { id: string, name: string } | null }> };

export type OrganizationDependencyGraphQueryVariables = Exact<{
  orgId: Scalars['ID']['input'];
}>;


export type OrganizationDependencyGraphQuery = { dependencyGraph: Array<{ id: string, name: string, type?: string | null, criticality?: string | null, apiGroupName?: string | null, apiEndpointNames?: Array<string> | null, databaseName?: string | null, direction?: string | null, providerName?: string | null, consumerService: { id: string, name: string, description?: string | null, gitRepoUrl?: string | null, updatedAt?: string | null }, providerService?: { id: string, name: string, description?: string | null, gitRepoUrl?: string | null, updatedAt?: string | null } | null }> };

export type SavedQueriesQueryVariables = Exact<{
  orgId: Scalars['ID']['input'];
  serviceId: Scalars['ID']['input'];
  serviceDbId: Scalars['ID']['input'];
  scope: SavedQueryScope;
}>;


export type SavedQueriesQuery = { savedQueries: Array<{ id: string, folderId?: string | null, scope: SavedQueryScope, title: string, description: string, queryText: string, tags: Array<string>, createdBy: string, createdAt: string, updatedAt: string, createdByActor?: { id: string, name: string, avatarUrl?: string | null } | null }> };

export type SavedQueryFoldersQueryVariables = Exact<{
  orgId: Scalars['ID']['input'];
  serviceId: Scalars['ID']['input'];
  serviceDbId: Scalars['ID']['input'];
  scope: SavedQueryScope;
}>;


export type SavedQueryFoldersQuery = { savedQueryFolders: Array<{ id: string, name: string }> };

export type CreateSavedQueryMutationVariables = Exact<{
  orgId: Scalars['ID']['input'];
  serviceId: Scalars['ID']['input'];
  serviceDbId: Scalars['ID']['input'];
  input: CreateSavedQueryInput;
}>;


export type CreateSavedQueryMutation = { createSavedQuery: { id: string } };

export type UpdateSavedQueryMutationVariables = Exact<{
  orgId: Scalars['ID']['input'];
  serviceId: Scalars['ID']['input'];
  serviceDbId: Scalars['ID']['input'];
  id: Scalars['ID']['input'];
  input: UpdateSavedQueryInput;
}>;


export type UpdateSavedQueryMutation = { updateSavedQuery: { id: string } };

export type DeleteSavedQueryMutationVariables = Exact<{
  orgId: Scalars['ID']['input'];
  serviceId: Scalars['ID']['input'];
  serviceDbId: Scalars['ID']['input'];
  id: Scalars['ID']['input'];
}>;


export type DeleteSavedQueryMutation = { deleteSavedQuery: boolean };

export type CreateSavedQueryFolderMutationVariables = Exact<{
  orgId: Scalars['ID']['input'];
  serviceId: Scalars['ID']['input'];
  serviceDbId: Scalars['ID']['input'];
  input: CreateSavedQueryFolderInput;
}>;


export type CreateSavedQueryFolderMutation = { createSavedQueryFolder: { id: string, name: string } };

export type DeleteSavedQueryFolderMutationVariables = Exact<{
  orgId: Scalars['ID']['input'];
  serviceId: Scalars['ID']['input'];
  serviceDbId: Scalars['ID']['input'];
  id: Scalars['ID']['input'];
}>;


export type DeleteSavedQueryFolderMutation = { deleteSavedQueryFolder: boolean };

export type ServiceDbVersionsQueryVariables = Exact<{
  orgId: Scalars['ID']['input'];
  serviceId: Scalars['ID']['input'];
  serviceDbId: Scalars['ID']['input'];
}>;


export type ServiceDbVersionsQuery = { serviceDBVersions: Array<{ id: string, serviceDbId: string, versionNumber: number, label?: string | null, schemaJson: string, noSQLSchema?: unknown | null, dbDiagramId?: string | null, pgDumpFileId?: string | null, source?: string | null, sourceTs?: string | null, isAutoVersion: boolean, createdBy: string, createdAt: string, tables: Array<{ name?: string | null, columns?: Array<{ name?: string | null, type?: string | null, nullable?: boolean | null, isPrimaryKey?: boolean | null, unique?: boolean | null, autoIncrement?: boolean | null, defaultValue?: string | null, foreignKey?: string | null, description?: string | null }> | null, indexes?: Array<{ name?: string | null, type?: string | null, fields?: Array<string> | null }> | null }>, createdByActor?: { id: string, name: string, avatarUrl?: string | null } | null }> };

export type CreateServiceDbVersionMutationVariables = Exact<{
  orgId: Scalars['ID']['input'];
  serviceId: Scalars['ID']['input'];
  serviceDbId: Scalars['ID']['input'];
  input: CreateServiceDbVersionInput;
}>;


export type CreateServiceDbVersionMutation = { createServiceDBVersion: { id: string, versionNumber: number } };

export type RestoreServiceDbVersionMutationVariables = Exact<{
  orgId: Scalars['ID']['input'];
  serviceId: Scalars['ID']['input'];
  serviceDbId: Scalars['ID']['input'];
  versionId: Scalars['ID']['input'];
}>;


export type RestoreServiceDbVersionMutation = { restoreServiceDBVersion: { id: string, dbName: string } };

export type ServiceDBsQueryVariables = Exact<{
  orgId: Scalars['ID']['input'];
  serviceId: Scalars['ID']['input'];
}>;


export type ServiceDBsQuery = { serviceDBs: Array<{ id: string, serviceId: string, orgId: string, dbName: string, dbType: string, dialect: string, noSQLSchema?: unknown | null, dbDiagramId?: string | null, pgDumpFileId?: string | null, source?: string | null, sourceTs?: string | null, createdBy: string, updatedBy?: string | null, createdByCommitHash?: string | null, updatedByCommitHash?: string | null, createdAt: string, updatedAt: string, tables: Array<{ name?: string | null, columns?: Array<{ name?: string | null, type?: string | null, nullable?: boolean | null, isPrimaryKey?: boolean | null, unique?: boolean | null, autoIncrement?: boolean | null, defaultValue?: string | null, foreignKey?: string | null, description?: string | null }> | null, indexes?: Array<{ name?: string | null, type?: string | null, fields?: Array<string> | null }> | null }>, createdByActor?: { id: string, name: string, avatarUrl?: string | null, type: string, email?: string | null } | null, updatedByActor?: { id: string, name: string, avatarUrl?: string | null, type: string, email?: string | null } | null }> };

export type ServiceDbQueryVariables = Exact<{
  orgId: Scalars['ID']['input'];
  serviceId: Scalars['ID']['input'];
  id: Scalars['ID']['input'];
}>;


export type ServiceDbQuery = { serviceDB: { id: string, serviceId: string, orgId: string, dbName: string, dbType: string, dialect: string, noSQLSchema?: unknown | null, dbDiagramId?: string | null, pgDumpFileId?: string | null, source?: string | null, sourceTs?: string | null, createdBy: string, updatedBy?: string | null, createdByCommitHash?: string | null, updatedByCommitHash?: string | null, createdAt: string, updatedAt: string, tables: Array<{ name?: string | null, columns?: Array<{ name?: string | null, type?: string | null, nullable?: boolean | null, isPrimaryKey?: boolean | null, unique?: boolean | null, autoIncrement?: boolean | null, defaultValue?: string | null, foreignKey?: string | null, description?: string | null }> | null, indexes?: Array<{ name?: string | null, type?: string | null, fields?: Array<string> | null }> | null }>, createdByActor?: { id: string, name: string, avatarUrl?: string | null, type: string, email?: string | null } | null, updatedByActor?: { id: string, name: string, avatarUrl?: string | null, type: string, email?: string | null } | null } };

export type CreateServiceDbMutationVariables = Exact<{
  orgId: Scalars['ID']['input'];
  serviceId: Scalars['ID']['input'];
  input: CreateServiceDbInput;
}>;


export type CreateServiceDbMutation = { createServiceDB: { id: string, dbName: string } };

export type UpdateServiceDbMutationVariables = Exact<{
  orgId: Scalars['ID']['input'];
  serviceId: Scalars['ID']['input'];
  id: Scalars['ID']['input'];
  input: UpdateServiceDbInput;
}>;


export type UpdateServiceDbMutation = { updateServiceDB: { id: string, dbName: string } };

export type DeleteServiceDbMutationVariables = Exact<{
  orgId: Scalars['ID']['input'];
  serviceId: Scalars['ID']['input'];
  id: Scalars['ID']['input'];
}>;


export type DeleteServiceDbMutation = { deleteServiceDB: boolean };

export type ServiceDiagramsQueryVariables = Exact<{
  orgId: Scalars['ID']['input'];
  serviceId: Scalars['ID']['input'];
}>;


export type ServiceDiagramsQuery = { serviceDiagrams: Array<{ serviceId: string, diagramId: string, orgId: string, createdBy: string, updatedBy?: string | null, createdAt: string, updatedAt: string, diagram?: { id: string, orgId: string, name: string, previewAssetId?: string | null, previewImageUrl?: string | null, previewContentHash?: string | null, createdByCommitHash?: string | null, updatedByCommitHash?: string | null, createdAt: string, updatedAt: string, createdByActor?: { id: string, name: string, avatarUrl?: string | null, type: string, email?: string | null } | null, updatedByActor?: { id: string, name: string, avatarUrl?: string | null, type: string, email?: string | null } | null } | null }> };

export type CreateServiceDiagramMutationVariables = Exact<{
  orgId: Scalars['ID']['input'];
  serviceId: Scalars['ID']['input'];
  input: CreateServiceDiagramInput;
}>;


export type CreateServiceDiagramMutation = { createServiceDiagram: { serviceId: string, diagramId: string } };

export type DeleteServiceDiagramMutationVariables = Exact<{
  orgId: Scalars['ID']['input'];
  serviceId: Scalars['ID']['input'];
  diagramId: Scalars['ID']['input'];
}>;


export type DeleteServiceDiagramMutation = { deleteServiceDiagram: boolean };

export type ServiceDocsQueryVariables = Exact<{
  orgId: Scalars['ID']['input'];
  serviceId: Scalars['ID']['input'];
}>;


export type ServiceDocsQuery = { serviceDocs: Array<{ serviceId: string, docId: string, orgId: string, createdBy: string, updatedBy?: string | null, createdAt: string, updatedAt: string, doc?: { id: string, orgId: string, fileAssetId: string, fileUrl?: string | null, fileName: string, fileType: string, description: string, contentHash: string, createdAt: string, updatedAt: string } | null }> };

export type CreateServiceDocMutationVariables = Exact<{
  orgId: Scalars['ID']['input'];
  serviceId: Scalars['ID']['input'];
  input: CreateServiceDocInput;
}>;


export type CreateServiceDocMutation = { createServiceDoc: { serviceId: string, docId: string } };

export type DeleteServiceDocMutationVariables = Exact<{
  orgId: Scalars['ID']['input'];
  serviceId: Scalars['ID']['input'];
  docId: Scalars['ID']['input'];
}>;


export type DeleteServiceDocMutation = { deleteServiceDoc: boolean };

export type ServicesQueryVariables = Exact<{
  orgId: Scalars['ID']['input'];
  folderId?: InputMaybe<Scalars['ID']['input']>;
  teamId?: InputMaybe<Scalars['ID']['input']>;
  search?: InputMaybe<Scalars['String']['input']>;
  sortBy?: InputMaybe<Scalars['String']['input']>;
  sortDir?: InputMaybe<Scalars['String']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
}>;


export type ServicesQuery = { services: { totalCount: number, items: Array<{ id: string, orgId: string, folderId?: string | null, teamId?: string | null, name: string, description: string, status: string, tier: string, category: string, language: string, gitRepoUrl?: string | null, jiraProjectUrl?: string | null, slackChannelUrl?: string | null, lastCommitSha?: string | null, labels: Array<string>, metadata: string, createdBy: string, updatedBy?: string | null, createdAt: string, updatedAt: string, stats?: { serviceId: string, endpointCount: number, diagramCount: number, dbTableCount: number, docCount: number, testCaseCount: number } | null }> } };

export type ServiceQueryVariables = Exact<{
  orgId: Scalars['ID']['input'];
  id: Scalars['ID']['input'];
}>;


export type ServiceQuery = { service: { id: string, orgId: string, folderId?: string | null, teamId?: string | null, name: string, description: string, status: string, tier: string, category: string, language: string, gitRepoUrl?: string | null, jiraProjectUrl?: string | null, slackChannelUrl?: string | null, lastCommitSha?: string | null, labels: Array<string>, metadata: string, createdBy: string, updatedBy?: string | null, createdAt: string, updatedAt: string, stats?: { serviceId: string, endpointCount: number, diagramCount: number, dbTableCount: number, docCount: number, testCaseCount: number } | null } };

export type CreateServiceMutationVariables = Exact<{
  orgId: Scalars['ID']['input'];
  input: CreateServiceInput;
}>;


export type CreateServiceMutation = { createService: { id: string, name: string } };

export type UpdateServiceMutationVariables = Exact<{
  orgId: Scalars['ID']['input'];
  id: Scalars['ID']['input'];
  input: UpdateServiceInput;
}>;


export type UpdateServiceMutation = { updateService: { id: string, name: string } };

export type DeleteServiceMutationVariables = Exact<{
  orgId: Scalars['ID']['input'];
  id: Scalars['ID']['input'];
}>;


export type DeleteServiceMutation = { deleteService: boolean };

export type TestPacksQueryVariables = Exact<{
  orgId: Scalars['ID']['input'];
  serviceId: Scalars['ID']['input'];
}>;


export type TestPacksQuery = { testPacks: Array<{ testPackId: string, serviceId: string, orgId: string, name: string, type: string, createdBy: string, updatedBy?: string | null, createdAt: string, updatedAt: string }> };

export type CreateTestPackMutationVariables = Exact<{
  orgId: Scalars['ID']['input'];
  serviceId: Scalars['ID']['input'];
  input: CreateTestPackInput;
}>;


export type CreateTestPackMutation = { createTestPack: { testPackId: string, serviceId: string, orgId: string, name: string, type: string, createdBy: string, updatedBy?: string | null, createdAt: string, updatedAt: string } };

export type UpdateTestPackMutationVariables = Exact<{
  orgId: Scalars['ID']['input'];
  serviceId: Scalars['ID']['input'];
  id: Scalars['ID']['input'];
  input: UpdateTestPackInput;
}>;


export type UpdateTestPackMutation = { updateTestPack: { testPackId: string, serviceId: string, orgId: string, name: string, type: string, createdBy: string, updatedBy?: string | null, createdAt: string, updatedAt: string } };

export type DeleteTestPackMutationVariables = Exact<{
  orgId: Scalars['ID']['input'];
  serviceId: Scalars['ID']['input'];
  id: Scalars['ID']['input'];
}>;


export type DeleteTestPackMutation = { deleteTestPack: boolean };

export type TestCasesQueryVariables = Exact<{
  orgId: Scalars['ID']['input'];
  serviceId: Scalars['ID']['input'];
  testPackId: Scalars['ID']['input'];
}>;


export type TestCasesQuery = { testCases: Array<{ testCaseId: string, testPackId: string, serviceId: string, orgId: string, title: string, order: number, type: string, description?: string | null, priority?: string | null, labels: Array<string>, linkedTicket?: string | null, estimatedDurationMins?: number | null, testOwner?: string | null, linkedMapNodeId?: string | null, isCritical: boolean, evidenceRequired: boolean, status: string, version: number, baselineRunResultId?: string | null, dependencies: Array<string>, createdBy: string, updatedBy?: string | null, createdAt: string, updatedAt: string, manual?: { preconditions?: string | null, testData?: string | null, expectedOutcome?: string | null, postconditions?: string | null, steps?: Array<{ order: number, action: string, expectedResult: string }> | null } | null, api?: { httpMethod: string, apiSpecId?: string | null, operationId?: string | null, requestBody?: string | null, expectedStatusCode?: number | null, maxResponseTimeMs?: number | null } | null, graphql?: { operationType: string, operationName?: string | null, query: string, variables?: string | null, responseBody?: string | null, expectError: boolean } | null, database?: { dialect: string, schemaId?: string | null, query: string, setupQuery?: string | null, teardownQuery?: string | null } | null, grpc?: { serviceName: string, methodName: string, callMode: string, protoFileId?: string | null, serverAddress?: string | null, requestMessage?: string | null, expectedStatus: string, deadlineMs?: number | null, responseBody?: string | null, useTLS: boolean, expectError: boolean } | null }> };

export type CreateTestCaseMutationVariables = Exact<{
  orgId: Scalars['ID']['input'];
  serviceId: Scalars['ID']['input'];
  input: CreateTestCaseInput;
}>;


export type CreateTestCaseMutation = { createTestCase: { testCaseId: string, testPackId: string, serviceId: string, orgId: string, title: string, order: number, type: string, description?: string | null, priority?: string | null, labels: Array<string>, linkedTicket?: string | null, estimatedDurationMins?: number | null, testOwner?: string | null, linkedMapNodeId?: string | null, isCritical: boolean, evidenceRequired: boolean, status: string, version: number, baselineRunResultId?: string | null, dependencies: Array<string>, createdBy: string, updatedBy?: string | null, createdAt: string, updatedAt: string, manual?: { preconditions?: string | null, testData?: string | null, expectedOutcome?: string | null, postconditions?: string | null, steps?: Array<{ order: number, action: string, expectedResult: string }> | null } | null, api?: { httpMethod: string, apiSpecId?: string | null, operationId?: string | null, requestBody?: string | null, expectedStatusCode?: number | null, maxResponseTimeMs?: number | null } | null, graphql?: { operationType: string, operationName?: string | null, query: string, variables?: string | null, responseBody?: string | null, expectError: boolean } | null, database?: { dialect: string, schemaId?: string | null, query: string, setupQuery?: string | null, teardownQuery?: string | null } | null, grpc?: { serviceName: string, methodName: string, callMode: string, protoFileId?: string | null, serverAddress?: string | null, requestMessage?: string | null, expectedStatus: string, deadlineMs?: number | null, responseBody?: string | null, useTLS: boolean, expectError: boolean } | null } };

export type UpdateTestCaseMutationVariables = Exact<{
  orgId: Scalars['ID']['input'];
  serviceId: Scalars['ID']['input'];
  id: Scalars['ID']['input'];
  input: UpdateTestCaseInput;
}>;


export type UpdateTestCaseMutation = { updateTestCase: { testCaseId: string, testPackId: string, serviceId: string, orgId: string, title: string, order: number, type: string, description?: string | null, priority?: string | null, labels: Array<string>, linkedTicket?: string | null, estimatedDurationMins?: number | null, testOwner?: string | null, linkedMapNodeId?: string | null, isCritical: boolean, evidenceRequired: boolean, status: string, version: number, baselineRunResultId?: string | null, dependencies: Array<string>, createdBy: string, updatedBy?: string | null, createdAt: string, updatedAt: string, manual?: { preconditions?: string | null, testData?: string | null, expectedOutcome?: string | null, postconditions?: string | null, steps?: Array<{ order: number, action: string, expectedResult: string }> | null } | null, api?: { httpMethod: string, apiSpecId?: string | null, operationId?: string | null, requestBody?: string | null, expectedStatusCode?: number | null, maxResponseTimeMs?: number | null } | null, graphql?: { operationType: string, operationName?: string | null, query: string, variables?: string | null, responseBody?: string | null, expectError: boolean } | null, database?: { dialect: string, schemaId?: string | null, query: string, setupQuery?: string | null, teardownQuery?: string | null } | null, grpc?: { serviceName: string, methodName: string, callMode: string, protoFileId?: string | null, serverAddress?: string | null, requestMessage?: string | null, expectedStatus: string, deadlineMs?: number | null, responseBody?: string | null, useTLS: boolean, expectError: boolean } | null } };

export type DeleteTestCaseMutationVariables = Exact<{
  orgId: Scalars['ID']['input'];
  serviceId: Scalars['ID']['input'];
  id: Scalars['ID']['input'];
}>;


export type DeleteTestCaseMutation = { deleteTestCase: boolean };

export type TestRunsQueryVariables = Exact<{
  orgId: Scalars['ID']['input'];
  serviceId: Scalars['ID']['input'];
  testPackId: Scalars['ID']['input'];
}>;


export type TestRunsQuery = { testRuns: Array<{ testRunId: string, testPackId: string, serviceId: string, orgId: string, environment: string, releaseLabel?: string | null, startedAt?: string | null, completedAt?: string | null, status: string, startedBy?: string | null, executedBy: string, executedAt: string, overallStatus: string }> };

export type TestRunQueryVariables = Exact<{
  orgId: Scalars['ID']['input'];
  serviceId: Scalars['ID']['input'];
  id: Scalars['ID']['input'];
}>;


export type TestRunQuery = { testRun: { testRunId: string, testPackId: string, serviceId: string, orgId: string, environment: string, releaseLabel?: string | null, startedAt?: string | null, completedAt?: string | null, status: string, startedBy?: string | null, executedBy: string, executedAt: string, overallStatus: string } };

export type TestRunsSummaryQueryVariables = Exact<{
  orgId: Scalars['ID']['input'];
  serviceId: Scalars['ID']['input'];
  testPackId?: InputMaybe<Scalars['ID']['input']>;
}>;


export type TestRunsSummaryQuery = { testRunsSummary: Array<{ testRunId: string, testPackId: string, serviceId: string, environment: string, releaseLabel?: string | null, startedAt?: string | null, completedAt?: string | null, status: string, startedBy?: string | null, executedBy: string, executedAt: string, overallStatus: string, passedCount: number, failedCount: number, skippedCount: number, blockedCount: number }> };

export type CreateTestRunMutationVariables = Exact<{
  orgId: Scalars['ID']['input'];
  serviceId: Scalars['ID']['input'];
  input: CreateTestRunInput;
}>;


export type CreateTestRunMutation = { createTestRun: { testRunId: string, testPackId: string, status: string, overallStatus: string } };

export type UpdateTestRunMutationVariables = Exact<{
  orgId: Scalars['ID']['input'];
  serviceId: Scalars['ID']['input'];
  id: Scalars['ID']['input'];
  input: UpdateTestRunInput;
}>;


export type UpdateTestRunMutation = { updateTestRun: { testRunId: string, status: string, overallStatus: string } };

export type TestRunResultsQueryVariables = Exact<{
  orgId: Scalars['ID']['input'];
  serviceId: Scalars['ID']['input'];
  testRunId: Scalars['ID']['input'];
}>;


export type TestRunResultsQuery = { testRunResults: Array<{ testRunResultId: string, testRunId: string, testCaseId: string, serviceId: string, orgId: string, status: string, blockedReason?: string | null, responseStatus?: number | null, responseBody?: string | null, responseTimeMs?: number | null, notes?: string | null, screenshotUrls: Array<string>, executedAt: string, executedBy: string }> };

export type CreateTestRunResultMutationVariables = Exact<{
  orgId: Scalars['ID']['input'];
  serviceId: Scalars['ID']['input'];
  input: CreateTestRunResultInput;
}>;


export type CreateTestRunResultMutation = { createTestRunResult: { testRunResultId: string, testRunId: string, testCaseId: string, status: string } };

export type UpdateTestRunResultMutationVariables = Exact<{
  orgId: Scalars['ID']['input'];
  serviceId: Scalars['ID']['input'];
  id: Scalars['ID']['input'];
  input: UpdateTestRunResultInput;
}>;


export type UpdateTestRunResultMutation = { updateTestRunResult: { testRunResultId: string, status: string } };

export type CreateAssetUploadMutationVariables = Exact<{
  orgId: Scalars['ID']['input'];
}>;


export type CreateAssetUploadMutation = { createAssetUpload: { assetId: string, uploadUrl: string } };

export type AssetUrlQueryVariables = Exact<{
  orgId: Scalars['ID']['input'];
  assetId: Scalars['ID']['input'];
}>;


export type AssetUrlQuery = { assetUrl?: string | null };

export type AssetUrlsQueryVariables = Exact<{
  orgId: Scalars['ID']['input'];
  assetIds: Array<Scalars['ID']['input']> | Scalars['ID']['input'];
}>;


export type AssetUrlsQuery = { assetUrls: Array<{ assetId: string, url: string }> };

export type MeAndOrgBootstrapQueryVariables = Exact<{ [key: string]: never; }>;


export type MeAndOrgBootstrapQuery = { me: { userId: string, email: string, name: string, avatarUrl?: string | null, isServerAdmin: boolean }, myOrgs: Array<{ id: string, name: string, role: string, logoUrl?: string | null, onboardingDone: boolean }> };


export const ChatSessionsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"ChatSessions"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"orgId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"chatSessions"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"orgId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"orgId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"orgId"}},{"kind":"Field","name":{"kind":"Name","value":"ownerUserId"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"isPinned"}},{"kind":"Field","name":{"kind":"Name","value":"messageCount"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}}]}}]} as unknown as DocumentNode<ChatSessionsQuery, ChatSessionsQueryVariables>;
export const ChatSessionDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"ChatSession"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"orgId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"chatSession"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"orgId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"orgId"}}},{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"session"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"orgId"}},{"kind":"Field","name":{"kind":"Name","value":"ownerUserId"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"isPinned"}},{"kind":"Field","name":{"kind":"Name","value":"messageCount"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}},{"kind":"Field","name":{"kind":"Name","value":"messages"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"chatSessionId"}},{"kind":"Field","name":{"kind":"Name","value":"role"}},{"kind":"Field","name":{"kind":"Name","value":"content"}},{"kind":"Field","name":{"kind":"Name","value":"parts"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}}]}}]}}]}}]} as unknown as DocumentNode<ChatSessionQuery, ChatSessionQueryVariables>;
export const CreateChatSessionDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CreateChatSession"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"orgId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CreateChatSessionInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createChatSession"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"orgId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"orgId"}}},{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"orgId"}},{"kind":"Field","name":{"kind":"Name","value":"ownerUserId"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"isPinned"}},{"kind":"Field","name":{"kind":"Name","value":"messageCount"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}}]}}]} as unknown as DocumentNode<CreateChatSessionMutation, CreateChatSessionMutationVariables>;
export const UpdateChatSessionDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpdateChatSession"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"orgId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UpdateChatSessionInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateChatSession"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"orgId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"orgId"}}},{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}},{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"orgId"}},{"kind":"Field","name":{"kind":"Name","value":"ownerUserId"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"isPinned"}},{"kind":"Field","name":{"kind":"Name","value":"messageCount"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}}]}}]} as unknown as DocumentNode<UpdateChatSessionMutation, UpdateChatSessionMutationVariables>;
export const DeleteChatSessionDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"DeleteChatSession"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"orgId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"deleteChatSession"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"orgId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"orgId"}}},{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}]}]}}]} as unknown as DocumentNode<DeleteChatSessionMutation, DeleteChatSessionMutationVariables>;
export const CreateChatMessageDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CreateChatMessage"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"orgId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"sessionId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CreateChatMessageInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createChatMessage"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"orgId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"orgId"}}},{"kind":"Argument","name":{"kind":"Name","value":"sessionId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"sessionId"}}},{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"chatSessionId"}},{"kind":"Field","name":{"kind":"Name","value":"role"}},{"kind":"Field","name":{"kind":"Name","value":"content"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}}]}}]}}]} as unknown as DocumentNode<CreateChatMessageMutation, CreateChatMessageMutationVariables>;
export const CommentsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"Comments"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"orgId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"resourceId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"comments"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"orgId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"orgId"}}},{"kind":"Argument","name":{"kind":"Name","value":"resourceId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"resourceId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"resourceId"}},{"kind":"Field","name":{"kind":"Name","value":"parentCommentId"}},{"kind":"Field","name":{"kind":"Name","value":"text"}},{"kind":"Field","name":{"kind":"Name","value":"createdBy"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"createdByActor"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"avatarUrl"}}]}}]}}]}}]} as unknown as DocumentNode<CommentsQuery, CommentsQueryVariables>;
export const CreateCommentDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CreateComment"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"orgId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CreateCommentInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createComment"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"orgId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"orgId"}}},{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]}}]} as unknown as DocumentNode<CreateCommentMutation, CreateCommentMutationVariables>;
export const UpdateCommentDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpdateComment"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"orgId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UpdateCommentInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateComment"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"orgId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"orgId"}}},{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}},{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]}}]} as unknown as DocumentNode<UpdateCommentMutation, UpdateCommentMutationVariables>;
export const DeleteCommentDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"DeleteComment"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"orgId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"deleteComment"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"orgId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"orgId"}}},{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}]}]}}]} as unknown as DocumentNode<DeleteCommentMutation, DeleteCommentMutationVariables>;
export const ComponentsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"Components"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"orgId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"components"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"orgId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"orgId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"components"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"componentId"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"tags"}},{"kind":"Field","name":{"kind":"Name","value":"category"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"previewImageJpg"}},{"kind":"Field","name":{"kind":"Name","value":"isActive"}},{"kind":"Field","name":{"kind":"Name","value":"order"}},{"kind":"Field","name":{"kind":"Name","value":"componentFields"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"componentFieldId"}},{"kind":"Field","name":{"kind":"Name","value":"label"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"required"}},{"kind":"Field","name":{"kind":"Name","value":"readonly"}},{"kind":"Field","name":{"kind":"Name","value":"options"}},{"kind":"Field","name":{"kind":"Name","value":"order"}}]}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}},{"kind":"Field","name":{"kind":"Name","value":"customComponents"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"componentId"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"tags"}},{"kind":"Field","name":{"kind":"Name","value":"category"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"previewImageJpg"}},{"kind":"Field","name":{"kind":"Name","value":"isActive"}},{"kind":"Field","name":{"kind":"Name","value":"order"}},{"kind":"Field","name":{"kind":"Name","value":"componentFields"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"componentFieldId"}},{"kind":"Field","name":{"kind":"Name","value":"label"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"required"}},{"kind":"Field","name":{"kind":"Name","value":"readonly"}},{"kind":"Field","name":{"kind":"Name","value":"options"}},{"kind":"Field","name":{"kind":"Name","value":"order"}}]}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}}]}}]}}]} as unknown as DocumentNode<ComponentsQuery, ComponentsQueryVariables>;
export const CreateCustomComponentDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CreateCustomComponent"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"orgId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CustomComponentInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createCustomComponent"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"orgId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"orgId"}}},{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"componentId"}}]}}]}}]} as unknown as DocumentNode<CreateCustomComponentMutation, CreateCustomComponentMutationVariables>;
export const UpdateCustomComponentDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpdateCustomComponent"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"orgId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CustomComponentInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateCustomComponent"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"orgId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"orgId"}}},{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}},{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"componentId"}}]}}]}}]} as unknown as DocumentNode<UpdateCustomComponentMutation, UpdateCustomComponentMutationVariables>;
export const DeleteCustomComponentDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"DeleteCustomComponent"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"orgId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"deleteCustomComponent"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"orgId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"orgId"}}},{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}]}]}}]} as unknown as DocumentNode<DeleteCustomComponentMutation, DeleteCustomComponentMutationVariables>;
export const DiagramsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"Diagrams"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"orgId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"folderId"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"teamId"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"serviceId"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"search"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"sortBy"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"sortDir"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"limit"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"offset"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"diagrams"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"orgId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"orgId"}}},{"kind":"Argument","name":{"kind":"Name","value":"folderId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"folderId"}}},{"kind":"Argument","name":{"kind":"Name","value":"teamId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"teamId"}}},{"kind":"Argument","name":{"kind":"Name","value":"serviceId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"serviceId"}}},{"kind":"Argument","name":{"kind":"Name","value":"search"},"value":{"kind":"Variable","name":{"kind":"Name","value":"search"}}},{"kind":"Argument","name":{"kind":"Name","value":"sortBy"},"value":{"kind":"Variable","name":{"kind":"Name","value":"sortBy"}}},{"kind":"Argument","name":{"kind":"Name","value":"sortDir"},"value":{"kind":"Variable","name":{"kind":"Name","value":"sortDir"}}},{"kind":"Argument","name":{"kind":"Name","value":"limit"},"value":{"kind":"Variable","name":{"kind":"Name","value":"limit"}}},{"kind":"Argument","name":{"kind":"Name","value":"offset"},"value":{"kind":"Variable","name":{"kind":"Name","value":"offset"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"totalCount"}},{"kind":"Field","name":{"kind":"Name","value":"items"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"orgId"}},{"kind":"Field","name":{"kind":"Name","value":"folderId"}},{"kind":"Field","name":{"kind":"Name","value":"teamId"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"previewAssetId"}},{"kind":"Field","name":{"kind":"Name","value":"previewImageUrl"}},{"kind":"Field","name":{"kind":"Name","value":"previewContentHash"}},{"kind":"Field","name":{"kind":"Name","value":"previewStatus"}},{"kind":"Field","name":{"kind":"Name","value":"createdBy"}},{"kind":"Field","name":{"kind":"Name","value":"updatedBy"}},{"kind":"Field","name":{"kind":"Name","value":"createdByCommitHash"}},{"kind":"Field","name":{"kind":"Name","value":"updatedByCommitHash"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}},{"kind":"Field","name":{"kind":"Name","value":"createdByActor"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"avatarUrl"}}]}},{"kind":"Field","name":{"kind":"Name","value":"updatedByActor"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"avatarUrl"}}]}}]}}]}}]}}]} as unknown as DocumentNode<DiagramsQuery, DiagramsQueryVariables>;
export const CreateDiagramDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CreateDiagram"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"orgId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CreateDiagramInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createDiagram"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"orgId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"orgId"}}},{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]}}]} as unknown as DocumentNode<CreateDiagramMutation, CreateDiagramMutationVariables>;
export const UpdateDiagramMetaDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpdateDiagramMeta"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"orgId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UpdateDiagramInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateDiagram"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"orgId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"orgId"}}},{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}},{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]}}]} as unknown as DocumentNode<UpdateDiagramMetaMutation, UpdateDiagramMetaMutationVariables>;
export const DeleteDiagramDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"DeleteDiagram"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"orgId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"deleteDiagram"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"orgId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"orgId"}}},{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}]}]}}]} as unknown as DocumentNode<DeleteDiagramMutation, DeleteDiagramMutationVariables>;
export const FoldersDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"Folders"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"orgId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"type"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"folders"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"orgId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"orgId"}}},{"kind":"Argument","name":{"kind":"Name","value":"type"},"value":{"kind":"Variable","name":{"kind":"Name","value":"type"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"orgId"}},{"kind":"Field","name":{"kind":"Name","value":"parentId"}},{"kind":"Field","name":{"kind":"Name","value":"teamId"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"order"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}}]}}]} as unknown as DocumentNode<FoldersQuery, FoldersQueryVariables>;
export const FolderDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"Folder"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"orgId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"folder"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"orgId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"orgId"}}},{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"orgId"}},{"kind":"Field","name":{"kind":"Name","value":"parentId"}},{"kind":"Field","name":{"kind":"Name","value":"teamId"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"order"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}}]}}]} as unknown as DocumentNode<FolderQuery, FolderQueryVariables>;
export const CreateFolderDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CreateFolder"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"orgId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CreateFolderInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createFolder"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"orgId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"orgId"}}},{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"orgId"}},{"kind":"Field","name":{"kind":"Name","value":"parentId"}},{"kind":"Field","name":{"kind":"Name","value":"teamId"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"order"}}]}}]}}]} as unknown as DocumentNode<CreateFolderMutation, CreateFolderMutationVariables>;
export const UpdateFolderDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpdateFolder"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"orgId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UpdateFolderInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateFolder"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"orgId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"orgId"}}},{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}},{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"parentId"}},{"kind":"Field","name":{"kind":"Name","value":"teamId"}},{"kind":"Field","name":{"kind":"Name","value":"order"}}]}}]}}]} as unknown as DocumentNode<UpdateFolderMutation, UpdateFolderMutationVariables>;
export const DeleteFolderDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"DeleteFolder"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"orgId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"deleteFolder"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"orgId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"orgId"}}},{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}]}]}}]} as unknown as DocumentNode<DeleteFolderMutation, DeleteFolderMutationVariables>;
export const TeamsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"Teams"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"orgId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"teams"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"orgId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"orgId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}}]}}]} as unknown as DocumentNode<TeamsQuery, TeamsQueryVariables>;
export const DocsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"Docs"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"orgId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"folderId"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"teamId"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"search"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"sortBy"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"sortDir"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"limit"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"offset"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"docs"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"orgId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"orgId"}}},{"kind":"Argument","name":{"kind":"Name","value":"folderId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"folderId"}}},{"kind":"Argument","name":{"kind":"Name","value":"teamId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"teamId"}}},{"kind":"Argument","name":{"kind":"Name","value":"search"},"value":{"kind":"Variable","name":{"kind":"Name","value":"search"}}},{"kind":"Argument","name":{"kind":"Name","value":"sortBy"},"value":{"kind":"Variable","name":{"kind":"Name","value":"sortBy"}}},{"kind":"Argument","name":{"kind":"Name","value":"sortDir"},"value":{"kind":"Variable","name":{"kind":"Name","value":"sortDir"}}},{"kind":"Argument","name":{"kind":"Name","value":"limit"},"value":{"kind":"Variable","name":{"kind":"Name","value":"limit"}}},{"kind":"Argument","name":{"kind":"Name","value":"offset"},"value":{"kind":"Variable","name":{"kind":"Name","value":"offset"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"totalCount"}},{"kind":"Field","name":{"kind":"Name","value":"items"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"orgId"}},{"kind":"Field","name":{"kind":"Name","value":"folderId"}},{"kind":"Field","name":{"kind":"Name","value":"teamId"}},{"kind":"Field","name":{"kind":"Name","value":"fileAssetId"}},{"kind":"Field","name":{"kind":"Name","value":"fileUrl"}},{"kind":"Field","name":{"kind":"Name","value":"fileName"}},{"kind":"Field","name":{"kind":"Name","value":"fileType"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"contentHash"}},{"kind":"Field","name":{"kind":"Name","value":"createdBy"}},{"kind":"Field","name":{"kind":"Name","value":"updatedBy"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}},{"kind":"Field","name":{"kind":"Name","value":"createdByActor"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"avatarUrl"}}]}},{"kind":"Field","name":{"kind":"Name","value":"updatedByActor"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"avatarUrl"}}]}}]}}]}}]}}]} as unknown as DocumentNode<DocsQuery, DocsQueryVariables>;
export const CreateDocDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CreateDoc"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"orgId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CreateDocInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createDoc"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"orgId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"orgId"}}},{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"fileName"}}]}}]}}]} as unknown as DocumentNode<CreateDocMutation, CreateDocMutationVariables>;
export const UpdateDocDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpdateDoc"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"orgId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UpdateDocInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateDoc"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"orgId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"orgId"}}},{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}},{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"fileName"}}]}}]}}]} as unknown as DocumentNode<UpdateDocMutation, UpdateDocMutationVariables>;
export const DeleteDocDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"DeleteDoc"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"orgId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"deleteDoc"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"orgId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"orgId"}}},{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}]}]}}]} as unknown as DocumentNode<DeleteDocMutation, DeleteDocMutationVariables>;
export const CostSavingsSummaryDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"CostSavingsSummary"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"orgId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"period"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"modelId"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"costSavingsSummary"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"orgId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"orgId"}}},{"kind":"Argument","name":{"kind":"Name","value":"period"},"value":{"kind":"Variable","name":{"kind":"Name","value":"period"}}},{"kind":"Argument","name":{"kind":"Name","value":"modelId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"modelId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"orgId"}},{"kind":"Field","name":{"kind":"Name","value":"period"}},{"kind":"Field","name":{"kind":"Name","value":"modelId"}},{"kind":"Field","name":{"kind":"Name","value":"totalCalls"}},{"kind":"Field","name":{"kind":"Name","value":"totalTokensServed"}},{"kind":"Field","name":{"kind":"Name","value":"totalTokensSaved"}},{"kind":"Field","name":{"kind":"Name","value":"costServedUsd"}},{"kind":"Field","name":{"kind":"Name","value":"costRawUsd"}},{"kind":"Field","name":{"kind":"Name","value":"costSavedUsd"}},{"kind":"Field","name":{"kind":"Name","value":"uniqueUsersCount"}},{"kind":"Field","name":{"kind":"Name","value":"totalDurationMs"}},{"kind":"Field","name":{"kind":"Name","value":"estAgentTimeMs"}},{"kind":"Field","name":{"kind":"Name","value":"timeSavedMs"}}]}}]}}]} as unknown as DocumentNode<CostSavingsSummaryQuery, CostSavingsSummaryQueryVariables>;
export const CostSavingsTimeseriesDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"CostSavingsTimeseries"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"orgId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"period"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"modelId"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"costSavingsTimeseries"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"orgId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"orgId"}}},{"kind":"Argument","name":{"kind":"Name","value":"period"},"value":{"kind":"Variable","name":{"kind":"Name","value":"period"}}},{"kind":"Argument","name":{"kind":"Name","value":"modelId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"modelId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"date"}},{"kind":"Field","name":{"kind":"Name","value":"totalCalls"}},{"kind":"Field","name":{"kind":"Name","value":"totalTokensServed"}},{"kind":"Field","name":{"kind":"Name","value":"totalTokensSaved"}},{"kind":"Field","name":{"kind":"Name","value":"costServedUsd"}},{"kind":"Field","name":{"kind":"Name","value":"costRawUsd"}},{"kind":"Field","name":{"kind":"Name","value":"costSavedUsd"}},{"kind":"Field","name":{"kind":"Name","value":"totalDurationMs"}},{"kind":"Field","name":{"kind":"Name","value":"estAgentTimeMs"}},{"kind":"Field","name":{"kind":"Name","value":"timeSavedMs"}}]}}]}}]} as unknown as DocumentNode<CostSavingsTimeseriesQuery, CostSavingsTimeseriesQueryVariables>;
export const CostSavingsByToolDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"CostSavingsByTool"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"orgId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"period"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"modelId"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"costSavingsByTool"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"orgId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"orgId"}}},{"kind":"Argument","name":{"kind":"Name","value":"period"},"value":{"kind":"Variable","name":{"kind":"Name","value":"period"}}},{"kind":"Argument","name":{"kind":"Name","value":"modelId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"modelId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"toolName"}},{"kind":"Field","name":{"kind":"Name","value":"totalCalls"}},{"kind":"Field","name":{"kind":"Name","value":"tokensSaved"}},{"kind":"Field","name":{"kind":"Name","value":"costSavedUsd"}},{"kind":"Field","name":{"kind":"Name","value":"totalDurationMs"}}]}}]}}]} as unknown as DocumentNode<CostSavingsByToolQuery, CostSavingsByToolQueryVariables>;
export const CostSavingsByClientDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"CostSavingsByClient"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"orgId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"period"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"modelId"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"costSavingsByClient"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"orgId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"orgId"}}},{"kind":"Argument","name":{"kind":"Name","value":"period"},"value":{"kind":"Variable","name":{"kind":"Name","value":"period"}}},{"kind":"Argument","name":{"kind":"Name","value":"modelId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"modelId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"clientName"}},{"kind":"Field","name":{"kind":"Name","value":"totalCalls"}},{"kind":"Field","name":{"kind":"Name","value":"tokensSaved"}},{"kind":"Field","name":{"kind":"Name","value":"costSavedUsd"}},{"kind":"Field","name":{"kind":"Name","value":"totalDurationMs"}}]}}]}}]} as unknown as DocumentNode<CostSavingsByClientQuery, CostSavingsByClientQueryVariables>;
export const CostSavingsByModelDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"CostSavingsByModel"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"orgId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"period"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"costSavingsByModel"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"orgId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"orgId"}}},{"kind":"Argument","name":{"kind":"Name","value":"period"},"value":{"kind":"Variable","name":{"kind":"Name","value":"period"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"modelId"}},{"kind":"Field","name":{"kind":"Name","value":"displayName"}},{"kind":"Field","name":{"kind":"Name","value":"provider"}},{"kind":"Field","name":{"kind":"Name","value":"totalCalls"}},{"kind":"Field","name":{"kind":"Name","value":"tokensSaved"}},{"kind":"Field","name":{"kind":"Name","value":"costRawUsd"}},{"kind":"Field","name":{"kind":"Name","value":"costSavedUsd"}}]}}]}}]} as unknown as DocumentNode<CostSavingsByModelQuery, CostSavingsByModelQueryVariables>;
export const CostSavingsByUserDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"CostSavingsByUser"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"orgId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"period"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"modelId"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"costSavingsByUser"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"orgId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"orgId"}}},{"kind":"Argument","name":{"kind":"Name","value":"period"},"value":{"kind":"Variable","name":{"kind":"Name","value":"period"}}},{"kind":"Argument","name":{"kind":"Name","value":"modelId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"modelId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"userId"}},{"kind":"Field","name":{"kind":"Name","value":"serviceAccountId"}},{"kind":"Field","name":{"kind":"Name","value":"displayName"}},{"kind":"Field","name":{"kind":"Name","value":"avatarUrl"}},{"kind":"Field","name":{"kind":"Name","value":"totalCalls"}},{"kind":"Field","name":{"kind":"Name","value":"tokensSaved"}},{"kind":"Field","name":{"kind":"Name","value":"costSavedUsd"}},{"kind":"Field","name":{"kind":"Name","value":"totalDurationMs"}}]}}]}}]} as unknown as DocumentNode<CostSavingsByUserQuery, CostSavingsByUserQueryVariables>;
export const CanvasDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"Canvas"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"orgId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"mapId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"canvas"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"orgId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"orgId"}}},{"kind":"Argument","name":{"kind":"Name","value":"mapId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"mapId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"mapId"}},{"kind":"Field","name":{"kind":"Name","value":"orgId"}},{"kind":"Field","name":{"kind":"Name","value":"zoom"}},{"kind":"Field","name":{"kind":"Name","value":"navigationX"}},{"kind":"Field","name":{"kind":"Name","value":"navigationY"}},{"kind":"Field","name":{"kind":"Name","value":"framePositions"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}}]}}]} as unknown as DocumentNode<CanvasQuery, CanvasQueryVariables>;
export const UpsertCanvasDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpsertCanvas"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"orgId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"mapId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UpsertCanvasInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"upsertCanvas"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"orgId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"orgId"}}},{"kind":"Argument","name":{"kind":"Name","value":"mapId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"mapId"}}},{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"mapId"}},{"kind":"Field","name":{"kind":"Name","value":"orgId"}},{"kind":"Field","name":{"kind":"Name","value":"zoom"}},{"kind":"Field","name":{"kind":"Name","value":"navigationX"}},{"kind":"Field","name":{"kind":"Name","value":"navigationY"}},{"kind":"Field","name":{"kind":"Name","value":"framePositions"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}}]}}]} as unknown as DocumentNode<UpsertCanvasMutation, UpsertCanvasMutationVariables>;
export const FocalPointsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"FocalPoints"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"orgId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"mapId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"frameId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"focalPoints"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"orgId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"orgId"}}},{"kind":"Argument","name":{"kind":"Name","value":"mapId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"mapId"}}},{"kind":"Argument","name":{"kind":"Name","value":"frameId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"frameId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"frameId"}},{"kind":"Field","name":{"kind":"Name","value":"orgId"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"locationX"}},{"kind":"Field","name":{"kind":"Name","value":"locationY"}},{"kind":"Field","name":{"kind":"Name","value":"visibility"}},{"kind":"Field","name":{"kind":"Name","value":"isActive"}},{"kind":"Field","name":{"kind":"Name","value":"createdBy"}},{"kind":"Field","name":{"kind":"Name","value":"updatedBy"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}}]}}]} as unknown as DocumentNode<FocalPointsQuery, FocalPointsQueryVariables>;
export const CreateFocalPointDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CreateFocalPoint"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"orgId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"mapId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"frameId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CreateFocalPointInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createFocalPoint"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"orgId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"orgId"}}},{"kind":"Argument","name":{"kind":"Name","value":"mapId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"mapId"}}},{"kind":"Argument","name":{"kind":"Name","value":"frameId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"frameId"}}},{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]}}]} as unknown as DocumentNode<CreateFocalPointMutation, CreateFocalPointMutationVariables>;
export const UpdateFocalPointDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpdateFocalPoint"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"orgId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"mapId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"frameId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UpdateFocalPointInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateFocalPoint"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"orgId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"orgId"}}},{"kind":"Argument","name":{"kind":"Name","value":"mapId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"mapId"}}},{"kind":"Argument","name":{"kind":"Name","value":"frameId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"frameId"}}},{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}},{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]}}]} as unknown as DocumentNode<UpdateFocalPointMutation, UpdateFocalPointMutationVariables>;
export const DeleteFocalPointDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"DeleteFocalPoint"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"orgId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"mapId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"frameId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"deleteFocalPoint"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"orgId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"orgId"}}},{"kind":"Argument","name":{"kind":"Name","value":"mapId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"mapId"}}},{"kind":"Argument","name":{"kind":"Name","value":"frameId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"frameId"}}},{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}]}]}}]} as unknown as DocumentNode<DeleteFocalPointMutation, DeleteFocalPointMutationVariables>;
export const FrameGroupsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"FrameGroups"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"orgId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"mapId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"frameId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"frameGroups"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"orgId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"orgId"}}},{"kind":"Argument","name":{"kind":"Name","value":"mapId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"mapId"}}},{"kind":"Argument","name":{"kind":"Name","value":"frameId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"frameId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"frameId"}},{"kind":"Field","name":{"kind":"Name","value":"orgId"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"locationX"}},{"kind":"Field","name":{"kind":"Name","value":"locationY"}},{"kind":"Field","name":{"kind":"Name","value":"width"}},{"kind":"Field","name":{"kind":"Name","value":"height"}},{"kind":"Field","name":{"kind":"Name","value":"order"}},{"kind":"Field","name":{"kind":"Name","value":"isActive"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}}]}}]} as unknown as DocumentNode<FrameGroupsQuery, FrameGroupsQueryVariables>;
export const CreateFrameGroupDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CreateFrameGroup"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"orgId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"mapId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"frameId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CreateFrameGroupInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createFrameGroup"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"orgId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"orgId"}}},{"kind":"Argument","name":{"kind":"Name","value":"mapId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"mapId"}}},{"kind":"Argument","name":{"kind":"Name","value":"frameId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"frameId"}}},{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]}}]} as unknown as DocumentNode<CreateFrameGroupMutation, CreateFrameGroupMutationVariables>;
export const UpdateFrameGroupDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpdateFrameGroup"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"orgId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"mapId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"frameId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UpdateFrameGroupInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateFrameGroup"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"orgId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"orgId"}}},{"kind":"Argument","name":{"kind":"Name","value":"mapId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"mapId"}}},{"kind":"Argument","name":{"kind":"Name","value":"frameId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"frameId"}}},{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}},{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]}}]} as unknown as DocumentNode<UpdateFrameGroupMutation, UpdateFrameGroupMutationVariables>;
export const DeleteFrameGroupDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"DeleteFrameGroup"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"orgId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"mapId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"frameId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"deleteFrameGroup"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"orgId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"orgId"}}},{"kind":"Argument","name":{"kind":"Name","value":"mapId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"mapId"}}},{"kind":"Argument","name":{"kind":"Name","value":"frameId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"frameId"}}},{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}]}]}}]} as unknown as DocumentNode<DeleteFrameGroupMutation, DeleteFrameGroupMutationVariables>;
export const FrameLinksDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"FrameLinks"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"orgId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"mapId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"frameId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"frameLinks"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"orgId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"orgId"}}},{"kind":"Argument","name":{"kind":"Name","value":"mapId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"mapId"}}},{"kind":"Argument","name":{"kind":"Name","value":"frameId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"frameId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"frameId"}},{"kind":"Field","name":{"kind":"Name","value":"orgId"}},{"kind":"Field","name":{"kind":"Name","value":"kind"}},{"kind":"Field","name":{"kind":"Name","value":"targetFrameId"}},{"kind":"Field","name":{"kind":"Name","value":"targetMapId"}},{"kind":"Field","name":{"kind":"Name","value":"label"}},{"kind":"Field","name":{"kind":"Name","value":"locationX"}},{"kind":"Field","name":{"kind":"Name","value":"locationY"}},{"kind":"Field","name":{"kind":"Name","value":"isActive"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}}]}}]} as unknown as DocumentNode<FrameLinksQuery, FrameLinksQueryVariables>;
export const CreateFrameLinkDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CreateFrameLink"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"orgId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"mapId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"frameId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CreateFrameLinkInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createFrameLink"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"orgId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"orgId"}}},{"kind":"Argument","name":{"kind":"Name","value":"mapId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"mapId"}}},{"kind":"Argument","name":{"kind":"Name","value":"frameId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"frameId"}}},{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]}}]} as unknown as DocumentNode<CreateFrameLinkMutation, CreateFrameLinkMutationVariables>;
export const UpdateFrameLinkDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpdateFrameLink"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"orgId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"mapId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"frameId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UpdateFrameLinkInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateFrameLink"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"orgId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"orgId"}}},{"kind":"Argument","name":{"kind":"Name","value":"mapId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"mapId"}}},{"kind":"Argument","name":{"kind":"Name","value":"frameId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"frameId"}}},{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}},{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]}}]} as unknown as DocumentNode<UpdateFrameLinkMutation, UpdateFrameLinkMutationVariables>;
export const DeleteFrameLinkDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"DeleteFrameLink"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"orgId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"mapId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"frameId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"deleteFrameLink"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"orgId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"orgId"}}},{"kind":"Argument","name":{"kind":"Name","value":"mapId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"mapId"}}},{"kind":"Argument","name":{"kind":"Name","value":"frameId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"frameId"}}},{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}]}]}}]} as unknown as DocumentNode<DeleteFrameLinkMutation, DeleteFrameLinkMutationVariables>;
export const FramesDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"Frames"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"orgId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"mapId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"search"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"sortBy"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"sortDir"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"limit"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"offset"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"frames"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"orgId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"orgId"}}},{"kind":"Argument","name":{"kind":"Name","value":"mapId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"mapId"}}},{"kind":"Argument","name":{"kind":"Name","value":"search"},"value":{"kind":"Variable","name":{"kind":"Name","value":"search"}}},{"kind":"Argument","name":{"kind":"Name","value":"sortBy"},"value":{"kind":"Variable","name":{"kind":"Name","value":"sortBy"}}},{"kind":"Argument","name":{"kind":"Name","value":"sortDir"},"value":{"kind":"Variable","name":{"kind":"Name","value":"sortDir"}}},{"kind":"Argument","name":{"kind":"Name","value":"limit"},"value":{"kind":"Variable","name":{"kind":"Name","value":"limit"}}},{"kind":"Argument","name":{"kind":"Name","value":"offset"},"value":{"kind":"Variable","name":{"kind":"Name","value":"offset"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"totalCount"}},{"kind":"Field","name":{"kind":"Name","value":"items"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"mapId"}},{"kind":"Field","name":{"kind":"Name","value":"orgId"}},{"kind":"Field","name":{"kind":"Name","value":"parentFrameId"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"templateType"}},{"kind":"Field","name":{"kind":"Name","value":"screenshotAssetId"}},{"kind":"Field","name":{"kind":"Name","value":"screenshotImageUrl"}},{"kind":"Field","name":{"kind":"Name","value":"screenshotContentHash"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"order"}},{"kind":"Field","name":{"kind":"Name","value":"source"}},{"kind":"Field","name":{"kind":"Name","value":"focalPointCount"}},{"kind":"Field","name":{"kind":"Name","value":"createdBy"}},{"kind":"Field","name":{"kind":"Name","value":"updatedBy"}},{"kind":"Field","name":{"kind":"Name","value":"createdByCommitHash"}},{"kind":"Field","name":{"kind":"Name","value":"updatedByCommitHash"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}},{"kind":"Field","name":{"kind":"Name","value":"createdByActor"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"avatarUrl"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"email"}}]}},{"kind":"Field","name":{"kind":"Name","value":"updatedByActor"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"avatarUrl"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"email"}}]}}]}}]}}]}}]} as unknown as DocumentNode<FramesQuery, FramesQueryVariables>;
export const FrameDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"Frame"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"orgId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"mapId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"frame"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"orgId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"orgId"}}},{"kind":"Argument","name":{"kind":"Name","value":"mapId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"mapId"}}},{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"mapId"}},{"kind":"Field","name":{"kind":"Name","value":"orgId"}},{"kind":"Field","name":{"kind":"Name","value":"parentFrameId"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"templateType"}},{"kind":"Field","name":{"kind":"Name","value":"screenshotAssetId"}},{"kind":"Field","name":{"kind":"Name","value":"screenshotImageUrl"}},{"kind":"Field","name":{"kind":"Name","value":"screenshotContentHash"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"order"}},{"kind":"Field","name":{"kind":"Name","value":"source"}},{"kind":"Field","name":{"kind":"Name","value":"focalPointCount"}},{"kind":"Field","name":{"kind":"Name","value":"createdBy"}},{"kind":"Field","name":{"kind":"Name","value":"updatedBy"}},{"kind":"Field","name":{"kind":"Name","value":"createdByCommitHash"}},{"kind":"Field","name":{"kind":"Name","value":"updatedByCommitHash"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}},{"kind":"Field","name":{"kind":"Name","value":"createdByActor"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"avatarUrl"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"email"}}]}},{"kind":"Field","name":{"kind":"Name","value":"updatedByActor"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"avatarUrl"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"email"}}]}}]}}]}}]} as unknown as DocumentNode<FrameQuery, FrameQueryVariables>;
export const FrameByIdDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"FrameById"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"orgId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"frameById"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"orgId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"orgId"}}},{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"mapId"}},{"kind":"Field","name":{"kind":"Name","value":"orgId"}},{"kind":"Field","name":{"kind":"Name","value":"parentFrameId"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"templateType"}},{"kind":"Field","name":{"kind":"Name","value":"screenshotAssetId"}},{"kind":"Field","name":{"kind":"Name","value":"screenshotImageUrl"}},{"kind":"Field","name":{"kind":"Name","value":"screenshotContentHash"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"order"}},{"kind":"Field","name":{"kind":"Name","value":"source"}},{"kind":"Field","name":{"kind":"Name","value":"focalPointCount"}},{"kind":"Field","name":{"kind":"Name","value":"createdBy"}},{"kind":"Field","name":{"kind":"Name","value":"updatedBy"}},{"kind":"Field","name":{"kind":"Name","value":"createdByCommitHash"}},{"kind":"Field","name":{"kind":"Name","value":"updatedByCommitHash"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}},{"kind":"Field","name":{"kind":"Name","value":"createdByActor"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"avatarUrl"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"email"}}]}},{"kind":"Field","name":{"kind":"Name","value":"updatedByActor"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"avatarUrl"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"email"}}]}}]}}]}}]} as unknown as DocumentNode<FrameByIdQuery, FrameByIdQueryVariables>;
export const CreateFrameDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CreateFrame"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"orgId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"mapId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CreateFrameInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createFrame"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"orgId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"orgId"}}},{"kind":"Argument","name":{"kind":"Name","value":"mapId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"mapId"}}},{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]}}]} as unknown as DocumentNode<CreateFrameMutation, CreateFrameMutationVariables>;
export const UpdateFrameDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpdateFrame"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"orgId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"mapId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UpdateFrameInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateFrame"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"orgId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"orgId"}}},{"kind":"Argument","name":{"kind":"Name","value":"mapId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"mapId"}}},{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}},{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]}}]} as unknown as DocumentNode<UpdateFrameMutation, UpdateFrameMutationVariables>;
export const DeleteFrameDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"DeleteFrame"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"orgId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"mapId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"deleteFrame"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"orgId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"orgId"}}},{"kind":"Argument","name":{"kind":"Name","value":"mapId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"mapId"}}},{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}]}]}}]} as unknown as DocumentNode<DeleteFrameMutation, DeleteFrameMutationVariables>;
export const MapsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"Maps"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"orgId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"folderId"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"teamId"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"search"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"sortBy"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"sortDir"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"limit"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"offset"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"maps"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"orgId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"orgId"}}},{"kind":"Argument","name":{"kind":"Name","value":"folderId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"folderId"}}},{"kind":"Argument","name":{"kind":"Name","value":"teamId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"teamId"}}},{"kind":"Argument","name":{"kind":"Name","value":"search"},"value":{"kind":"Variable","name":{"kind":"Name","value":"search"}}},{"kind":"Argument","name":{"kind":"Name","value":"sortBy"},"value":{"kind":"Variable","name":{"kind":"Name","value":"sortBy"}}},{"kind":"Argument","name":{"kind":"Name","value":"sortDir"},"value":{"kind":"Variable","name":{"kind":"Name","value":"sortDir"}}},{"kind":"Argument","name":{"kind":"Name","value":"limit"},"value":{"kind":"Variable","name":{"kind":"Name","value":"limit"}}},{"kind":"Argument","name":{"kind":"Name","value":"offset"},"value":{"kind":"Variable","name":{"kind":"Name","value":"offset"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"totalCount"}},{"kind":"Field","name":{"kind":"Name","value":"items"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"orgId"}},{"kind":"Field","name":{"kind":"Name","value":"folderId"}},{"kind":"Field","name":{"kind":"Name","value":"teamId"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"createdBy"}},{"kind":"Field","name":{"kind":"Name","value":"updatedBy"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}},{"kind":"Field","name":{"kind":"Name","value":"previewImgUrls"}}]}}]}}]}}]} as unknown as DocumentNode<MapsQuery, MapsQueryVariables>;
export const MapDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"Map"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"orgId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"map"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"orgId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"orgId"}}},{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"orgId"}},{"kind":"Field","name":{"kind":"Name","value":"folderId"}},{"kind":"Field","name":{"kind":"Name","value":"teamId"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"createdBy"}},{"kind":"Field","name":{"kind":"Name","value":"updatedBy"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}}]}}]} as unknown as DocumentNode<MapQuery, MapQueryVariables>;
export const CreateMapDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CreateMap"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"orgId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CreateMapInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createMap"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"orgId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"orgId"}}},{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]}}]} as unknown as DocumentNode<CreateMapMutation, CreateMapMutationVariables>;
export const UpdateMapDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpdateMap"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"orgId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UpdateMapInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateMap"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"orgId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"orgId"}}},{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}},{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]}}]} as unknown as DocumentNode<UpdateMapMutation, UpdateMapMutationVariables>;
export const DeleteMapDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"DeleteMap"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"orgId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"deleteMap"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"orgId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"orgId"}}},{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}]}]}}]} as unknown as DocumentNode<DeleteMapMutation, DeleteMapMutationVariables>;
export const MeDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"Me"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"me"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"userId"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"avatarUrl"}}]}}]}}]} as unknown as DocumentNode<MeQuery, MeQueryVariables>;
export const MembersDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"Members"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"orgId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"members"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"orgId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"orgId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"userId"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"avatarUrl"}},{"kind":"Field","name":{"kind":"Name","value":"role"}},{"kind":"Field","name":{"kind":"Name","value":"teamId"}}]}}]}}]} as unknown as DocumentNode<MembersQuery, MembersQueryVariables>;
export const AddMemberDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"AddMember"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"orgId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"AddMemberInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"addMember"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"orgId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"orgId"}}},{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"userId"}}]}}]}}]} as unknown as DocumentNode<AddMemberMutation, AddMemberMutationVariables>;
export const UpdateMemberDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpdateMember"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"orgId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"userId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UpdateMemberInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateMember"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"orgId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"orgId"}}},{"kind":"Argument","name":{"kind":"Name","value":"userId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"userId"}}},{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"userId"}}]}}]}}]} as unknown as DocumentNode<UpdateMemberMutation, UpdateMemberMutationVariables>;
export const RemoveMemberDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"RemoveMember"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"orgId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"userId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"removeMember"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"orgId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"orgId"}}},{"kind":"Argument","name":{"kind":"Name","value":"userId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"userId"}}}]}]}}]} as unknown as DocumentNode<RemoveMemberMutation, RemoveMemberMutationVariables>;
export const SettingsTeamsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"SettingsTeams"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"orgId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"teams"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"orgId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"orgId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"memberCount"}}]}}]}}]} as unknown as DocumentNode<SettingsTeamsQuery, SettingsTeamsQueryVariables>;
export const CreateTeamDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CreateTeam"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"orgId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CreateTeamInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createTeam"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"orgId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"orgId"}}},{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]}}]} as unknown as DocumentNode<CreateTeamMutation, CreateTeamMutationVariables>;
export const UpdateTeamDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpdateTeam"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"orgId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"teamId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UpdateTeamInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateTeam"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"orgId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"orgId"}}},{"kind":"Argument","name":{"kind":"Name","value":"teamId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"teamId"}}},{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]}}]} as unknown as DocumentNode<UpdateTeamMutation, UpdateTeamMutationVariables>;
export const DeleteTeamDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"DeleteTeam"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"orgId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"teamId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"deleteTeam"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"orgId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"orgId"}}},{"kind":"Argument","name":{"kind":"Name","value":"teamId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"teamId"}}}]}]}}]} as unknown as DocumentNode<DeleteTeamMutation, DeleteTeamMutationVariables>;
export const UpdateUserDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpdateUser"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UpdateUserInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateUser"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}},{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}}]}}]} as unknown as DocumentNode<UpdateUserMutation, UpdateUserMutationVariables>;
export const PrepareUserAvatarUploadDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"PrepareUserAvatarUpload"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"prepareUserAvatarUpload"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"assetId"}},{"kind":"Field","name":{"kind":"Name","value":"uploadUrl"}}]}}]}}]} as unknown as DocumentNode<PrepareUserAvatarUploadMutation, PrepareUserAvatarUploadMutationVariables>;
export const SetMyAvatarDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"SetMyAvatar"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"setMyAvatar"}}]}}]} as unknown as DocumentNode<SetMyAvatarMutation, SetMyAvatarMutationVariables>;
export const ServiceAccountsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"ServiceAccounts"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"orgId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"serviceAccounts"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"orgId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"orgId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"orgId"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"scopes"}},{"kind":"Field","name":{"kind":"Name","value":"disabled"}},{"kind":"Field","name":{"kind":"Name","value":"isInternal"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}}]}}]} as unknown as DocumentNode<ServiceAccountsQuery, ServiceAccountsQueryVariables>;
export const ServiceAccountScopesDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"ServiceAccountScopes"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"orgId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"serviceAccountScopes"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"orgId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"orgId"}}}]}]}}]} as unknown as DocumentNode<ServiceAccountScopesQuery, ServiceAccountScopesQueryVariables>;
export const ServiceAccountTokensDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"ServiceAccountTokens"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"orgId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"saId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"serviceAccountTokens"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"orgId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"orgId"}}},{"kind":"Argument","name":{"kind":"Name","value":"saId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"saId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"serviceAccountId"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"prefix"}},{"kind":"Field","name":{"kind":"Name","value":"expiresAt"}},{"kind":"Field","name":{"kind":"Name","value":"lastUsedAt"}},{"kind":"Field","name":{"kind":"Name","value":"revoked"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}}]}}]}}]} as unknown as DocumentNode<ServiceAccountTokensQuery, ServiceAccountTokensQueryVariables>;
export const CreateServiceAccountDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CreateServiceAccount"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"orgId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CreateServiceAccountInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createServiceAccount"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"orgId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"orgId"}}},{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]}}]} as unknown as DocumentNode<CreateServiceAccountMutation, CreateServiceAccountMutationVariables>;
export const UpdateServiceAccountDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpdateServiceAccount"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"orgId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UpdateServiceAccountInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateServiceAccount"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"orgId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"orgId"}}},{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}},{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]}}]} as unknown as DocumentNode<UpdateServiceAccountMutation, UpdateServiceAccountMutationVariables>;
export const DeleteServiceAccountDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"DeleteServiceAccount"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"orgId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"deleteServiceAccount"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"orgId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"orgId"}}},{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}]}]}}]} as unknown as DocumentNode<DeleteServiceAccountMutation, DeleteServiceAccountMutationVariables>;
export const CreateServiceAccountTokenDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CreateServiceAccountToken"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"orgId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"saId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CreateTokenInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createServiceAccountToken"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"orgId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"orgId"}}},{"kind":"Argument","name":{"kind":"Name","value":"saId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"saId"}}},{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"token"}}]}}]}}]} as unknown as DocumentNode<CreateServiceAccountTokenMutation, CreateServiceAccountTokenMutationVariables>;
export const RevokeServiceAccountTokenDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"RevokeServiceAccountToken"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"orgId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"saId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"tokenId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"revokeServiceAccountToken"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"orgId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"orgId"}}},{"kind":"Argument","name":{"kind":"Name","value":"saId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"saId"}}},{"kind":"Argument","name":{"kind":"Name","value":"tokenId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"tokenId"}}}]}]}}]} as unknown as DocumentNode<RevokeServiceAccountTokenMutation, RevokeServiceAccountTokenMutationVariables>;
export const PrepareServiceAccountAvatarUploadDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"PrepareServiceAccountAvatarUpload"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"orgId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"saId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"prepareServiceAccountAvatarUpload"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"orgId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"orgId"}}},{"kind":"Argument","name":{"kind":"Name","value":"saId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"saId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"assetId"}},{"kind":"Field","name":{"kind":"Name","value":"uploadUrl"}}]}}]}}]} as unknown as DocumentNode<PrepareServiceAccountAvatarUploadMutation, PrepareServiceAccountAvatarUploadMutationVariables>;
export const SetServiceAccountAvatarDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"SetServiceAccountAvatar"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"orgId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"saId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"setServiceAccountAvatar"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"orgId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"orgId"}}},{"kind":"Argument","name":{"kind":"Name","value":"saId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"saId"}}}]}]}}]} as unknown as DocumentNode<SetServiceAccountAvatarMutation, SetServiceAccountAvatarMutationVariables>;
export const DiagramDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"Diagram"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"orgId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"diagram"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"orgId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"orgId"}}},{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"orgId"}},{"kind":"Field","name":{"kind":"Name","value":"folderId"}},{"kind":"Field","name":{"kind":"Name","value":"teamId"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"previewAssetId"}},{"kind":"Field","name":{"kind":"Name","value":"previewImageUrl"}},{"kind":"Field","name":{"kind":"Name","value":"previewContentHash"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}}]}}]} as unknown as DocumentNode<DiagramQuery, DiagramQueryVariables>;
export const DiagramContentDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"DiagramContent"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"orgId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"diagramContent"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"orgId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"orgId"}}},{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"diagramId"}},{"kind":"Field","name":{"kind":"Name","value":"content"}}]}}]}}]} as unknown as DocumentNode<DiagramContentQuery, DiagramContentQueryVariables>;
export const UpdateDiagramDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpdateDiagram"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"orgId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UpdateDiagramInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateDiagram"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"orgId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"orgId"}}},{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}},{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}}]}}]} as unknown as DocumentNode<UpdateDiagramMutation, UpdateDiagramMutationVariables>;
export const FlowDiagramComponentsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"FlowDiagramComponents"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"orgId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"flowDiagramComponents"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"orgId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"orgId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"components"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"componentId"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"category"}},{"kind":"Field","name":{"kind":"Name","value":"tags"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"previewImageJpg"}},{"kind":"Field","name":{"kind":"Name","value":"isActive"}},{"kind":"Field","name":{"kind":"Name","value":"order"}},{"kind":"Field","name":{"kind":"Name","value":"flowDiagramComponentFields"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"flowDiagramComponentFieldId"}},{"kind":"Field","name":{"kind":"Name","value":"label"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"required"}},{"kind":"Field","name":{"kind":"Name","value":"readonly"}},{"kind":"Field","name":{"kind":"Name","value":"options"}},{"kind":"Field","name":{"kind":"Name","value":"order"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"customComponents"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"componentId"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"category"}},{"kind":"Field","name":{"kind":"Name","value":"tags"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"previewImageJpg"}},{"kind":"Field","name":{"kind":"Name","value":"isActive"}},{"kind":"Field","name":{"kind":"Name","value":"order"}},{"kind":"Field","name":{"kind":"Name","value":"organizationId"}},{"kind":"Field","name":{"kind":"Name","value":"flowDiagramComponentFields"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"flowDiagramComponentFieldId"}},{"kind":"Field","name":{"kind":"Name","value":"label"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"required"}},{"kind":"Field","name":{"kind":"Name","value":"readonly"}},{"kind":"Field","name":{"kind":"Name","value":"options"}},{"kind":"Field","name":{"kind":"Name","value":"order"}}]}}]}}]}}]}}]} as unknown as DocumentNode<FlowDiagramComponentsQuery, FlowDiagramComponentsQueryVariables>;
export const DiagramImagesDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"DiagramImages"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"orgId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"diagramId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"diagramImages"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"orgId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"orgId"}}},{"kind":"Argument","name":{"kind":"Name","value":"diagramId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"diagramId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"diagramImageId"}},{"kind":"Field","name":{"kind":"Name","value":"diagramId"}},{"kind":"Field","name":{"kind":"Name","value":"assetId"}},{"kind":"Field","name":{"kind":"Name","value":"imageUrl"}},{"kind":"Field","name":{"kind":"Name","value":"fileName"}},{"kind":"Field","name":{"kind":"Name","value":"order"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}}]}}]}}]} as unknown as DocumentNode<DiagramImagesQuery, DiagramImagesQueryVariables>;
export const CreateDiagramImageDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CreateDiagramImage"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"orgId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"diagramId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CreateDiagramImageInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createDiagramImage"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"orgId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"orgId"}}},{"kind":"Argument","name":{"kind":"Name","value":"diagramId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"diagramId"}}},{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"diagramImageId"}},{"kind":"Field","name":{"kind":"Name","value":"assetId"}},{"kind":"Field","name":{"kind":"Name","value":"imageUrl"}},{"kind":"Field","name":{"kind":"Name","value":"fileName"}},{"kind":"Field","name":{"kind":"Name","value":"order"}}]}}]}}]} as unknown as DocumentNode<CreateDiagramImageMutation, CreateDiagramImageMutationVariables>;
export const PrepareDiagramThumbnailUploadDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"PrepareDiagramThumbnailUpload"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"orgId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"diagramId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"prepareDiagramThumbnailUpload"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"orgId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"orgId"}}},{"kind":"Argument","name":{"kind":"Name","value":"diagramId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"diagramId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"uploadUrl"}},{"kind":"Field","name":{"kind":"Name","value":"assetId"}}]}}]}}]} as unknown as DocumentNode<PrepareDiagramThumbnailUploadMutation, PrepareDiagramThumbnailUploadMutationVariables>;
export const ConfirmDiagramThumbnailUploadDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"ConfirmDiagramThumbnailUpload"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"orgId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"diagramId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"contentHash"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"confirmDiagramThumbnailUpload"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"orgId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"orgId"}}},{"kind":"Argument","name":{"kind":"Name","value":"diagramId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"diagramId"}}},{"kind":"Argument","name":{"kind":"Name","value":"contentHash"},"value":{"kind":"Variable","name":{"kind":"Name","value":"contentHash"}}}]}]}}]} as unknown as DocumentNode<ConfirmDiagramThumbnailUploadMutation, ConfirmDiagramThumbnailUploadMutationVariables>;
export const DiagramVersionsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"DiagramVersions"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"orgId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"diagramId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"diagramVersions"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"orgId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"orgId"}}},{"kind":"Argument","name":{"kind":"Name","value":"diagramId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"diagramId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"diagramId"}},{"kind":"Field","name":{"kind":"Name","value":"versionNumber"}},{"kind":"Field","name":{"kind":"Name","value":"label"}},{"kind":"Field","name":{"kind":"Name","value":"isAutoVersion"}},{"kind":"Field","name":{"kind":"Name","value":"createdBy"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"createdByActor"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"avatarUrl"}}]}}]}}]}}]} as unknown as DocumentNode<DiagramVersionsQuery, DiagramVersionsQueryVariables>;
export const DiagramVersionContentDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"DiagramVersionContent"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"orgId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"diagramId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"versionId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"diagramVersionContent"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"orgId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"orgId"}}},{"kind":"Argument","name":{"kind":"Name","value":"diagramId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"diagramId"}}},{"kind":"Argument","name":{"kind":"Name","value":"versionId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"versionId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"diagramId"}},{"kind":"Field","name":{"kind":"Name","value":"content"}}]}}]}}]} as unknown as DocumentNode<DiagramVersionContentQuery, DiagramVersionContentQueryVariables>;
export const CreateDiagramVersionDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CreateDiagramVersion"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"orgId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"diagramId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"label"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createDiagramVersion"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"orgId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"orgId"}}},{"kind":"Argument","name":{"kind":"Name","value":"diagramId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"diagramId"}}},{"kind":"Argument","name":{"kind":"Name","value":"label"},"value":{"kind":"Variable","name":{"kind":"Name","value":"label"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"versionNumber"}}]}}]}}]} as unknown as DocumentNode<CreateDiagramVersionMutation, CreateDiagramVersionMutationVariables>;
export const RestoreDiagramVersionDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"RestoreDiagramVersion"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"orgId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"diagramId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"versionId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"restoreDiagramVersion"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"orgId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"orgId"}}},{"kind":"Argument","name":{"kind":"Name","value":"diagramId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"diagramId"}}},{"kind":"Argument","name":{"kind":"Name","value":"versionId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"versionId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]}}]} as unknown as DocumentNode<RestoreDiagramVersionMutation, RestoreDiagramVersionMutationVariables>;
export const ApiEndpointByIdDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"ApiEndpointById"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"orgId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"apiEndpointById"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"orgId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"orgId"}}},{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"serviceId"}},{"kind":"Field","name":{"kind":"Name","value":"apiGroupId"}},{"kind":"Field","name":{"kind":"Name","value":"method"}},{"kind":"Field","name":{"kind":"Name","value":"path"}},{"kind":"Field","name":{"kind":"Name","value":"summary"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"tags"}},{"kind":"Field","name":{"kind":"Name","value":"parameters"}},{"kind":"Field","name":{"kind":"Name","value":"requestBody"}},{"kind":"Field","name":{"kind":"Name","value":"responses"}},{"kind":"Field","name":{"kind":"Name","value":"exampleRequests"}},{"kind":"Field","name":{"kind":"Name","value":"exampleResponses"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}}]}}]}}]} as unknown as DocumentNode<ApiEndpointByIdQuery, ApiEndpointByIdQueryVariables>;
export const TestPackByIdDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"TestPackById"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"orgId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"testPackById"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"orgId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"orgId"}}},{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"testPackId"}},{"kind":"Field","name":{"kind":"Name","value":"serviceId"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}}]}}]} as unknown as DocumentNode<TestPackByIdQuery, TestPackByIdQueryVariables>;
export const ServiceDocByIdDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"ServiceDocById"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"orgId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"serviceDocById"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"orgId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"orgId"}}},{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"serviceId"}},{"kind":"Field","name":{"kind":"Name","value":"docId"}}]}}]}}]} as unknown as DocumentNode<ServiceDocByIdQuery, ServiceDocByIdQueryVariables>;
export const DocByIdDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"DocById"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"orgId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"doc"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"orgId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"orgId"}}},{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"fileUrl"}},{"kind":"Field","name":{"kind":"Name","value":"fileName"}},{"kind":"Field","name":{"kind":"Name","value":"fileType"}}]}}]}}]} as unknown as DocumentNode<DocByIdQuery, DocByIdQueryVariables>;
export const FocalPointMetaDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"FocalPointMeta"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"orgId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"mapId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"frameId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"focalPointId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"focalPointMeta"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"orgId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"orgId"}}},{"kind":"Argument","name":{"kind":"Name","value":"mapId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"mapId"}}},{"kind":"Argument","name":{"kind":"Name","value":"frameId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"frameId"}}},{"kind":"Argument","name":{"kind":"Name","value":"focalPointId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"focalPointId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"focalPointId"}},{"kind":"Field","name":{"kind":"Name","value":"orgId"}},{"kind":"Field","name":{"kind":"Name","value":"frameId"}},{"kind":"Field","name":{"kind":"Name","value":"componentId"}},{"kind":"Field","name":{"kind":"Name","value":"componentLinkDiagramId"}},{"kind":"Field","name":{"kind":"Name","value":"componentLinkApiEndpointId"}},{"kind":"Field","name":{"kind":"Name","value":"componentLinkTestPackId"}},{"kind":"Field","name":{"kind":"Name","value":"componentLinkServiceDocId"}},{"kind":"Field","name":{"kind":"Name","value":"createdBy"}},{"kind":"Field","name":{"kind":"Name","value":"componentModalFields"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"componentFieldId"}},{"kind":"Field","name":{"kind":"Name","value":"label"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"required"}},{"kind":"Field","name":{"kind":"Name","value":"isReadonly"}},{"kind":"Field","name":{"kind":"Name","value":"data"}},{"kind":"Field","name":{"kind":"Name","value":"options"}},{"kind":"Field","name":{"kind":"Name","value":"order"}}]}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}}]}}]} as unknown as DocumentNode<FocalPointMetaQuery, FocalPointMetaQueryVariables>;
export const FocalPointMetaByLinkDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"FocalPointMetaByLink"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"orgId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"linkId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"focalPointMetaByLink"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"orgId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"orgId"}}},{"kind":"Argument","name":{"kind":"Name","value":"linkId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"linkId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"focalPointId"}},{"kind":"Field","name":{"kind":"Name","value":"orgId"}},{"kind":"Field","name":{"kind":"Name","value":"frameId"}},{"kind":"Field","name":{"kind":"Name","value":"componentId"}},{"kind":"Field","name":{"kind":"Name","value":"componentLinkDiagramId"}},{"kind":"Field","name":{"kind":"Name","value":"componentLinkApiEndpointId"}},{"kind":"Field","name":{"kind":"Name","value":"componentLinkTestPackId"}},{"kind":"Field","name":{"kind":"Name","value":"componentLinkServiceDocId"}},{"kind":"Field","name":{"kind":"Name","value":"createdBy"}},{"kind":"Field","name":{"kind":"Name","value":"componentModalFields"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"componentFieldId"}},{"kind":"Field","name":{"kind":"Name","value":"label"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"required"}},{"kind":"Field","name":{"kind":"Name","value":"isReadonly"}},{"kind":"Field","name":{"kind":"Name","value":"data"}},{"kind":"Field","name":{"kind":"Name","value":"options"}},{"kind":"Field","name":{"kind":"Name","value":"order"}}]}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}}]}}]} as unknown as DocumentNode<FocalPointMetaByLinkQuery, FocalPointMetaByLinkQueryVariables>;
export const ComponentLinkUsagesDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"ComponentLinkUsages"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"orgId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"linkId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"componentLinkUsages"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"orgId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"orgId"}}},{"kind":"Argument","name":{"kind":"Name","value":"linkId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"linkId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"metaId"}},{"kind":"Field","name":{"kind":"Name","value":"orgId"}},{"kind":"Field","name":{"kind":"Name","value":"componentId"}},{"kind":"Field","name":{"kind":"Name","value":"mapId"}},{"kind":"Field","name":{"kind":"Name","value":"mapName"}},{"kind":"Field","name":{"kind":"Name","value":"frameId"}},{"kind":"Field","name":{"kind":"Name","value":"frameName"}},{"kind":"Field","name":{"kind":"Name","value":"screenshotImageUrl"}},{"kind":"Field","name":{"kind":"Name","value":"focalPointId"}},{"kind":"Field","name":{"kind":"Name","value":"focalPointName"}},{"kind":"Field","name":{"kind":"Name","value":"locationX"}},{"kind":"Field","name":{"kind":"Name","value":"locationY"}}]}}]}}]} as unknown as DocumentNode<ComponentLinkUsagesQuery, ComponentLinkUsagesQueryVariables>;
export const CreateFocalPointMetaDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CreateFocalPointMeta"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"orgId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"mapId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"frameId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"focalPointId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CreateFocalPointMetaInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createFocalPointMeta"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"orgId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"orgId"}}},{"kind":"Argument","name":{"kind":"Name","value":"mapId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"mapId"}}},{"kind":"Argument","name":{"kind":"Name","value":"frameId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"frameId"}}},{"kind":"Argument","name":{"kind":"Name","value":"focalPointId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"focalPointId"}}},{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]}}]} as unknown as DocumentNode<CreateFocalPointMetaMutation, CreateFocalPointMetaMutationVariables>;
export const UpdateFocalPointMetaDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpdateFocalPointMeta"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"orgId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"mapId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"frameId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"focalPointId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UpdateFocalPointMetaInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateFocalPointMeta"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"orgId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"orgId"}}},{"kind":"Argument","name":{"kind":"Name","value":"mapId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"mapId"}}},{"kind":"Argument","name":{"kind":"Name","value":"frameId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"frameId"}}},{"kind":"Argument","name":{"kind":"Name","value":"focalPointId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"focalPointId"}}},{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}},{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]}}]} as unknown as DocumentNode<UpdateFocalPointMetaMutation, UpdateFocalPointMetaMutationVariables>;
export const DeleteFocalPointMetaDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"DeleteFocalPointMeta"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"orgId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"mapId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"frameId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"focalPointId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"deleteFocalPointMeta"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"orgId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"orgId"}}},{"kind":"Argument","name":{"kind":"Name","value":"mapId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"mapId"}}},{"kind":"Argument","name":{"kind":"Name","value":"frameId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"frameId"}}},{"kind":"Argument","name":{"kind":"Name","value":"focalPointId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"focalPointId"}}},{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}]}]}}]} as unknown as DocumentNode<DeleteFocalPointMetaMutation, DeleteFocalPointMetaMutationVariables>;
export const MlStudioProjectsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"MlStudioProjects"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"orgId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"mlProjects"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"orgId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"orgId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"sourceType"}},{"kind":"Field","name":{"kind":"Name","value":"sourceUrl"}},{"kind":"Field","name":{"kind":"Name","value":"teamId"}},{"kind":"Field","name":{"kind":"Name","value":"stats"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"modelCount"}},{"kind":"Field","name":{"kind":"Name","value":"experimentCount"}},{"kind":"Field","name":{"kind":"Name","value":"runCount"}}]}}]}}]}}]} as unknown as DocumentNode<MlStudioProjectsQuery, MlStudioProjectsQueryVariables>;
export const MlStudioProjectDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"MlStudioProject"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"orgId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"mlProject"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"orgId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"orgId"}}},{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"sourceType"}},{"kind":"Field","name":{"kind":"Name","value":"sourceUrl"}},{"kind":"Field","name":{"kind":"Name","value":"teamId"}}]}}]}}]} as unknown as DocumentNode<MlStudioProjectQuery, MlStudioProjectQueryVariables>;
export const MlStudioModelDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"MlStudioModel"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"orgId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"mlModel"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"orgId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"orgId"}}},{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"projectId"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"domain"}},{"kind":"Field","name":{"kind":"Name","value":"problemType"}},{"kind":"Field","name":{"kind":"Name","value":"tags"}},{"kind":"Field","name":{"kind":"Name","value":"owners"}},{"kind":"Field","name":{"kind":"Name","value":"license"}},{"kind":"Field","name":{"kind":"Name","value":"references"}},{"kind":"Field","name":{"kind":"Name","value":"intendedUse"}},{"kind":"Field","name":{"kind":"Name","value":"limitations"}},{"kind":"Field","name":{"kind":"Name","value":"ethicalConsiderations"}},{"kind":"Field","name":{"kind":"Name","value":"caveats"}},{"kind":"Field","name":{"kind":"Name","value":"productionVersionId"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}}]}}]} as unknown as DocumentNode<MlStudioModelQuery, MlStudioModelQueryVariables>;
export const MlStudioModelsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"MlStudioModels"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"orgId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"projectId"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"mlModels"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"orgId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"orgId"}}},{"kind":"Argument","name":{"kind":"Name","value":"projectId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"projectId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"projectId"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"domain"}},{"kind":"Field","name":{"kind":"Name","value":"problemType"}},{"kind":"Field","name":{"kind":"Name","value":"tags"}},{"kind":"Field","name":{"kind":"Name","value":"owners"}},{"kind":"Field","name":{"kind":"Name","value":"license"}},{"kind":"Field","name":{"kind":"Name","value":"references"}},{"kind":"Field","name":{"kind":"Name","value":"intendedUse"}},{"kind":"Field","name":{"kind":"Name","value":"limitations"}},{"kind":"Field","name":{"kind":"Name","value":"ethicalConsiderations"}},{"kind":"Field","name":{"kind":"Name","value":"caveats"}},{"kind":"Field","name":{"kind":"Name","value":"productionVersionId"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}}]}}]} as unknown as DocumentNode<MlStudioModelsQuery, MlStudioModelsQueryVariables>;
export const MlStudioVersionsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"MlStudioVersions"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"orgId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"mlModelVersions"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"orgId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"orgId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"modelId"}},{"kind":"Field","name":{"kind":"Name","value":"version"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"deploymentStatus"}},{"kind":"Field","name":{"kind":"Name","value":"runId"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}}]}}]}}]} as unknown as DocumentNode<MlStudioVersionsQuery, MlStudioVersionsQueryVariables>;
export const MlStudioModelVersionsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"MlStudioModelVersions"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"orgId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"modelId"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"projectId"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"mlModelVersions"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"orgId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"orgId"}}},{"kind":"Argument","name":{"kind":"Name","value":"modelId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"modelId"}}},{"kind":"Argument","name":{"kind":"Name","value":"projectId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"projectId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"modelId"}},{"kind":"Field","name":{"kind":"Name","value":"version"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"deploymentStatus"}},{"kind":"Field","name":{"kind":"Name","value":"runId"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}}]}}]}}]} as unknown as DocumentNode<MlStudioModelVersionsQuery, MlStudioModelVersionsQueryVariables>;
export const MlStudioModelVersionDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"MlStudioModelVersion"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"orgId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"mlModelVersion"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"orgId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"orgId"}}},{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"modelId"}},{"kind":"Field","name":{"kind":"Name","value":"version"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"deploymentStatus"}},{"kind":"Field","name":{"kind":"Name","value":"runId"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}}]}}]}}]} as unknown as DocumentNode<MlStudioModelVersionQuery, MlStudioModelVersionQueryVariables>;
export const MlVersionDeploymentUpdatesDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"MlVersionDeploymentUpdates"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"orgId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"versionId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"mlVersionDeploymentUpdates"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"orgId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"orgId"}}},{"kind":"Argument","name":{"kind":"Name","value":"versionId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"versionId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"versionId"}},{"kind":"Field","name":{"kind":"Name","value":"fromStatus"}},{"kind":"Field","name":{"kind":"Name","value":"toStatus"}},{"kind":"Field","name":{"kind":"Name","value":"changedBy"}},{"kind":"Field","name":{"kind":"Name","value":"changedAt"}}]}}]}}]} as unknown as DocumentNode<MlVersionDeploymentUpdatesQuery, MlVersionDeploymentUpdatesQueryVariables>;
export const MlStudioDeploymentUpdatesDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"MlStudioDeploymentUpdates"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"orgId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"projectId"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"mlVersionDeploymentUpdates"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"orgId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"orgId"}}},{"kind":"Argument","name":{"kind":"Name","value":"projectId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"projectId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"versionId"}},{"kind":"Field","name":{"kind":"Name","value":"fromStatus"}},{"kind":"Field","name":{"kind":"Name","value":"toStatus"}},{"kind":"Field","name":{"kind":"Name","value":"changedBy"}},{"kind":"Field","name":{"kind":"Name","value":"changedAt"}}]}}]}}]} as unknown as DocumentNode<MlStudioDeploymentUpdatesQuery, MlStudioDeploymentUpdatesQueryVariables>;
export const MlStudioExperimentDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"MlStudioExperiment"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"orgId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"mlExperiment"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"orgId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"orgId"}}},{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"projectId"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"startedAt"}}]}}]}}]} as unknown as DocumentNode<MlStudioExperimentQuery, MlStudioExperimentQueryVariables>;
export const MlStudioExperimentsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"MlStudioExperiments"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"orgId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"projectId"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"mlExperiments"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"orgId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"orgId"}}},{"kind":"Argument","name":{"kind":"Name","value":"projectId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"projectId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"projectId"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"startedAt"}}]}}]}}]} as unknown as DocumentNode<MlStudioExperimentsQuery, MlStudioExperimentsQueryVariables>;
export const MlStudioRunDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"MlStudioRun"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"orgId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"mlRun"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"orgId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"orgId"}}},{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"experimentId"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"startedAt"}},{"kind":"Field","name":{"kind":"Name","value":"endedAt"}},{"kind":"Field","name":{"kind":"Name","value":"duration"}},{"kind":"Field","name":{"kind":"Name","value":"notes"}},{"kind":"Field","name":{"kind":"Name","value":"parameters"}},{"kind":"Field","name":{"kind":"Name","value":"metrics"}},{"kind":"Field","name":{"kind":"Name","value":"datasetId"}},{"kind":"Field","name":{"kind":"Name","value":"series"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}},{"kind":"Field","name":{"kind":"Name","value":"syncedAt"}}]}}]}}]} as unknown as DocumentNode<MlStudioRunQuery, MlStudioRunQueryVariables>;
export const MlStudioExperimentRunsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"MlStudioExperimentRuns"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"orgId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"experimentId"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"projectId"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"mlRuns"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"orgId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"orgId"}}},{"kind":"Argument","name":{"kind":"Name","value":"experimentId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"experimentId"}}},{"kind":"Argument","name":{"kind":"Name","value":"projectId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"projectId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"experimentId"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"startedAt"}},{"kind":"Field","name":{"kind":"Name","value":"endedAt"}},{"kind":"Field","name":{"kind":"Name","value":"duration"}},{"kind":"Field","name":{"kind":"Name","value":"notes"}},{"kind":"Field","name":{"kind":"Name","value":"parameters"}},{"kind":"Field","name":{"kind":"Name","value":"metrics"}},{"kind":"Field","name":{"kind":"Name","value":"datasetId"}},{"kind":"Field","name":{"kind":"Name","value":"series"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}},{"kind":"Field","name":{"kind":"Name","value":"syncedAt"}}]}}]}}]} as unknown as DocumentNode<MlStudioExperimentRunsQuery, MlStudioExperimentRunsQueryVariables>;
export const MlStudioRunsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"MlStudioRuns"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"orgId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"mlRuns"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"orgId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"orgId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"experimentId"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"startedAt"}},{"kind":"Field","name":{"kind":"Name","value":"endedAt"}},{"kind":"Field","name":{"kind":"Name","value":"duration"}},{"kind":"Field","name":{"kind":"Name","value":"notes"}},{"kind":"Field","name":{"kind":"Name","value":"parameters"}},{"kind":"Field","name":{"kind":"Name","value":"metrics"}},{"kind":"Field","name":{"kind":"Name","value":"datasetId"}},{"kind":"Field","name":{"kind":"Name","value":"series"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}},{"kind":"Field","name":{"kind":"Name","value":"syncedAt"}}]}}]}}]} as unknown as DocumentNode<MlStudioRunsQuery, MlStudioRunsQueryVariables>;
export const MlStudioArtifactsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"MlStudioArtifacts"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"orgId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"mlArtifacts"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"orgId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"orgId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"runId"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"uri"}},{"kind":"Field","name":{"kind":"Name","value":"size"}},{"kind":"Field","name":{"kind":"Name","value":"format"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}},{"kind":"Field","name":{"kind":"Name","value":"syncedAt"}}]}}]}}]} as unknown as DocumentNode<MlStudioArtifactsQuery, MlStudioArtifactsQueryVariables>;
export const MlStudioRunArtifactsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"MlStudioRunArtifacts"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"orgId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"runId"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"mlArtifacts"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"orgId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"orgId"}}},{"kind":"Argument","name":{"kind":"Name","value":"runId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"runId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"runId"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"uri"}},{"kind":"Field","name":{"kind":"Name","value":"size"}},{"kind":"Field","name":{"kind":"Name","value":"format"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}},{"kind":"Field","name":{"kind":"Name","value":"syncedAt"}}]}}]}}]} as unknown as DocumentNode<MlStudioRunArtifactsQuery, MlStudioRunArtifactsQueryVariables>;
export const MlStudioDatasetDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"MlStudioDataset"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"orgId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"mlDataset"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"orgId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"orgId"}}},{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"experimentId"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"digest"}},{"kind":"Field","name":{"kind":"Name","value":"source"}},{"kind":"Field","name":{"kind":"Name","value":"sourceType"}},{"kind":"Field","name":{"kind":"Name","value":"context"}},{"kind":"Field","name":{"kind":"Name","value":"rowCount"}},{"kind":"Field","name":{"kind":"Name","value":"schema"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"description"}}]}}]}}]}}]} as unknown as DocumentNode<MlStudioDatasetQuery, MlStudioDatasetQueryVariables>;
export const MlStudioDatasetsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"MlStudioDatasets"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"orgId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"experimentId"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"mlDatasets"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"orgId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"orgId"}}},{"kind":"Argument","name":{"kind":"Name","value":"experimentId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"experimentId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"experimentId"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"digest"}},{"kind":"Field","name":{"kind":"Name","value":"source"}},{"kind":"Field","name":{"kind":"Name","value":"sourceType"}},{"kind":"Field","name":{"kind":"Name","value":"context"}},{"kind":"Field","name":{"kind":"Name","value":"rowCount"}},{"kind":"Field","name":{"kind":"Name","value":"schema"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"description"}}]}}]}}]}}]} as unknown as DocumentNode<MlStudioDatasetsQuery, MlStudioDatasetsQueryVariables>;
export const MlStudioDeploymentsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"MlStudioDeployments"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"orgId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"mlDeployments"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"orgId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"orgId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"modelId"}},{"kind":"Field","name":{"kind":"Name","value":"versionId"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"environment"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"endpoint"}},{"kind":"Field","name":{"kind":"Name","value":"region"}},{"kind":"Field","name":{"kind":"Name","value":"deployedAt"}},{"kind":"Field","name":{"kind":"Name","value":"rolledBackAt"}}]}}]}}]} as unknown as DocumentNode<MlStudioDeploymentsQuery, MlStudioDeploymentsQueryVariables>;
export const MlStudioFindingsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"MlStudioFindings"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"orgId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"projectId"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"mlFindings"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"orgId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"orgId"}}},{"kind":"Argument","name":{"kind":"Name","value":"projectId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"projectId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"modelId"}},{"kind":"Field","name":{"kind":"Name","value":"versionId"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"summary"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"runIds"}}]}}]}}]} as unknown as DocumentNode<MlStudioFindingsQuery, MlStudioFindingsQueryVariables>;
export const UpdateMlModelDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpdateMlModel"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"orgId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"domain"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"problemType"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"owners"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"license"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"references"}},"type":{"kind":"ListType","type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"intendedUse"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"limitations"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"ethicalConsiderations"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"caveats"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateMlModel"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"orgId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"orgId"}}},{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}},{"kind":"Argument","name":{"kind":"Name","value":"domain"},"value":{"kind":"Variable","name":{"kind":"Name","value":"domain"}}},{"kind":"Argument","name":{"kind":"Name","value":"problemType"},"value":{"kind":"Variable","name":{"kind":"Name","value":"problemType"}}},{"kind":"Argument","name":{"kind":"Name","value":"owners"},"value":{"kind":"Variable","name":{"kind":"Name","value":"owners"}}},{"kind":"Argument","name":{"kind":"Name","value":"license"},"value":{"kind":"Variable","name":{"kind":"Name","value":"license"}}},{"kind":"Argument","name":{"kind":"Name","value":"references"},"value":{"kind":"Variable","name":{"kind":"Name","value":"references"}}},{"kind":"Argument","name":{"kind":"Name","value":"intendedUse"},"value":{"kind":"Variable","name":{"kind":"Name","value":"intendedUse"}}},{"kind":"Argument","name":{"kind":"Name","value":"limitations"},"value":{"kind":"Variable","name":{"kind":"Name","value":"limitations"}}},{"kind":"Argument","name":{"kind":"Name","value":"ethicalConsiderations"},"value":{"kind":"Variable","name":{"kind":"Name","value":"ethicalConsiderations"}}},{"kind":"Argument","name":{"kind":"Name","value":"caveats"},"value":{"kind":"Variable","name":{"kind":"Name","value":"caveats"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"domain"}},{"kind":"Field","name":{"kind":"Name","value":"problemType"}},{"kind":"Field","name":{"kind":"Name","value":"owners"}},{"kind":"Field","name":{"kind":"Name","value":"license"}},{"kind":"Field","name":{"kind":"Name","value":"references"}},{"kind":"Field","name":{"kind":"Name","value":"intendedUse"}},{"kind":"Field","name":{"kind":"Name","value":"limitations"}},{"kind":"Field","name":{"kind":"Name","value":"ethicalConsiderations"}},{"kind":"Field","name":{"kind":"Name","value":"caveats"}}]}}]}}]} as unknown as DocumentNode<UpdateMlModelMutation, UpdateMlModelMutationVariables>;
export const CreateMlDeploymentDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CreateMlDeployment"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"orgId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CreateMlDeploymentInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createMlDeployment"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"orgId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"orgId"}}},{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]}}]} as unknown as DocumentNode<CreateMlDeploymentMutation, CreateMlDeploymentMutationVariables>;
export const UpdateMlDeploymentDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpdateMlDeployment"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"orgId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UpdateMlDeploymentInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateMlDeployment"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"orgId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"orgId"}}},{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}},{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]}}]} as unknown as DocumentNode<UpdateMlDeploymentMutation, UpdateMlDeploymentMutationVariables>;
export const DeleteMlDeploymentDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"DeleteMlDeployment"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"orgId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"deleteMlDeployment"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"orgId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"orgId"}}},{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}]}]}}]} as unknown as DocumentNode<DeleteMlDeploymentMutation, DeleteMlDeploymentMutationVariables>;
export const CreateMlVersionDeploymentUpdateDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CreateMlVersionDeploymentUpdate"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"orgId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"versionId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"toStatus"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createMlVersionDeploymentUpdate"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"orgId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"orgId"}}},{"kind":"Argument","name":{"kind":"Name","value":"versionId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"versionId"}}},{"kind":"Argument","name":{"kind":"Name","value":"toStatus"},"value":{"kind":"Variable","name":{"kind":"Name","value":"toStatus"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"versionId"}},{"kind":"Field","name":{"kind":"Name","value":"fromStatus"}},{"kind":"Field","name":{"kind":"Name","value":"toStatus"}},{"kind":"Field","name":{"kind":"Name","value":"changedBy"}},{"kind":"Field","name":{"kind":"Name","value":"changedAt"}}]}}]}}]} as unknown as DocumentNode<CreateMlVersionDeploymentUpdateMutation, CreateMlVersionDeploymentUpdateMutationVariables>;
export const CreateMlProjectDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CreateMlProject"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"orgId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CreateMlProjectInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createMlProject"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"orgId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"orgId"}}},{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]}}]} as unknown as DocumentNode<CreateMlProjectMutation, CreateMlProjectMutationVariables>;
export const CreateMlFindingDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CreateMlFinding"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"orgId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CreateMlFindingInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createMlFinding"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"orgId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"orgId"}}},{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]}}]} as unknown as DocumentNode<CreateMlFindingMutation, CreateMlFindingMutationVariables>;
export const UpdateMlFindingDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpdateMlFinding"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"orgId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UpdateMlFindingInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateMlFinding"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"orgId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"orgId"}}},{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}},{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]}}]} as unknown as DocumentNode<UpdateMlFindingMutation, UpdateMlFindingMutationVariables>;
export const DeleteMlFindingDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"DeleteMlFinding"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"orgId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"deleteMlFinding"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"orgId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"orgId"}}},{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}]}]}}]} as unknown as DocumentNode<DeleteMlFindingMutation, DeleteMlFindingMutationVariables>;
export const CompleteOnboardingDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CompleteOnboarding"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"orgId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"completeOnboarding"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"orgId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"orgId"}}}]}]}}]} as unknown as DocumentNode<CompleteOnboardingMutation, CompleteOnboardingMutationVariables>;
export const ServerOverviewDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"ServerOverview"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"serverOverview"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"totalUsers"}},{"kind":"Field","name":{"kind":"Name","value":"activeUsers"}},{"kind":"Field","name":{"kind":"Name","value":"totalOrgs"}}]}},{"kind":"Field","name":{"kind":"Name","value":"serverConfig"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"storageBackend"}},{"kind":"Field","name":{"kind":"Name","value":"storageBucket"}},{"kind":"Field","name":{"kind":"Name","value":"storageEndpoint"}},{"kind":"Field","name":{"kind":"Name","value":"vectorBackend"}},{"kind":"Field","name":{"kind":"Name","value":"embeddingBackend"}},{"kind":"Field","name":{"kind":"Name","value":"embeddingModel"}}]}}]}}]} as unknown as DocumentNode<ServerOverviewQuery, ServerOverviewQueryVariables>;
export const ServerOrgsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"ServerOrgs"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"orgs"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"logoUrl"}},{"kind":"Field","name":{"kind":"Name","value":"disabled"}},{"kind":"Field","name":{"kind":"Name","value":"autoJoin"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}}]}}]} as unknown as DocumentNode<ServerOrgsQuery, ServerOrgsQueryVariables>;
export const PrepareServerOrgLogoUploadDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"PrepareServerOrgLogoUpload"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"orgId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"prepareServerOrgLogoUpload"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"orgId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"orgId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"assetId"}},{"kind":"Field","name":{"kind":"Name","value":"uploadUrl"}}]}}]}}]} as unknown as DocumentNode<PrepareServerOrgLogoUploadMutation, PrepareServerOrgLogoUploadMutationVariables>;
export const SetServerOrgLogoDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"SetServerOrgLogo"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"orgId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"setServerOrgLogo"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"orgId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"orgId"}}}]}]}}]} as unknown as DocumentNode<SetServerOrgLogoMutation, SetServerOrgLogoMutationVariables>;
export const RemoveServerOrgLogoDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"RemoveServerOrgLogo"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"orgId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"removeServerOrgLogo"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"orgId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"orgId"}}}]}]}}]} as unknown as DocumentNode<RemoveServerOrgLogoMutation, RemoveServerOrgLogoMutationVariables>;
export const CreateServerOrgDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CreateServerOrg"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CreateServerOrgInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createServerOrg"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"disabled"}},{"kind":"Field","name":{"kind":"Name","value":"autoJoin"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}}]}}]} as unknown as DocumentNode<CreateServerOrgMutation, CreateServerOrgMutationVariables>;
export const UpdateServerOrgDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpdateServerOrg"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UpdateServerOrgInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateServerOrg"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}},{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"disabled"}},{"kind":"Field","name":{"kind":"Name","value":"autoJoin"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}}]}}]} as unknown as DocumentNode<UpdateServerOrgMutation, UpdateServerOrgMutationVariables>;
export const DeleteServerOrgDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"DeleteServerOrg"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"deleteServerOrg"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}]}]}}]} as unknown as DocumentNode<DeleteServerOrgMutation, DeleteServerOrgMutationVariables>;
export const OAuthProvidersDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"OAuthProviders"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"oauthProviders"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"providerName"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"displayName"}},{"kind":"Field","name":{"kind":"Name","value":"iconUrl"}},{"kind":"Field","name":{"kind":"Name","value":"clientId"}},{"kind":"Field","name":{"kind":"Name","value":"clientSecret"}},{"kind":"Field","name":{"kind":"Name","value":"authUrl"}},{"kind":"Field","name":{"kind":"Name","value":"tokenUrl"}},{"kind":"Field","name":{"kind":"Name","value":"userinfoUrl"}},{"kind":"Field","name":{"kind":"Name","value":"apiUrl"}},{"kind":"Field","name":{"kind":"Name","value":"scopes"}},{"kind":"Field","name":{"kind":"Name","value":"allowedDomains"}},{"kind":"Field","name":{"kind":"Name","value":"allowSignUp"}},{"kind":"Field","name":{"kind":"Name","value":"emailClaim"}},{"kind":"Field","name":{"kind":"Name","value":"nameClaim"}},{"kind":"Field","name":{"kind":"Name","value":"subClaim"}}]}}]}}]} as unknown as DocumentNode<OAuthProvidersQuery, OAuthProvidersQueryVariables>;
export const PrepareOAuthProviderIconUploadDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"PrepareOAuthProviderIconUpload"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"provider"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"prepareOAuthProviderIconUpload"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"provider"},"value":{"kind":"Variable","name":{"kind":"Name","value":"provider"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"assetId"}},{"kind":"Field","name":{"kind":"Name","value":"uploadUrl"}}]}}]}}]} as unknown as DocumentNode<PrepareOAuthProviderIconUploadMutation, PrepareOAuthProviderIconUploadMutationVariables>;
export const SetOAuthProviderIconDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"SetOAuthProviderIcon"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"provider"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"setOAuthProviderIcon"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"provider"},"value":{"kind":"Variable","name":{"kind":"Name","value":"provider"}}}]}]}}]} as unknown as DocumentNode<SetOAuthProviderIconMutation, SetOAuthProviderIconMutationVariables>;
export const RemoveOAuthProviderIconDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"RemoveOAuthProviderIcon"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"provider"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"removeOAuthProviderIcon"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"provider"},"value":{"kind":"Variable","name":{"kind":"Name","value":"provider"}}}]}]}}]} as unknown as DocumentNode<RemoveOAuthProviderIconMutation, RemoveOAuthProviderIconMutationVariables>;
export const UpsertOAuthProviderDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpsertOAuthProvider"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"provider"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UpsertOAuthInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"upsertOAuthProvider"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"provider"},"value":{"kind":"Variable","name":{"kind":"Name","value":"provider"}}},{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}]}]}}]} as unknown as DocumentNode<UpsertOAuthProviderMutation, UpsertOAuthProviderMutationVariables>;
export const DeleteOAuthProviderDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"DeleteOAuthProvider"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"provider"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"deleteOAuthProvider"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"provider"},"value":{"kind":"Variable","name":{"kind":"Name","value":"provider"}}}]}]}}]} as unknown as DocumentNode<DeleteOAuthProviderMutation, DeleteOAuthProviderMutationVariables>;
export const LdapConfigDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"LdapConfig"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"ldap"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"host"}},{"kind":"Field","name":{"kind":"Name","value":"port"}},{"kind":"Field","name":{"kind":"Name","value":"useSsl"}},{"kind":"Field","name":{"kind":"Name","value":"startTls"}},{"kind":"Field","name":{"kind":"Name","value":"skipTlsVerify"}},{"kind":"Field","name":{"kind":"Name","value":"bindDn"}},{"kind":"Field","name":{"kind":"Name","value":"searchBaseDn"}},{"kind":"Field","name":{"kind":"Name","value":"searchFilter"}},{"kind":"Field","name":{"kind":"Name","value":"usernameAttribute"}},{"kind":"Field","name":{"kind":"Name","value":"emailAttribute"}},{"kind":"Field","name":{"kind":"Name","value":"nameAttribute"}},{"kind":"Field","name":{"kind":"Name","value":"memberOfAttribute"}},{"kind":"Field","name":{"kind":"Name","value":"allowSignUp"}}]}}]}}]} as unknown as DocumentNode<LdapConfigQuery, LdapConfigQueryVariables>;
export const SamlConfigDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"SamlConfig"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"saml"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"spEntityId"}},{"kind":"Field","name":{"kind":"Name","value":"spCert"}},{"kind":"Field","name":{"kind":"Name","value":"idpEntityId"}},{"kind":"Field","name":{"kind":"Name","value":"idpMetadataUrl"}},{"kind":"Field","name":{"kind":"Name","value":"idpMetadataXml"}},{"kind":"Field","name":{"kind":"Name","value":"nameIdFormat"}},{"kind":"Field","name":{"kind":"Name","value":"loginAttribute"}},{"kind":"Field","name":{"kind":"Name","value":"emailAttribute"}},{"kind":"Field","name":{"kind":"Name","value":"nameAttribute"}},{"kind":"Field","name":{"kind":"Name","value":"groupsAttribute"}},{"kind":"Field","name":{"kind":"Name","value":"signRequests"}},{"kind":"Field","name":{"kind":"Name","value":"allowSignUp"}}]}}]}}]} as unknown as DocumentNode<SamlConfigQuery, SamlConfigQueryVariables>;
export const ScimStatusDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"ScimStatus"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"scim"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]}}]} as unknown as DocumentNode<ScimStatusQuery, ScimStatusQueryVariables>;
export const UpsertLdapDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpsertLdap"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UpsertLDAPInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"upsertLDAP"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}]}]}}]} as unknown as DocumentNode<UpsertLdapMutation, UpsertLdapMutationVariables>;
export const DeleteLdapDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"DeleteLdap"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"deleteLDAP"}}]}}]} as unknown as DocumentNode<DeleteLdapMutation, DeleteLdapMutationVariables>;
export const UpsertSamlDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpsertSaml"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UpsertSAMLInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"upsertSAML"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}]}]}}]} as unknown as DocumentNode<UpsertSamlMutation, UpsertSamlMutationVariables>;
export const ServerUsersDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"ServerUsers"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"users"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"login"}},{"kind":"Field","name":{"kind":"Name","value":"disabled"}},{"kind":"Field","name":{"kind":"Name","value":"role"}},{"kind":"Field","name":{"kind":"Name","value":"avatarUrl"}},{"kind":"Field","name":{"kind":"Name","value":"lastSeenAt"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}}]}}]} as unknown as DocumentNode<ServerUsersQuery, ServerUsersQueryVariables>;
export const CreateServerUserDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CreateServerUser"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CreateUserInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createUser"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"login"}},{"kind":"Field","name":{"kind":"Name","value":"disabled"}},{"kind":"Field","name":{"kind":"Name","value":"role"}},{"kind":"Field","name":{"kind":"Name","value":"lastSeenAt"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}}]}}]} as unknown as DocumentNode<CreateServerUserMutation, CreateServerUserMutationVariables>;
export const UpdateServerUserDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpdateServerUser"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UpdateUserInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateUser"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}},{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"login"}},{"kind":"Field","name":{"kind":"Name","value":"disabled"}},{"kind":"Field","name":{"kind":"Name","value":"role"}},{"kind":"Field","name":{"kind":"Name","value":"lastSeenAt"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}}]}}]} as unknown as DocumentNode<UpdateServerUserMutation, UpdateServerUserMutationVariables>;
export const DisableServerUserDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"DisableServerUser"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"disableUser"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}]}]}}]} as unknown as DocumentNode<DisableServerUserMutation, DisableServerUserMutationVariables>;
export const ActorDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"Actor"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"orgId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"actor"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"orgId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"orgId"}}},{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"avatarUrl"}}]}}]}}]} as unknown as DocumentNode<ActorQuery, ActorQueryVariables>;
export const ApiGroupsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"APIGroups"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"orgId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"serviceId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"apiGroups"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"orgId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"orgId"}}},{"kind":"Argument","name":{"kind":"Name","value":"serviceId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"serviceId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"serviceId"}},{"kind":"Field","name":{"kind":"Name","value":"orgId"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"version"}},{"kind":"Field","name":{"kind":"Name","value":"label"}},{"kind":"Field","name":{"kind":"Name","value":"protocol"}},{"kind":"Field","name":{"kind":"Name","value":"specKey"}},{"kind":"Field","name":{"kind":"Name","value":"specHash"}},{"kind":"Field","name":{"kind":"Name","value":"createdBy"}},{"kind":"Field","name":{"kind":"Name","value":"updatedBy"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}}]}}]} as unknown as DocumentNode<ApiGroupsQuery, ApiGroupsQueryVariables>;
export const ApiGroupDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"APIGroup"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"orgId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"serviceId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"apiGroup"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"orgId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"orgId"}}},{"kind":"Argument","name":{"kind":"Name","value":"serviceId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"serviceId"}}},{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"serviceId"}},{"kind":"Field","name":{"kind":"Name","value":"orgId"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"version"}},{"kind":"Field","name":{"kind":"Name","value":"label"}},{"kind":"Field","name":{"kind":"Name","value":"protocol"}},{"kind":"Field","name":{"kind":"Name","value":"specKey"}},{"kind":"Field","name":{"kind":"Name","value":"specHash"}},{"kind":"Field","name":{"kind":"Name","value":"createdBy"}},{"kind":"Field","name":{"kind":"Name","value":"updatedBy"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}}]}}]} as unknown as DocumentNode<ApiGroupQuery, ApiGroupQueryVariables>;
export const ApiEndpointsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"APIEndpoints"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"orgId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"serviceId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"apiGroupId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"versionId"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"apiEndpoints"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"orgId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"orgId"}}},{"kind":"Argument","name":{"kind":"Name","value":"serviceId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"serviceId"}}},{"kind":"Argument","name":{"kind":"Name","value":"apiGroupId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"apiGroupId"}}},{"kind":"Argument","name":{"kind":"Name","value":"versionId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"versionId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"apiGroupId"}},{"kind":"Field","name":{"kind":"Name","value":"serviceId"}},{"kind":"Field","name":{"kind":"Name","value":"orgId"}},{"kind":"Field","name":{"kind":"Name","value":"operationId"}},{"kind":"Field","name":{"kind":"Name","value":"method"}},{"kind":"Field","name":{"kind":"Name","value":"path"}},{"kind":"Field","name":{"kind":"Name","value":"summary"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"tags"}},{"kind":"Field","name":{"kind":"Name","value":"parameters"}},{"kind":"Field","name":{"kind":"Name","value":"requestBody"}},{"kind":"Field","name":{"kind":"Name","value":"responses"}},{"kind":"Field","name":{"kind":"Name","value":"exampleRequests"}},{"kind":"Field","name":{"kind":"Name","value":"exampleResponses"}},{"kind":"Field","name":{"kind":"Name","value":"order"}},{"kind":"Field","name":{"kind":"Name","value":"createdBy"}},{"kind":"Field","name":{"kind":"Name","value":"updatedBy"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}}]}}]} as unknown as DocumentNode<ApiEndpointsQuery, ApiEndpointsQueryVariables>;
export const CreateApiGroupDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CreateAPIGroup"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"orgId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"serviceId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CreateAPIGroupInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createAPIGroup"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"orgId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"orgId"}}},{"kind":"Argument","name":{"kind":"Name","value":"serviceId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"serviceId"}}},{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"protocol"}}]}}]}}]} as unknown as DocumentNode<CreateApiGroupMutation, CreateApiGroupMutationVariables>;
export const UpdateApiGroupDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpdateAPIGroup"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"orgId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"serviceId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UpdateAPIGroupInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateAPIGroup"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"orgId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"orgId"}}},{"kind":"Argument","name":{"kind":"Name","value":"serviceId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"serviceId"}}},{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}},{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}}]}}]} as unknown as DocumentNode<UpdateApiGroupMutation, UpdateApiGroupMutationVariables>;
export const DeleteApiGroupDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"DeleteAPIGroup"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"orgId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"serviceId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"deleteAPIGroup"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"orgId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"orgId"}}},{"kind":"Argument","name":{"kind":"Name","value":"serviceId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"serviceId"}}},{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}]}]}}]} as unknown as DocumentNode<DeleteApiGroupMutation, DeleteApiGroupMutationVariables>;
export const SyncApiGroupDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"SyncAPIGroup"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"orgId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"serviceId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"SyncAPIGroupInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"syncAPIGroup"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"orgId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"orgId"}}},{"kind":"Argument","name":{"kind":"Name","value":"serviceId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"serviceId"}}},{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"apiGroupId"}},{"kind":"Field","name":{"kind":"Name","value":"versionCreated"}}]}}]}}]} as unknown as DocumentNode<SyncApiGroupMutation, SyncApiGroupMutationVariables>;
export const RestoreApiGroupVersionDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"RestoreAPIGroupVersion"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"orgId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"serviceId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"apiGroupId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"versionId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"restoreAPIGroupVersion"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"orgId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"orgId"}}},{"kind":"Argument","name":{"kind":"Name","value":"serviceId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"serviceId"}}},{"kind":"Argument","name":{"kind":"Name","value":"apiGroupId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"apiGroupId"}}},{"kind":"Argument","name":{"kind":"Name","value":"versionId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"versionId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"version"}}]}}]}}]} as unknown as DocumentNode<RestoreApiGroupVersionMutation, RestoreApiGroupVersionMutationVariables>;
export const CreateApiEndpointDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CreateAPIEndpoint"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"orgId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"serviceId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"apiGroupId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CreateAPIEndpointInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createAPIEndpoint"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"orgId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"orgId"}}},{"kind":"Argument","name":{"kind":"Name","value":"serviceId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"serviceId"}}},{"kind":"Argument","name":{"kind":"Name","value":"apiGroupId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"apiGroupId"}}},{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]}}]} as unknown as DocumentNode<CreateApiEndpointMutation, CreateApiEndpointMutationVariables>;
export const UpdateApiEndpointDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpdateAPIEndpoint"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"orgId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"serviceId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"apiGroupId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UpdateAPIEndpointInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateAPIEndpoint"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"orgId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"orgId"}}},{"kind":"Argument","name":{"kind":"Name","value":"serviceId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"serviceId"}}},{"kind":"Argument","name":{"kind":"Name","value":"apiGroupId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"apiGroupId"}}},{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}},{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]}}]} as unknown as DocumentNode<UpdateApiEndpointMutation, UpdateApiEndpointMutationVariables>;
export const DeleteApiEndpointDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"DeleteAPIEndpoint"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"orgId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"serviceId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"apiGroupId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"deleteAPIEndpoint"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"orgId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"orgId"}}},{"kind":"Argument","name":{"kind":"Name","value":"serviceId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"serviceId"}}},{"kind":"Argument","name":{"kind":"Name","value":"apiGroupId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"apiGroupId"}}},{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}]}]}}]} as unknown as DocumentNode<DeleteApiEndpointMutation, DeleteApiEndpointMutationVariables>;
export const ApiGroupAndVersionsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"APIGroupAndVersions"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"orgId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"serviceId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"apiGroupId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"apiGroups"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"orgId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"orgId"}}},{"kind":"Argument","name":{"kind":"Name","value":"serviceId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"serviceId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"serviceId"}},{"kind":"Field","name":{"kind":"Name","value":"orgId"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"version"}},{"kind":"Field","name":{"kind":"Name","value":"label"}},{"kind":"Field","name":{"kind":"Name","value":"protocol"}},{"kind":"Field","name":{"kind":"Name","value":"specKey"}},{"kind":"Field","name":{"kind":"Name","value":"specHash"}},{"kind":"Field","name":{"kind":"Name","value":"createdBy"}},{"kind":"Field","name":{"kind":"Name","value":"updatedBy"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}},{"kind":"Field","name":{"kind":"Name","value":"apiGroupVersions"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"orgId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"orgId"}}},{"kind":"Argument","name":{"kind":"Name","value":"serviceId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"serviceId"}}},{"kind":"Argument","name":{"kind":"Name","value":"apiGroupId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"apiGroupId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"apiGroupId"}},{"kind":"Field","name":{"kind":"Name","value":"versionNumber"}},{"kind":"Field","name":{"kind":"Name","value":"label"}},{"kind":"Field","name":{"kind":"Name","value":"specKey"}},{"kind":"Field","name":{"kind":"Name","value":"specHash"}},{"kind":"Field","name":{"kind":"Name","value":"isAutoVersion"}},{"kind":"Field","name":{"kind":"Name","value":"createdBy"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}}]}}]}}]} as unknown as DocumentNode<ApiGroupAndVersionsQuery, ApiGroupAndVersionsQueryVariables>;
export const ApiGroupVersionsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"APIGroupVersions"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"orgId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"serviceId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"apiGroupId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"apiGroupVersions"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"orgId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"orgId"}}},{"kind":"Argument","name":{"kind":"Name","value":"serviceId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"serviceId"}}},{"kind":"Argument","name":{"kind":"Name","value":"apiGroupId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"apiGroupId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"apiGroupId"}},{"kind":"Field","name":{"kind":"Name","value":"versionNumber"}},{"kind":"Field","name":{"kind":"Name","value":"label"}},{"kind":"Field","name":{"kind":"Name","value":"specKey"}},{"kind":"Field","name":{"kind":"Name","value":"specHash"}},{"kind":"Field","name":{"kind":"Name","value":"isAutoVersion"}},{"kind":"Field","name":{"kind":"Name","value":"createdBy"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}}]}}]}}]} as unknown as DocumentNode<ApiGroupVersionsQuery, ApiGroupVersionsQueryVariables>;
export const ApiGroupSpecDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"ApiGroupSpec"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"orgId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"serviceId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"apiGroupId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"versionId"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"apiGroupSpec"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"orgId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"orgId"}}},{"kind":"Argument","name":{"kind":"Name","value":"serviceId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"serviceId"}}},{"kind":"Argument","name":{"kind":"Name","value":"apiGroupId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"apiGroupId"}}},{"kind":"Argument","name":{"kind":"Name","value":"versionId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"versionId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"apiGroupId"}},{"kind":"Field","name":{"kind":"Name","value":"fileName"}},{"kind":"Field","name":{"kind":"Name","value":"content"}}]}}]}}]} as unknown as DocumentNode<ApiGroupSpecQuery, ApiGroupSpecQueryVariables>;
export const ServiceDependenciesDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"ServiceDependencies"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"orgId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"serviceId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"direction"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"criticality"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"dependencies"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"orgId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"orgId"}}},{"kind":"Argument","name":{"kind":"Name","value":"serviceId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"serviceId"}}},{"kind":"Argument","name":{"kind":"Name","value":"direction"},"value":{"kind":"Variable","name":{"kind":"Name","value":"direction"}}},{"kind":"Argument","name":{"kind":"Name","value":"criticality"},"value":{"kind":"Variable","name":{"kind":"Name","value":"criticality"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"criticality"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"apiGroupName"}},{"kind":"Field","name":{"kind":"Name","value":"apiEndpointNames"}},{"kind":"Field","name":{"kind":"Name","value":"databaseName"}},{"kind":"Field","name":{"kind":"Name","value":"direction"}},{"kind":"Field","name":{"kind":"Name","value":"providerName"}},{"kind":"Field","name":{"kind":"Name","value":"consumerService"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}},{"kind":"Field","name":{"kind":"Name","value":"providerService"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}}]}}]}}]} as unknown as DocumentNode<ServiceDependenciesQuery, ServiceDependenciesQueryVariables>;
export const ServiceDependencyGraphDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"ServiceDependencyGraph"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"orgId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"serviceId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"serviceDependencyGraph"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"orgId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"orgId"}}},{"kind":"Argument","name":{"kind":"Name","value":"serviceId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"serviceId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"criticality"}},{"kind":"Field","name":{"kind":"Name","value":"apiGroupName"}},{"kind":"Field","name":{"kind":"Name","value":"apiEndpointNames"}},{"kind":"Field","name":{"kind":"Name","value":"databaseName"}},{"kind":"Field","name":{"kind":"Name","value":"direction"}},{"kind":"Field","name":{"kind":"Name","value":"providerName"}},{"kind":"Field","name":{"kind":"Name","value":"consumerService"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"gitRepoUrl"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}},{"kind":"Field","name":{"kind":"Name","value":"providerService"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"gitRepoUrl"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}}]}}]}}]} as unknown as DocumentNode<ServiceDependencyGraphQuery, ServiceDependencyGraphQueryVariables>;
export const UpdateServiceDependenciesDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpdateServiceDependencies"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"orgId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"serviceId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UpdateServiceDependenciesInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateServiceDependencies"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"orgId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"orgId"}}},{"kind":"Argument","name":{"kind":"Name","value":"serviceId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"serviceId"}}},{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"direction"}},{"kind":"Field","name":{"kind":"Name","value":"providerName"}},{"kind":"Field","name":{"kind":"Name","value":"consumerService"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}},{"kind":"Field","name":{"kind":"Name","value":"providerService"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}}]}}]}}]} as unknown as DocumentNode<UpdateServiceDependenciesMutation, UpdateServiceDependenciesMutationVariables>;
export const OrganizationDependencyGraphDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"OrganizationDependencyGraph"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"orgId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"dependencyGraph"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"orgId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"orgId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"criticality"}},{"kind":"Field","name":{"kind":"Name","value":"apiGroupName"}},{"kind":"Field","name":{"kind":"Name","value":"apiEndpointNames"}},{"kind":"Field","name":{"kind":"Name","value":"databaseName"}},{"kind":"Field","name":{"kind":"Name","value":"direction"}},{"kind":"Field","name":{"kind":"Name","value":"providerName"}},{"kind":"Field","name":{"kind":"Name","value":"consumerService"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"gitRepoUrl"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}},{"kind":"Field","name":{"kind":"Name","value":"providerService"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"gitRepoUrl"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}}]}}]}}]} as unknown as DocumentNode<OrganizationDependencyGraphQuery, OrganizationDependencyGraphQueryVariables>;
export const SavedQueriesDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"SavedQueries"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"orgId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"serviceId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"serviceDbId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"scope"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"SavedQueryScope"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"savedQueries"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"orgId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"orgId"}}},{"kind":"Argument","name":{"kind":"Name","value":"serviceId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"serviceId"}}},{"kind":"Argument","name":{"kind":"Name","value":"serviceDbId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"serviceDbId"}}},{"kind":"Argument","name":{"kind":"Name","value":"scope"},"value":{"kind":"Variable","name":{"kind":"Name","value":"scope"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"folderId"}},{"kind":"Field","name":{"kind":"Name","value":"scope"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"queryText"}},{"kind":"Field","name":{"kind":"Name","value":"tags"}},{"kind":"Field","name":{"kind":"Name","value":"createdBy"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}},{"kind":"Field","name":{"kind":"Name","value":"createdByActor"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"avatarUrl"}}]}}]}}]}}]} as unknown as DocumentNode<SavedQueriesQuery, SavedQueriesQueryVariables>;
export const SavedQueryFoldersDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"SavedQueryFolders"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"orgId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"serviceId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"serviceDbId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"scope"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"SavedQueryScope"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"savedQueryFolders"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"orgId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"orgId"}}},{"kind":"Argument","name":{"kind":"Name","value":"serviceId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"serviceId"}}},{"kind":"Argument","name":{"kind":"Name","value":"serviceDbId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"serviceDbId"}}},{"kind":"Argument","name":{"kind":"Name","value":"scope"},"value":{"kind":"Variable","name":{"kind":"Name","value":"scope"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}}]}}]} as unknown as DocumentNode<SavedQueryFoldersQuery, SavedQueryFoldersQueryVariables>;
export const CreateSavedQueryDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CreateSavedQuery"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"orgId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"serviceId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"serviceDbId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CreateSavedQueryInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createSavedQuery"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"orgId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"orgId"}}},{"kind":"Argument","name":{"kind":"Name","value":"serviceId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"serviceId"}}},{"kind":"Argument","name":{"kind":"Name","value":"serviceDbId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"serviceDbId"}}},{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]}}]} as unknown as DocumentNode<CreateSavedQueryMutation, CreateSavedQueryMutationVariables>;
export const UpdateSavedQueryDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpdateSavedQuery"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"orgId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"serviceId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"serviceDbId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UpdateSavedQueryInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateSavedQuery"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"orgId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"orgId"}}},{"kind":"Argument","name":{"kind":"Name","value":"serviceId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"serviceId"}}},{"kind":"Argument","name":{"kind":"Name","value":"serviceDbId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"serviceDbId"}}},{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}},{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]}}]} as unknown as DocumentNode<UpdateSavedQueryMutation, UpdateSavedQueryMutationVariables>;
export const DeleteSavedQueryDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"DeleteSavedQuery"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"orgId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"serviceId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"serviceDbId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"deleteSavedQuery"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"orgId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"orgId"}}},{"kind":"Argument","name":{"kind":"Name","value":"serviceId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"serviceId"}}},{"kind":"Argument","name":{"kind":"Name","value":"serviceDbId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"serviceDbId"}}},{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}]}]}}]} as unknown as DocumentNode<DeleteSavedQueryMutation, DeleteSavedQueryMutationVariables>;
export const CreateSavedQueryFolderDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CreateSavedQueryFolder"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"orgId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"serviceId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"serviceDbId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CreateSavedQueryFolderInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createSavedQueryFolder"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"orgId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"orgId"}}},{"kind":"Argument","name":{"kind":"Name","value":"serviceId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"serviceId"}}},{"kind":"Argument","name":{"kind":"Name","value":"serviceDbId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"serviceDbId"}}},{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}}]}}]} as unknown as DocumentNode<CreateSavedQueryFolderMutation, CreateSavedQueryFolderMutationVariables>;
export const DeleteSavedQueryFolderDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"DeleteSavedQueryFolder"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"orgId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"serviceId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"serviceDbId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"deleteSavedQueryFolder"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"orgId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"orgId"}}},{"kind":"Argument","name":{"kind":"Name","value":"serviceId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"serviceId"}}},{"kind":"Argument","name":{"kind":"Name","value":"serviceDbId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"serviceDbId"}}},{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}]}]}}]} as unknown as DocumentNode<DeleteSavedQueryFolderMutation, DeleteSavedQueryFolderMutationVariables>;
export const ServiceDbVersionsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"ServiceDBVersions"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"orgId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"serviceId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"serviceDbId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"serviceDBVersions"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"orgId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"orgId"}}},{"kind":"Argument","name":{"kind":"Name","value":"serviceId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"serviceId"}}},{"kind":"Argument","name":{"kind":"Name","value":"serviceDbId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"serviceDbId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"serviceDbId"}},{"kind":"Field","name":{"kind":"Name","value":"versionNumber"}},{"kind":"Field","name":{"kind":"Name","value":"label"}},{"kind":"Field","name":{"kind":"Name","value":"schemaJson"}},{"kind":"Field","name":{"kind":"Name","value":"tables"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"columns"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"nullable"}},{"kind":"Field","name":{"kind":"Name","value":"isPrimaryKey"}},{"kind":"Field","name":{"kind":"Name","value":"unique"}},{"kind":"Field","name":{"kind":"Name","value":"autoIncrement"}},{"kind":"Field","name":{"kind":"Name","value":"defaultValue"}},{"kind":"Field","name":{"kind":"Name","value":"foreignKey"}},{"kind":"Field","name":{"kind":"Name","value":"description"}}]}},{"kind":"Field","name":{"kind":"Name","value":"indexes"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"fields"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"noSQLSchema"}},{"kind":"Field","name":{"kind":"Name","value":"dbDiagramId"}},{"kind":"Field","name":{"kind":"Name","value":"pgDumpFileId"}},{"kind":"Field","name":{"kind":"Name","value":"source"}},{"kind":"Field","name":{"kind":"Name","value":"sourceTs"}},{"kind":"Field","name":{"kind":"Name","value":"isAutoVersion"}},{"kind":"Field","name":{"kind":"Name","value":"createdBy"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"createdByActor"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"avatarUrl"}}]}}]}}]}}]} as unknown as DocumentNode<ServiceDbVersionsQuery, ServiceDbVersionsQueryVariables>;
export const CreateServiceDbVersionDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CreateServiceDBVersion"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"orgId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"serviceId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"serviceDbId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CreateServiceDBVersionInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createServiceDBVersion"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"orgId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"orgId"}}},{"kind":"Argument","name":{"kind":"Name","value":"serviceId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"serviceId"}}},{"kind":"Argument","name":{"kind":"Name","value":"serviceDbId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"serviceDbId"}}},{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"versionNumber"}}]}}]}}]} as unknown as DocumentNode<CreateServiceDbVersionMutation, CreateServiceDbVersionMutationVariables>;
export const RestoreServiceDbVersionDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"RestoreServiceDBVersion"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"orgId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"serviceId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"serviceDbId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"versionId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"restoreServiceDBVersion"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"orgId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"orgId"}}},{"kind":"Argument","name":{"kind":"Name","value":"serviceId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"serviceId"}}},{"kind":"Argument","name":{"kind":"Name","value":"serviceDbId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"serviceDbId"}}},{"kind":"Argument","name":{"kind":"Name","value":"versionId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"versionId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"dbName"}}]}}]}}]} as unknown as DocumentNode<RestoreServiceDbVersionMutation, RestoreServiceDbVersionMutationVariables>;
export const ServiceDBsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"ServiceDBs"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"orgId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"serviceId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"serviceDBs"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"orgId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"orgId"}}},{"kind":"Argument","name":{"kind":"Name","value":"serviceId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"serviceId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"serviceId"}},{"kind":"Field","name":{"kind":"Name","value":"orgId"}},{"kind":"Field","name":{"kind":"Name","value":"dbName"}},{"kind":"Field","name":{"kind":"Name","value":"dbType"}},{"kind":"Field","name":{"kind":"Name","value":"dialect"}},{"kind":"Field","name":{"kind":"Name","value":"tables"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"columns"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"nullable"}},{"kind":"Field","name":{"kind":"Name","value":"isPrimaryKey"}},{"kind":"Field","name":{"kind":"Name","value":"unique"}},{"kind":"Field","name":{"kind":"Name","value":"autoIncrement"}},{"kind":"Field","name":{"kind":"Name","value":"defaultValue"}},{"kind":"Field","name":{"kind":"Name","value":"foreignKey"}},{"kind":"Field","name":{"kind":"Name","value":"description"}}]}},{"kind":"Field","name":{"kind":"Name","value":"indexes"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"fields"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"noSQLSchema"}},{"kind":"Field","name":{"kind":"Name","value":"dbDiagramId"}},{"kind":"Field","name":{"kind":"Name","value":"pgDumpFileId"}},{"kind":"Field","name":{"kind":"Name","value":"source"}},{"kind":"Field","name":{"kind":"Name","value":"sourceTs"}},{"kind":"Field","name":{"kind":"Name","value":"createdBy"}},{"kind":"Field","name":{"kind":"Name","value":"updatedBy"}},{"kind":"Field","name":{"kind":"Name","value":"createdByCommitHash"}},{"kind":"Field","name":{"kind":"Name","value":"updatedByCommitHash"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}},{"kind":"Field","name":{"kind":"Name","value":"createdByActor"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"avatarUrl"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"email"}}]}},{"kind":"Field","name":{"kind":"Name","value":"updatedByActor"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"avatarUrl"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"email"}}]}}]}}]}}]} as unknown as DocumentNode<ServiceDBsQuery, ServiceDBsQueryVariables>;
export const ServiceDbDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"ServiceDB"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"orgId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"serviceId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"serviceDB"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"orgId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"orgId"}}},{"kind":"Argument","name":{"kind":"Name","value":"serviceId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"serviceId"}}},{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"serviceId"}},{"kind":"Field","name":{"kind":"Name","value":"orgId"}},{"kind":"Field","name":{"kind":"Name","value":"dbName"}},{"kind":"Field","name":{"kind":"Name","value":"dbType"}},{"kind":"Field","name":{"kind":"Name","value":"dialect"}},{"kind":"Field","name":{"kind":"Name","value":"tables"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"columns"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"nullable"}},{"kind":"Field","name":{"kind":"Name","value":"isPrimaryKey"}},{"kind":"Field","name":{"kind":"Name","value":"unique"}},{"kind":"Field","name":{"kind":"Name","value":"autoIncrement"}},{"kind":"Field","name":{"kind":"Name","value":"defaultValue"}},{"kind":"Field","name":{"kind":"Name","value":"foreignKey"}},{"kind":"Field","name":{"kind":"Name","value":"description"}}]}},{"kind":"Field","name":{"kind":"Name","value":"indexes"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"fields"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"noSQLSchema"}},{"kind":"Field","name":{"kind":"Name","value":"dbDiagramId"}},{"kind":"Field","name":{"kind":"Name","value":"pgDumpFileId"}},{"kind":"Field","name":{"kind":"Name","value":"source"}},{"kind":"Field","name":{"kind":"Name","value":"sourceTs"}},{"kind":"Field","name":{"kind":"Name","value":"createdBy"}},{"kind":"Field","name":{"kind":"Name","value":"updatedBy"}},{"kind":"Field","name":{"kind":"Name","value":"createdByCommitHash"}},{"kind":"Field","name":{"kind":"Name","value":"updatedByCommitHash"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}},{"kind":"Field","name":{"kind":"Name","value":"createdByActor"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"avatarUrl"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"email"}}]}},{"kind":"Field","name":{"kind":"Name","value":"updatedByActor"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"avatarUrl"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"email"}}]}}]}}]}}]} as unknown as DocumentNode<ServiceDbQuery, ServiceDbQueryVariables>;
export const CreateServiceDbDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CreateServiceDB"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"orgId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"serviceId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CreateServiceDBInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createServiceDB"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"orgId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"orgId"}}},{"kind":"Argument","name":{"kind":"Name","value":"serviceId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"serviceId"}}},{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"dbName"}}]}}]}}]} as unknown as DocumentNode<CreateServiceDbMutation, CreateServiceDbMutationVariables>;
export const UpdateServiceDbDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpdateServiceDB"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"orgId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"serviceId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UpdateServiceDBInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateServiceDB"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"orgId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"orgId"}}},{"kind":"Argument","name":{"kind":"Name","value":"serviceId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"serviceId"}}},{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}},{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"dbName"}}]}}]}}]} as unknown as DocumentNode<UpdateServiceDbMutation, UpdateServiceDbMutationVariables>;
export const DeleteServiceDbDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"DeleteServiceDB"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"orgId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"serviceId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"deleteServiceDB"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"orgId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"orgId"}}},{"kind":"Argument","name":{"kind":"Name","value":"serviceId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"serviceId"}}},{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}]}]}}]} as unknown as DocumentNode<DeleteServiceDbMutation, DeleteServiceDbMutationVariables>;
export const ServiceDiagramsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"ServiceDiagrams"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"orgId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"serviceId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"serviceDiagrams"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"orgId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"orgId"}}},{"kind":"Argument","name":{"kind":"Name","value":"serviceId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"serviceId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"serviceId"}},{"kind":"Field","name":{"kind":"Name","value":"diagramId"}},{"kind":"Field","name":{"kind":"Name","value":"orgId"}},{"kind":"Field","name":{"kind":"Name","value":"createdBy"}},{"kind":"Field","name":{"kind":"Name","value":"updatedBy"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}},{"kind":"Field","name":{"kind":"Name","value":"diagram"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"orgId"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"previewAssetId"}},{"kind":"Field","name":{"kind":"Name","value":"previewImageUrl"}},{"kind":"Field","name":{"kind":"Name","value":"previewContentHash"}},{"kind":"Field","name":{"kind":"Name","value":"createdByCommitHash"}},{"kind":"Field","name":{"kind":"Name","value":"updatedByCommitHash"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}},{"kind":"Field","name":{"kind":"Name","value":"createdByActor"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"avatarUrl"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"email"}}]}},{"kind":"Field","name":{"kind":"Name","value":"updatedByActor"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"avatarUrl"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"email"}}]}}]}}]}}]}}]} as unknown as DocumentNode<ServiceDiagramsQuery, ServiceDiagramsQueryVariables>;
export const CreateServiceDiagramDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CreateServiceDiagram"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"orgId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"serviceId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CreateServiceDiagramInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createServiceDiagram"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"orgId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"orgId"}}},{"kind":"Argument","name":{"kind":"Name","value":"serviceId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"serviceId"}}},{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"serviceId"}},{"kind":"Field","name":{"kind":"Name","value":"diagramId"}}]}}]}}]} as unknown as DocumentNode<CreateServiceDiagramMutation, CreateServiceDiagramMutationVariables>;
export const DeleteServiceDiagramDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"DeleteServiceDiagram"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"orgId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"serviceId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"diagramId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"deleteServiceDiagram"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"orgId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"orgId"}}},{"kind":"Argument","name":{"kind":"Name","value":"serviceId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"serviceId"}}},{"kind":"Argument","name":{"kind":"Name","value":"diagramId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"diagramId"}}}]}]}}]} as unknown as DocumentNode<DeleteServiceDiagramMutation, DeleteServiceDiagramMutationVariables>;
export const ServiceDocsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"ServiceDocs"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"orgId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"serviceId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"serviceDocs"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"orgId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"orgId"}}},{"kind":"Argument","name":{"kind":"Name","value":"serviceId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"serviceId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"serviceId"}},{"kind":"Field","name":{"kind":"Name","value":"docId"}},{"kind":"Field","name":{"kind":"Name","value":"orgId"}},{"kind":"Field","name":{"kind":"Name","value":"createdBy"}},{"kind":"Field","name":{"kind":"Name","value":"updatedBy"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}},{"kind":"Field","name":{"kind":"Name","value":"doc"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"orgId"}},{"kind":"Field","name":{"kind":"Name","value":"fileAssetId"}},{"kind":"Field","name":{"kind":"Name","value":"fileUrl"}},{"kind":"Field","name":{"kind":"Name","value":"fileName"}},{"kind":"Field","name":{"kind":"Name","value":"fileType"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"contentHash"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}}]}}]}}]} as unknown as DocumentNode<ServiceDocsQuery, ServiceDocsQueryVariables>;
export const CreateServiceDocDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CreateServiceDoc"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"orgId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"serviceId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CreateServiceDocInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createServiceDoc"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"orgId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"orgId"}}},{"kind":"Argument","name":{"kind":"Name","value":"serviceId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"serviceId"}}},{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"serviceId"}},{"kind":"Field","name":{"kind":"Name","value":"docId"}}]}}]}}]} as unknown as DocumentNode<CreateServiceDocMutation, CreateServiceDocMutationVariables>;
export const DeleteServiceDocDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"DeleteServiceDoc"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"orgId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"serviceId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"docId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"deleteServiceDoc"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"orgId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"orgId"}}},{"kind":"Argument","name":{"kind":"Name","value":"serviceId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"serviceId"}}},{"kind":"Argument","name":{"kind":"Name","value":"docId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"docId"}}}]}]}}]} as unknown as DocumentNode<DeleteServiceDocMutation, DeleteServiceDocMutationVariables>;
export const ServicesDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"Services"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"orgId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"folderId"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"teamId"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"search"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"sortBy"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"sortDir"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"limit"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"offset"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"services"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"orgId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"orgId"}}},{"kind":"Argument","name":{"kind":"Name","value":"folderId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"folderId"}}},{"kind":"Argument","name":{"kind":"Name","value":"teamId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"teamId"}}},{"kind":"Argument","name":{"kind":"Name","value":"search"},"value":{"kind":"Variable","name":{"kind":"Name","value":"search"}}},{"kind":"Argument","name":{"kind":"Name","value":"sortBy"},"value":{"kind":"Variable","name":{"kind":"Name","value":"sortBy"}}},{"kind":"Argument","name":{"kind":"Name","value":"sortDir"},"value":{"kind":"Variable","name":{"kind":"Name","value":"sortDir"}}},{"kind":"Argument","name":{"kind":"Name","value":"limit"},"value":{"kind":"Variable","name":{"kind":"Name","value":"limit"}}},{"kind":"Argument","name":{"kind":"Name","value":"offset"},"value":{"kind":"Variable","name":{"kind":"Name","value":"offset"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"totalCount"}},{"kind":"Field","name":{"kind":"Name","value":"items"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"orgId"}},{"kind":"Field","name":{"kind":"Name","value":"folderId"}},{"kind":"Field","name":{"kind":"Name","value":"teamId"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"tier"}},{"kind":"Field","name":{"kind":"Name","value":"category"}},{"kind":"Field","name":{"kind":"Name","value":"language"}},{"kind":"Field","name":{"kind":"Name","value":"gitRepoUrl"}},{"kind":"Field","name":{"kind":"Name","value":"jiraProjectUrl"}},{"kind":"Field","name":{"kind":"Name","value":"slackChannelUrl"}},{"kind":"Field","name":{"kind":"Name","value":"lastCommitSha"}},{"kind":"Field","name":{"kind":"Name","value":"labels"}},{"kind":"Field","name":{"kind":"Name","value":"metadata"}},{"kind":"Field","name":{"kind":"Name","value":"createdBy"}},{"kind":"Field","name":{"kind":"Name","value":"updatedBy"}},{"kind":"Field","name":{"kind":"Name","value":"stats"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"serviceId"}},{"kind":"Field","name":{"kind":"Name","value":"endpointCount"}},{"kind":"Field","name":{"kind":"Name","value":"diagramCount"}},{"kind":"Field","name":{"kind":"Name","value":"dbTableCount"}},{"kind":"Field","name":{"kind":"Name","value":"docCount"}},{"kind":"Field","name":{"kind":"Name","value":"testCaseCount"}}]}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}}]}}]}}]} as unknown as DocumentNode<ServicesQuery, ServicesQueryVariables>;
export const ServiceDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"Service"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"orgId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"service"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"orgId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"orgId"}}},{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"orgId"}},{"kind":"Field","name":{"kind":"Name","value":"folderId"}},{"kind":"Field","name":{"kind":"Name","value":"teamId"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"tier"}},{"kind":"Field","name":{"kind":"Name","value":"category"}},{"kind":"Field","name":{"kind":"Name","value":"language"}},{"kind":"Field","name":{"kind":"Name","value":"gitRepoUrl"}},{"kind":"Field","name":{"kind":"Name","value":"jiraProjectUrl"}},{"kind":"Field","name":{"kind":"Name","value":"slackChannelUrl"}},{"kind":"Field","name":{"kind":"Name","value":"lastCommitSha"}},{"kind":"Field","name":{"kind":"Name","value":"labels"}},{"kind":"Field","name":{"kind":"Name","value":"metadata"}},{"kind":"Field","name":{"kind":"Name","value":"createdBy"}},{"kind":"Field","name":{"kind":"Name","value":"updatedBy"}},{"kind":"Field","name":{"kind":"Name","value":"stats"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"serviceId"}},{"kind":"Field","name":{"kind":"Name","value":"endpointCount"}},{"kind":"Field","name":{"kind":"Name","value":"diagramCount"}},{"kind":"Field","name":{"kind":"Name","value":"dbTableCount"}},{"kind":"Field","name":{"kind":"Name","value":"docCount"}},{"kind":"Field","name":{"kind":"Name","value":"testCaseCount"}}]}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}}]}}]} as unknown as DocumentNode<ServiceQuery, ServiceQueryVariables>;
export const CreateServiceDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CreateService"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"orgId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CreateServiceInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createService"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"orgId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"orgId"}}},{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}}]}}]} as unknown as DocumentNode<CreateServiceMutation, CreateServiceMutationVariables>;
export const UpdateServiceDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpdateService"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"orgId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UpdateServiceInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateService"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"orgId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"orgId"}}},{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}},{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}}]}}]} as unknown as DocumentNode<UpdateServiceMutation, UpdateServiceMutationVariables>;
export const DeleteServiceDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"DeleteService"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"orgId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"deleteService"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"orgId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"orgId"}}},{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}]}]}}]} as unknown as DocumentNode<DeleteServiceMutation, DeleteServiceMutationVariables>;
export const TestPacksDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"TestPacks"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"orgId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"serviceId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"testPacks"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"orgId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"orgId"}}},{"kind":"Argument","name":{"kind":"Name","value":"serviceId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"serviceId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"testPackId"}},{"kind":"Field","name":{"kind":"Name","value":"serviceId"}},{"kind":"Field","name":{"kind":"Name","value":"orgId"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"createdBy"}},{"kind":"Field","name":{"kind":"Name","value":"updatedBy"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}}]}}]} as unknown as DocumentNode<TestPacksQuery, TestPacksQueryVariables>;
export const CreateTestPackDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CreateTestPack"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"orgId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"serviceId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CreateTestPackInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createTestPack"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"orgId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"orgId"}}},{"kind":"Argument","name":{"kind":"Name","value":"serviceId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"serviceId"}}},{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"testPackId"}},{"kind":"Field","name":{"kind":"Name","value":"serviceId"}},{"kind":"Field","name":{"kind":"Name","value":"orgId"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"createdBy"}},{"kind":"Field","name":{"kind":"Name","value":"updatedBy"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}}]}}]} as unknown as DocumentNode<CreateTestPackMutation, CreateTestPackMutationVariables>;
export const UpdateTestPackDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpdateTestPack"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"orgId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"serviceId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UpdateTestPackInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateTestPack"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"orgId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"orgId"}}},{"kind":"Argument","name":{"kind":"Name","value":"serviceId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"serviceId"}}},{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}},{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"testPackId"}},{"kind":"Field","name":{"kind":"Name","value":"serviceId"}},{"kind":"Field","name":{"kind":"Name","value":"orgId"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"createdBy"}},{"kind":"Field","name":{"kind":"Name","value":"updatedBy"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}}]}}]} as unknown as DocumentNode<UpdateTestPackMutation, UpdateTestPackMutationVariables>;
export const DeleteTestPackDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"DeleteTestPack"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"orgId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"serviceId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"deleteTestPack"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"orgId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"orgId"}}},{"kind":"Argument","name":{"kind":"Name","value":"serviceId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"serviceId"}}},{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}]}]}}]} as unknown as DocumentNode<DeleteTestPackMutation, DeleteTestPackMutationVariables>;
export const TestCasesDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"TestCases"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"orgId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"serviceId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"testPackId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"testCases"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"orgId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"orgId"}}},{"kind":"Argument","name":{"kind":"Name","value":"serviceId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"serviceId"}}},{"kind":"Argument","name":{"kind":"Name","value":"testPackId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"testPackId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"testCaseId"}},{"kind":"Field","name":{"kind":"Name","value":"testPackId"}},{"kind":"Field","name":{"kind":"Name","value":"serviceId"}},{"kind":"Field","name":{"kind":"Name","value":"orgId"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"order"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"priority"}},{"kind":"Field","name":{"kind":"Name","value":"labels"}},{"kind":"Field","name":{"kind":"Name","value":"linkedTicket"}},{"kind":"Field","name":{"kind":"Name","value":"estimatedDurationMins"}},{"kind":"Field","name":{"kind":"Name","value":"testOwner"}},{"kind":"Field","name":{"kind":"Name","value":"linkedMapNodeId"}},{"kind":"Field","name":{"kind":"Name","value":"isCritical"}},{"kind":"Field","name":{"kind":"Name","value":"evidenceRequired"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"version"}},{"kind":"Field","name":{"kind":"Name","value":"baselineRunResultId"}},{"kind":"Field","name":{"kind":"Name","value":"dependencies"}},{"kind":"Field","name":{"kind":"Name","value":"createdBy"}},{"kind":"Field","name":{"kind":"Name","value":"updatedBy"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}},{"kind":"Field","name":{"kind":"Name","value":"manual"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"preconditions"}},{"kind":"Field","name":{"kind":"Name","value":"testData"}},{"kind":"Field","name":{"kind":"Name","value":"expectedOutcome"}},{"kind":"Field","name":{"kind":"Name","value":"postconditions"}},{"kind":"Field","name":{"kind":"Name","value":"steps"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"order"}},{"kind":"Field","name":{"kind":"Name","value":"action"}},{"kind":"Field","name":{"kind":"Name","value":"expectedResult"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"api"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"httpMethod"}},{"kind":"Field","name":{"kind":"Name","value":"apiSpecId"}},{"kind":"Field","name":{"kind":"Name","value":"operationId"}},{"kind":"Field","name":{"kind":"Name","value":"requestBody"}},{"kind":"Field","name":{"kind":"Name","value":"expectedStatusCode"}},{"kind":"Field","name":{"kind":"Name","value":"maxResponseTimeMs"}}]}},{"kind":"Field","name":{"kind":"Name","value":"graphql"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"operationType"}},{"kind":"Field","name":{"kind":"Name","value":"operationName"}},{"kind":"Field","name":{"kind":"Name","value":"query"}},{"kind":"Field","name":{"kind":"Name","value":"variables"}},{"kind":"Field","name":{"kind":"Name","value":"responseBody"}},{"kind":"Field","name":{"kind":"Name","value":"expectError"}}]}},{"kind":"Field","name":{"kind":"Name","value":"database"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"dialect"}},{"kind":"Field","name":{"kind":"Name","value":"schemaId"}},{"kind":"Field","name":{"kind":"Name","value":"query"}},{"kind":"Field","name":{"kind":"Name","value":"setupQuery"}},{"kind":"Field","name":{"kind":"Name","value":"teardownQuery"}}]}},{"kind":"Field","name":{"kind":"Name","value":"grpc"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"serviceName"}},{"kind":"Field","name":{"kind":"Name","value":"methodName"}},{"kind":"Field","name":{"kind":"Name","value":"callMode"}},{"kind":"Field","name":{"kind":"Name","value":"protoFileId"}},{"kind":"Field","name":{"kind":"Name","value":"serverAddress"}},{"kind":"Field","name":{"kind":"Name","value":"requestMessage"}},{"kind":"Field","name":{"kind":"Name","value":"expectedStatus"}},{"kind":"Field","name":{"kind":"Name","value":"deadlineMs"}},{"kind":"Field","name":{"kind":"Name","value":"responseBody"}},{"kind":"Field","name":{"kind":"Name","value":"useTLS"}},{"kind":"Field","name":{"kind":"Name","value":"expectError"}}]}}]}}]}}]} as unknown as DocumentNode<TestCasesQuery, TestCasesQueryVariables>;
export const CreateTestCaseDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CreateTestCase"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"orgId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"serviceId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CreateTestCaseInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createTestCase"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"orgId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"orgId"}}},{"kind":"Argument","name":{"kind":"Name","value":"serviceId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"serviceId"}}},{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"testCaseId"}},{"kind":"Field","name":{"kind":"Name","value":"testPackId"}},{"kind":"Field","name":{"kind":"Name","value":"serviceId"}},{"kind":"Field","name":{"kind":"Name","value":"orgId"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"order"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"priority"}},{"kind":"Field","name":{"kind":"Name","value":"labels"}},{"kind":"Field","name":{"kind":"Name","value":"linkedTicket"}},{"kind":"Field","name":{"kind":"Name","value":"estimatedDurationMins"}},{"kind":"Field","name":{"kind":"Name","value":"testOwner"}},{"kind":"Field","name":{"kind":"Name","value":"linkedMapNodeId"}},{"kind":"Field","name":{"kind":"Name","value":"isCritical"}},{"kind":"Field","name":{"kind":"Name","value":"evidenceRequired"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"version"}},{"kind":"Field","name":{"kind":"Name","value":"baselineRunResultId"}},{"kind":"Field","name":{"kind":"Name","value":"dependencies"}},{"kind":"Field","name":{"kind":"Name","value":"createdBy"}},{"kind":"Field","name":{"kind":"Name","value":"updatedBy"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}},{"kind":"Field","name":{"kind":"Name","value":"manual"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"preconditions"}},{"kind":"Field","name":{"kind":"Name","value":"testData"}},{"kind":"Field","name":{"kind":"Name","value":"expectedOutcome"}},{"kind":"Field","name":{"kind":"Name","value":"postconditions"}},{"kind":"Field","name":{"kind":"Name","value":"steps"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"order"}},{"kind":"Field","name":{"kind":"Name","value":"action"}},{"kind":"Field","name":{"kind":"Name","value":"expectedResult"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"api"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"httpMethod"}},{"kind":"Field","name":{"kind":"Name","value":"apiSpecId"}},{"kind":"Field","name":{"kind":"Name","value":"operationId"}},{"kind":"Field","name":{"kind":"Name","value":"requestBody"}},{"kind":"Field","name":{"kind":"Name","value":"expectedStatusCode"}},{"kind":"Field","name":{"kind":"Name","value":"maxResponseTimeMs"}}]}},{"kind":"Field","name":{"kind":"Name","value":"graphql"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"operationType"}},{"kind":"Field","name":{"kind":"Name","value":"operationName"}},{"kind":"Field","name":{"kind":"Name","value":"query"}},{"kind":"Field","name":{"kind":"Name","value":"variables"}},{"kind":"Field","name":{"kind":"Name","value":"responseBody"}},{"kind":"Field","name":{"kind":"Name","value":"expectError"}}]}},{"kind":"Field","name":{"kind":"Name","value":"database"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"dialect"}},{"kind":"Field","name":{"kind":"Name","value":"schemaId"}},{"kind":"Field","name":{"kind":"Name","value":"query"}},{"kind":"Field","name":{"kind":"Name","value":"setupQuery"}},{"kind":"Field","name":{"kind":"Name","value":"teardownQuery"}}]}},{"kind":"Field","name":{"kind":"Name","value":"grpc"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"serviceName"}},{"kind":"Field","name":{"kind":"Name","value":"methodName"}},{"kind":"Field","name":{"kind":"Name","value":"callMode"}},{"kind":"Field","name":{"kind":"Name","value":"protoFileId"}},{"kind":"Field","name":{"kind":"Name","value":"serverAddress"}},{"kind":"Field","name":{"kind":"Name","value":"requestMessage"}},{"kind":"Field","name":{"kind":"Name","value":"expectedStatus"}},{"kind":"Field","name":{"kind":"Name","value":"deadlineMs"}},{"kind":"Field","name":{"kind":"Name","value":"responseBody"}},{"kind":"Field","name":{"kind":"Name","value":"useTLS"}},{"kind":"Field","name":{"kind":"Name","value":"expectError"}}]}}]}}]}}]} as unknown as DocumentNode<CreateTestCaseMutation, CreateTestCaseMutationVariables>;
export const UpdateTestCaseDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpdateTestCase"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"orgId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"serviceId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UpdateTestCaseInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateTestCase"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"orgId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"orgId"}}},{"kind":"Argument","name":{"kind":"Name","value":"serviceId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"serviceId"}}},{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}},{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"testCaseId"}},{"kind":"Field","name":{"kind":"Name","value":"testPackId"}},{"kind":"Field","name":{"kind":"Name","value":"serviceId"}},{"kind":"Field","name":{"kind":"Name","value":"orgId"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"order"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"priority"}},{"kind":"Field","name":{"kind":"Name","value":"labels"}},{"kind":"Field","name":{"kind":"Name","value":"linkedTicket"}},{"kind":"Field","name":{"kind":"Name","value":"estimatedDurationMins"}},{"kind":"Field","name":{"kind":"Name","value":"testOwner"}},{"kind":"Field","name":{"kind":"Name","value":"linkedMapNodeId"}},{"kind":"Field","name":{"kind":"Name","value":"isCritical"}},{"kind":"Field","name":{"kind":"Name","value":"evidenceRequired"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"version"}},{"kind":"Field","name":{"kind":"Name","value":"baselineRunResultId"}},{"kind":"Field","name":{"kind":"Name","value":"dependencies"}},{"kind":"Field","name":{"kind":"Name","value":"createdBy"}},{"kind":"Field","name":{"kind":"Name","value":"updatedBy"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}},{"kind":"Field","name":{"kind":"Name","value":"manual"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"preconditions"}},{"kind":"Field","name":{"kind":"Name","value":"testData"}},{"kind":"Field","name":{"kind":"Name","value":"expectedOutcome"}},{"kind":"Field","name":{"kind":"Name","value":"postconditions"}},{"kind":"Field","name":{"kind":"Name","value":"steps"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"order"}},{"kind":"Field","name":{"kind":"Name","value":"action"}},{"kind":"Field","name":{"kind":"Name","value":"expectedResult"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"api"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"httpMethod"}},{"kind":"Field","name":{"kind":"Name","value":"apiSpecId"}},{"kind":"Field","name":{"kind":"Name","value":"operationId"}},{"kind":"Field","name":{"kind":"Name","value":"requestBody"}},{"kind":"Field","name":{"kind":"Name","value":"expectedStatusCode"}},{"kind":"Field","name":{"kind":"Name","value":"maxResponseTimeMs"}}]}},{"kind":"Field","name":{"kind":"Name","value":"graphql"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"operationType"}},{"kind":"Field","name":{"kind":"Name","value":"operationName"}},{"kind":"Field","name":{"kind":"Name","value":"query"}},{"kind":"Field","name":{"kind":"Name","value":"variables"}},{"kind":"Field","name":{"kind":"Name","value":"responseBody"}},{"kind":"Field","name":{"kind":"Name","value":"expectError"}}]}},{"kind":"Field","name":{"kind":"Name","value":"database"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"dialect"}},{"kind":"Field","name":{"kind":"Name","value":"schemaId"}},{"kind":"Field","name":{"kind":"Name","value":"query"}},{"kind":"Field","name":{"kind":"Name","value":"setupQuery"}},{"kind":"Field","name":{"kind":"Name","value":"teardownQuery"}}]}},{"kind":"Field","name":{"kind":"Name","value":"grpc"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"serviceName"}},{"kind":"Field","name":{"kind":"Name","value":"methodName"}},{"kind":"Field","name":{"kind":"Name","value":"callMode"}},{"kind":"Field","name":{"kind":"Name","value":"protoFileId"}},{"kind":"Field","name":{"kind":"Name","value":"serverAddress"}},{"kind":"Field","name":{"kind":"Name","value":"requestMessage"}},{"kind":"Field","name":{"kind":"Name","value":"expectedStatus"}},{"kind":"Field","name":{"kind":"Name","value":"deadlineMs"}},{"kind":"Field","name":{"kind":"Name","value":"responseBody"}},{"kind":"Field","name":{"kind":"Name","value":"useTLS"}},{"kind":"Field","name":{"kind":"Name","value":"expectError"}}]}}]}}]}}]} as unknown as DocumentNode<UpdateTestCaseMutation, UpdateTestCaseMutationVariables>;
export const DeleteTestCaseDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"DeleteTestCase"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"orgId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"serviceId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"deleteTestCase"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"orgId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"orgId"}}},{"kind":"Argument","name":{"kind":"Name","value":"serviceId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"serviceId"}}},{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}]}]}}]} as unknown as DocumentNode<DeleteTestCaseMutation, DeleteTestCaseMutationVariables>;
export const TestRunsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"TestRuns"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"orgId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"serviceId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"testPackId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"testRuns"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"orgId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"orgId"}}},{"kind":"Argument","name":{"kind":"Name","value":"serviceId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"serviceId"}}},{"kind":"Argument","name":{"kind":"Name","value":"testPackId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"testPackId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"testRunId"}},{"kind":"Field","name":{"kind":"Name","value":"testPackId"}},{"kind":"Field","name":{"kind":"Name","value":"serviceId"}},{"kind":"Field","name":{"kind":"Name","value":"orgId"}},{"kind":"Field","name":{"kind":"Name","value":"environment"}},{"kind":"Field","name":{"kind":"Name","value":"releaseLabel"}},{"kind":"Field","name":{"kind":"Name","value":"startedAt"}},{"kind":"Field","name":{"kind":"Name","value":"completedAt"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"startedBy"}},{"kind":"Field","name":{"kind":"Name","value":"executedBy"}},{"kind":"Field","name":{"kind":"Name","value":"executedAt"}},{"kind":"Field","name":{"kind":"Name","value":"overallStatus"}}]}}]}}]} as unknown as DocumentNode<TestRunsQuery, TestRunsQueryVariables>;
export const TestRunDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"TestRun"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"orgId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"serviceId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"testRun"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"orgId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"orgId"}}},{"kind":"Argument","name":{"kind":"Name","value":"serviceId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"serviceId"}}},{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"testRunId"}},{"kind":"Field","name":{"kind":"Name","value":"testPackId"}},{"kind":"Field","name":{"kind":"Name","value":"serviceId"}},{"kind":"Field","name":{"kind":"Name","value":"orgId"}},{"kind":"Field","name":{"kind":"Name","value":"environment"}},{"kind":"Field","name":{"kind":"Name","value":"releaseLabel"}},{"kind":"Field","name":{"kind":"Name","value":"startedAt"}},{"kind":"Field","name":{"kind":"Name","value":"completedAt"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"startedBy"}},{"kind":"Field","name":{"kind":"Name","value":"executedBy"}},{"kind":"Field","name":{"kind":"Name","value":"executedAt"}},{"kind":"Field","name":{"kind":"Name","value":"overallStatus"}}]}}]}}]} as unknown as DocumentNode<TestRunQuery, TestRunQueryVariables>;
export const TestRunsSummaryDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"TestRunsSummary"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"orgId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"serviceId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"testPackId"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"testRunsSummary"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"orgId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"orgId"}}},{"kind":"Argument","name":{"kind":"Name","value":"serviceId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"serviceId"}}},{"kind":"Argument","name":{"kind":"Name","value":"testPackId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"testPackId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"testRunId"}},{"kind":"Field","name":{"kind":"Name","value":"testPackId"}},{"kind":"Field","name":{"kind":"Name","value":"serviceId"}},{"kind":"Field","name":{"kind":"Name","value":"environment"}},{"kind":"Field","name":{"kind":"Name","value":"releaseLabel"}},{"kind":"Field","name":{"kind":"Name","value":"startedAt"}},{"kind":"Field","name":{"kind":"Name","value":"completedAt"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"startedBy"}},{"kind":"Field","name":{"kind":"Name","value":"executedBy"}},{"kind":"Field","name":{"kind":"Name","value":"executedAt"}},{"kind":"Field","name":{"kind":"Name","value":"overallStatus"}},{"kind":"Field","name":{"kind":"Name","value":"passedCount"}},{"kind":"Field","name":{"kind":"Name","value":"failedCount"}},{"kind":"Field","name":{"kind":"Name","value":"skippedCount"}},{"kind":"Field","name":{"kind":"Name","value":"blockedCount"}}]}}]}}]} as unknown as DocumentNode<TestRunsSummaryQuery, TestRunsSummaryQueryVariables>;
export const CreateTestRunDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CreateTestRun"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"orgId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"serviceId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CreateTestRunInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createTestRun"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"orgId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"orgId"}}},{"kind":"Argument","name":{"kind":"Name","value":"serviceId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"serviceId"}}},{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"testRunId"}},{"kind":"Field","name":{"kind":"Name","value":"testPackId"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"overallStatus"}}]}}]}}]} as unknown as DocumentNode<CreateTestRunMutation, CreateTestRunMutationVariables>;
export const UpdateTestRunDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpdateTestRun"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"orgId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"serviceId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UpdateTestRunInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateTestRun"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"orgId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"orgId"}}},{"kind":"Argument","name":{"kind":"Name","value":"serviceId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"serviceId"}}},{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}},{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"testRunId"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"overallStatus"}}]}}]}}]} as unknown as DocumentNode<UpdateTestRunMutation, UpdateTestRunMutationVariables>;
export const TestRunResultsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"TestRunResults"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"orgId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"serviceId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"testRunId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"testRunResults"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"orgId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"orgId"}}},{"kind":"Argument","name":{"kind":"Name","value":"serviceId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"serviceId"}}},{"kind":"Argument","name":{"kind":"Name","value":"testRunId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"testRunId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"testRunResultId"}},{"kind":"Field","name":{"kind":"Name","value":"testRunId"}},{"kind":"Field","name":{"kind":"Name","value":"testCaseId"}},{"kind":"Field","name":{"kind":"Name","value":"serviceId"}},{"kind":"Field","name":{"kind":"Name","value":"orgId"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"blockedReason"}},{"kind":"Field","name":{"kind":"Name","value":"responseStatus"}},{"kind":"Field","name":{"kind":"Name","value":"responseBody"}},{"kind":"Field","name":{"kind":"Name","value":"responseTimeMs"}},{"kind":"Field","name":{"kind":"Name","value":"notes"}},{"kind":"Field","name":{"kind":"Name","value":"screenshotUrls"}},{"kind":"Field","name":{"kind":"Name","value":"executedAt"}},{"kind":"Field","name":{"kind":"Name","value":"executedBy"}}]}}]}}]} as unknown as DocumentNode<TestRunResultsQuery, TestRunResultsQueryVariables>;
export const CreateTestRunResultDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CreateTestRunResult"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"orgId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"serviceId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CreateTestRunResultInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createTestRunResult"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"orgId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"orgId"}}},{"kind":"Argument","name":{"kind":"Name","value":"serviceId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"serviceId"}}},{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"testRunResultId"}},{"kind":"Field","name":{"kind":"Name","value":"testRunId"}},{"kind":"Field","name":{"kind":"Name","value":"testCaseId"}},{"kind":"Field","name":{"kind":"Name","value":"status"}}]}}]}}]} as unknown as DocumentNode<CreateTestRunResultMutation, CreateTestRunResultMutationVariables>;
export const UpdateTestRunResultDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpdateTestRunResult"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"orgId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"serviceId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UpdateTestRunResultInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateTestRunResult"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"orgId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"orgId"}}},{"kind":"Argument","name":{"kind":"Name","value":"serviceId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"serviceId"}}},{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}},{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"testRunResultId"}},{"kind":"Field","name":{"kind":"Name","value":"status"}}]}}]}}]} as unknown as DocumentNode<UpdateTestRunResultMutation, UpdateTestRunResultMutationVariables>;
export const CreateAssetUploadDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CreateAssetUpload"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"orgId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createAssetUpload"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"orgId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"orgId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"assetId"}},{"kind":"Field","name":{"kind":"Name","value":"uploadUrl"}}]}}]}}]} as unknown as DocumentNode<CreateAssetUploadMutation, CreateAssetUploadMutationVariables>;
export const AssetUrlDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"AssetUrl"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"orgId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"assetId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"assetUrl"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"orgId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"orgId"}}},{"kind":"Argument","name":{"kind":"Name","value":"assetId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"assetId"}}}]}]}}]} as unknown as DocumentNode<AssetUrlQuery, AssetUrlQueryVariables>;
export const AssetUrlsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"AssetUrls"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"orgId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"assetIds"}},"type":{"kind":"NonNullType","type":{"kind":"ListType","type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"assetUrls"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"orgId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"orgId"}}},{"kind":"Argument","name":{"kind":"Name","value":"assetIds"},"value":{"kind":"Variable","name":{"kind":"Name","value":"assetIds"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"assetId"}},{"kind":"Field","name":{"kind":"Name","value":"url"}}]}}]}}]} as unknown as DocumentNode<AssetUrlsQuery, AssetUrlsQueryVariables>;
export const MeAndOrgBootstrapDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"MeAndOrgBootstrap"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"me"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"userId"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"avatarUrl"}},{"kind":"Field","name":{"kind":"Name","value":"isServerAdmin"}}]}},{"kind":"Field","name":{"kind":"Name","value":"myOrgs"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"role"}},{"kind":"Field","name":{"kind":"Name","value":"logoUrl"}},{"kind":"Field","name":{"kind":"Name","value":"onboardingDone"}}]}}]}}]} as unknown as DocumentNode<MeAndOrgBootstrapQuery, MeAndOrgBootstrapQueryVariables>;