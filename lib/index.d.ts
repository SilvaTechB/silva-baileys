/// <reference types="node" />

export { default, default as makeWASocket } from './Socket';
export * from './Utils';
export * from './Types';
export * from './Defaults';
export * from './WABinary';
export * from './WAM';
export * from './WAUSync';
export * from '../WAProto';

import type { EventEmitter } from 'events';
import type { Logger } from 'pino';

// ─── Core Connection ─────────────────────────────────────────────────────────

export type WASocketConfig = {
    /** Auth state from useMultiFileAuthState */
    auth: AuthenticationState;
    /** Print QR code in terminal (default: false) */
    printQRInTerminal?: boolean;
    /** Browser identity [name, browser, version] */
    browser?: [string, string, string];
    /** Custom logger (pino instance) */
    logger?: Logger;
    /** Override WebSocket URL */
    waWebSocketUrl?: string | URL;
    /** Connect timeout in ms (default: 20000) */
    connectTimeoutMs?: number;
    /** Keep alive interval in ms */
    keepAliveIntervalMs?: number;
    /** Retry request delay in ms */
    retryRequestDelayMs?: number;
    /** Max message retry count */
    maxMsgRetryCount?: number;
    /** Fire init queries on connect */
    fireInitQueries?: boolean;
    /** Generate high quality link previews */
    generateHighQualityLinkPreview?: boolean;
    /** Custom fetch implementation */
    customUploadHosts?: MediaConnInfo['hosts'];
    /** Fetch agent */
    fetchAgent?: any;
    /** Keep messages in memory */
    shouldIgnoreJid?: (jid: string) => boolean;
    /** Mark online on connect */
    markOnlineOnConnect?: boolean;
    /** Sync full history */
    syncFullHistory?: boolean;
    /** Patch message before sending */
    patchMessageBeforeSending?: (msg: proto.IMessage) => Promise<proto.IMessage>;
    /** Message retry request handler */
    getMessage?: (key: proto.IMessageKey) => Promise<proto.IMessage | undefined>;
    /** Cached group metadata */
    cachedGroupMetadata?: (jid: string) => Promise<GroupMetadata | undefined>;
    /** Default timeout for queries (ms) */
    defaultQueryTimeoutMs?: number | undefined;
    /** Transaction executor options */
    transactionOpts?: TransactionCapabilityOptions;
    /** QR timeout in ms */
    qrTimeout?: number;
    /** Link code pairing */
    linkCode?: boolean;
    /** Mobile */
    mobile?: boolean;
};

// ─── Auth ────────────────────────────────────────────────────────────────────

export type AuthenticationState = {
    creds: AuthenticationCreds;
    keys: SignalKeyStoreWithTransaction;
};

export type AuthenticationCreds = {
    noiseKey: KeyPair;
    pairingEphemeralKeyPair: KeyPair;
    signedIdentityKey: KeyPair;
    signedPreKey: SignedKeyPair;
    registrationId: number;
    advSecretKey: string;
    processedHistoryMessages: proto.IMessageHistoryContext[];
    nextPreKeyId: number;
    firstUnuploadedPreKeyId: number;
    serverHasPreKeys?: boolean;
    account?: proto.IADVSignedDeviceIdentity;
    me?: Contact;
    signalIdentities?: SignalIdentity[];
    myAppStateKeyId?: string;
    firstAppStateSyncWindowEndTs?: number;
    accountSettings: AccountSettings;
    deviceId: string;
    phoneId: string;
    identityId: Buffer;
    registered?: boolean;
    backupToken?: Buffer;
    registration: RegistrationOptions;
    pairingCode?: string;
    lastPropHash?: string;
    routingInfo?: Buffer;
    ltHashState?: LTHashState;
};

export type SignalKeyStoreWithTransaction = SignalKeyStore & {
    isInTransaction?: () => boolean;
    transaction?: <T>(work: () => Promise<T>) => Promise<T>;
    prefetch?: (type: string, ids: string[]) => Promise<void>;
};

export type SignalKeyStore = {
    get(type: string, ids: string[]): Promise<{ [id: string]: SignalDataTypeMap[keyof SignalDataTypeMap] }>;
    set(data: SignalDataSet): Promise<void>;
    clear?: () => Promise<void>;
};

export type KeyPair = { public: Uint8Array; private: Uint8Array };
export type SignedKeyPair = KeyPair & { keyId: number; signature: Uint8Array };
export type SignalIdentity = { identifier: { name: string; deviceId: number }; identityKey: Uint8Array };
export type AccountSettings = { unarchiveChats: boolean; defaultDisappearingMode?: proto.IConversation };
export type RegistrationOptions = { phoneNumber?: string; phoneNumberCountryCode: string; phoneNumberNationalNumber: string; phoneNumberMobileCountryCode: string; phoneNumberMobileNetworkCode?: string; method?: 'sms' | 'voice'; captcha?: string };
export type LTHashState = { version: number; hash: Buffer; indexValueMap: { [indexMacBase64: string]: { valueMac: Uint8Array | Buffer } } };
export type TransactionCapabilityOptions = { maxCommitRetries: number; delayBetweenTriesMs: number };
export type SignalDataTypeMap = { 'pre-key': KeyPair; 'session': Uint8Array; 'sender-key': Uint8Array; 'sender-key-memory': { [jid: string]: boolean }; 'app-state-sync-key': proto.IAppStateSyncKeyData; 'app-state-sync-version': LTHashState };
export type SignalDataSet = { [T in keyof SignalDataTypeMap]?: { [id: string]: SignalDataTypeMap[T] | null } };

// ─── Messages ────────────────────────────────────────────────────────────────

export type AnyMessageContent =
    | { text: string; mentions?: string[] }
    | { image: WAMediaUpload; caption?: string; jpegThumbnail?: string }
    | { video: WAMediaUpload; caption?: string; gifPlayback?: boolean }
    | { audio: WAMediaUpload; ptt?: boolean; waveform?: Uint8Array }
    | { document: WAMediaUpload; fileName?: string; mimetype: string }
    | { sticker: WAMediaUpload; isAnimated?: boolean }
    | { contacts: { displayName?: string; contacts: proto.IMessage[] } }
    | { location: WALocationMessage }
    | { react: { text: string; key: proto.IMessageKey } }
    | { delete: proto.IMessageKey }
    | { forward: WAMessage; force?: boolean }
    | { poll: PollMessageOptions }
    | proto.IMessage;

export type WAMediaUpload = Buffer | { url: string } | { stream: import('stream').Readable };

export type WALocationMessage = {
    degreesLatitude: number;
    degreesLongitude: number;
    name?: string;
    address?: string;
};

export type PollMessageOptions = {
    name: string;
    values: string[];
    selectableCount?: number;
};

export type MiscMessageGenerationOptions = {
    timestamp?: Date;
    quoted?: WAMessage;
    userJid?: string;
    ephemeralExpiration?: number | string;
    messageId?: string;
    additionalAttributes?: { [key: string]: string };
    additionalNodes?: BinaryNode[];
    statusJidList?: string[];
};

export type WAMessage = proto.IWebMessageInfo;

// ─── Contacts & Chats ────────────────────────────────────────────────────────

export type Contact = {
    id: string;
    lid?: string;
    name?: string;
    notify?: string;
    verifiedName?: string;
    imgUrl?: string | null;
    status?: string;
};

export type Chat = {
    id: string;
    name?: string;
    description?: string;
    unreadCount?: number;
    lastMessageRecvTimestamp?: number;
    conversationTimestamp?: number | Long;
    archived?: boolean;
    pinned?: number;
    mute?: number;
    notSpam?: boolean;
    ephemeralExpiration?: number;
};

// ─── Groups ──────────────────────────────────────────────────────────────────

export type GroupMetadata = {
    id: string;
    owner: string | undefined;
    subject: string;
    subjectOwner?: string;
    subjectTime?: number;
    creation?: number;
    desc?: string;
    descOwner?: string;
    descId?: string;
    linkedParent?: GroupParticipant;
    restrict?: boolean;
    announce?: boolean;
    isCommunity?: boolean;
    isCommunityAnnounce?: boolean;
    joinApprovalMode?: boolean;
    memberAddMode?: boolean;
    participants: GroupParticipant[];
    ephemeralDuration?: number;
    inviteCode?: string;
    author?: string;
};

export type GroupParticipant = {
    id: string;
    lid?: string;
    isAdmin?: boolean;
    isSuperAdmin?: boolean;
    admin?: 'admin' | 'superadmin' | null;
    displayName?: string;
};

// ─── Media ───────────────────────────────────────────────────────────────────

export type MediaConnInfo = {
    auth: string;
    ttl: number;
    hosts: { hostname: string; maxContentLengthBytes: number }[];
    fetchDate: Date;
};

// ─── Binary Node ─────────────────────────────────────────────────────────────

export type BinaryNode = {
    tag: string;
    attrs: { [key: string]: string };
    content?: BinaryNode[] | string | Uint8Array;
};

// ─── Connection State ────────────────────────────────────────────────────────

export type ConnectionState = {
    connection: 'open' | 'connecting' | 'close';
    lastDisconnect?: { error: Error | undefined; date: Date };
    isNewLogin?: boolean;
    qr?: string;
    receivedPendingNotifications?: boolean;
    isOnline?: boolean;
};

export declare const DisconnectReason: {
    connectionClosed: 428;
    connectionLost: 408;
    connectionReplaced: 440;
    timedOut: 408;
    loggedOut: 401;
    badSession: 500;
    restartRequired: 515;
    multideviceMismatch: 411;
    forbidden: 403;
    unavailableService: 503;
};

// ─── Browsers ────────────────────────────────────────────────────────────────

export declare const Browsers: {
    ubuntu(browser?: string): [string, string, string];
    macOS(browser?: string): [string, string, string];
    baileys(browser?: string): [string, string, string];
    windows(browser?: string): [string, string, string];
    appropriate(browser: string): [string, string, string];
};

// ─── Utilities ───────────────────────────────────────────────────────────────

export declare function useMultiFileAuthState(folder: string): Promise<{ state: AuthenticationState; saveCreds: () => Promise<void> }>;
export declare function fetchLatestBaileysVersion(): Promise<{ version: [number, number, number]; isLatest: boolean }>;
export declare function downloadMediaMessage(message: WAMessage, type: 'buffer' | 'stream', options?: object): Promise<Buffer | import('stream').Readable>;
export declare function generateWAMessage(jid: string, content: AnyMessageContent, options: MiscMessageGenerationOptions & { logger?: Logger }): Promise<WAMessage>;
export declare function getContentType(content: proto.IMessage | undefined): keyof proto.IMessage | undefined;
export declare function extractMessageContent(content: proto.IMessage | undefined | null): proto.IMessage | null;
export declare function normalizeMessageContent(content: proto.IMessage | null | undefined): proto.IMessage | null;
export declare function generateMessageID(): string;
export declare function generateMessageIDV2(userId?: string): string;
export declare function delay(ms: number): Promise<void>;
export declare function toNumber(t: Long | number): number;
export declare const BufferJSON: { replacer: (k: string, val: object) => object; reviver: (k: string, val: object) => object };

// ─── Default Export ──────────────────────────────────────────────────────────

export default makeWASocket;
export declare function makeWASocket(config: WASocketConfig): WASocket;

export type WASocket = {
    ev: BaileysEventEmitter;
    authState: { creds: AuthenticationCreds; keys: SignalKeyStoreWithTransaction };
    user: Contact | undefined;
    ws: any;
    generateMessageTag(): string;
    query(node: BinaryNode, timeoutMs?: number): Promise<BinaryNode>;
    waitForMessage(msgId: string, timeoutMs?: number | undefined): Promise<any>;
    waitForSocketOpen(): Promise<void>;
    sendRawMessage(data: Uint8Array | Buffer): Promise<void>;
    sendNode(frame: BinaryNode): Promise<void>;
    logout(msg?: string): Promise<void>;
    end(error: Error | undefined): void;
    sendMessage(jid: string, content: AnyMessageContent, options?: MiscMessageGenerationOptions): Promise<WAMessage | undefined>;
    relayMessage(jid: string, message: proto.IMessage, options: { messageId: string; cachedGroupMetadata?: (jid: string) => Promise<GroupMetadata | undefined>; statusJidList?: string[] }): Promise<string>;
    readMessages(keys: proto.IMessageKey[]): Promise<void>;
    refreshMediaConn(forceGet?: boolean): Promise<MediaConnInfo>;
    sendReceipt(jid: string, participant: string | undefined, messageIds: string[], type: WAReceiptType): Promise<void>;
    sendReceipts(keys: proto.IMessageKey[], type: WAReceiptType): Promise<void>;
    downloadMediaMessage(message: WAMessage, type: 'buffer' | 'stream', options?: object): Promise<Buffer | import('stream').Readable>;
    updateBlockStatus(jid: string, action: 'block' | 'unblock'): Promise<void>;
    getBusinessProfile(jid: string): Promise<WABusinessProfile | void>;
    profilePictureUrl(jid: string, type?: 'image' | 'preview', timeoutMs?: number): Promise<string | undefined>;
    getStatus(jid: string): Promise<{ status: string | undefined }>;
    updateProfilePicture(jid: string, content: WAMediaUpload): Promise<void>;
    removeProfilePicture(jid: string): Promise<void>;
    updateProfileStatus(status: string): Promise<void>;
    updateProfileName(name: string): Promise<void>;
    fetchBlocklist(): Promise<string[]>;
    fetchPrivacySettings(force?: boolean): Promise<{ [key: string]: string }>;
    updateDefaultDisappearingMode(duration: number): Promise<void>;
    fetchStatus(jid: string): Promise<{ status: string | undefined; setAt: Date } | undefined>;
    subscribeNewsletterUpdates(jid: string): Promise<{ duration: string }>;
    groupMetadata(jid: string): Promise<GroupMetadata>;
    groupCreate(subject: string, participants: string[]): Promise<GroupMetadata>;
    groupLeave(id: string): Promise<void>;
    groupUpdateSubject(jid: string, subject: string): Promise<void>;
    groupParticipantsUpdate(jid: string, participants: string[], action: ParticipantAction): Promise<{ status: string; jid: string }[]>;
    groupUpdateDescription(jid: string, description?: string): Promise<void>;
    groupInviteCode(jid: string): Promise<string | undefined>;
    groupRevokeInvite(jid: string): Promise<string | undefined>;
    groupAcceptInvite(code: string): Promise<string | undefined>;
    groupToggleEphemeral(jid: string, ephemeralExpiration: number): Promise<void>;
    groupSettingUpdate(jid: string, setting: GroupSetting): Promise<void>;
    groupMemberAddMode(jid: string, mode: 'all_member_add' | 'admin_add'): Promise<void>;
    groupFetchAllParticipating(): Promise<{ [id: string]: GroupMetadata }>;
};

export type BaileysEventEmitter = EventEmitter & {
    on<T extends keyof BaileysEventMap>(event: T, listener: (arg: BaileysEventMap[T]) => void): BaileysEventEmitter;
    off<T extends keyof BaileysEventMap>(event: T, listener: (arg: BaileysEventMap[T]) => void): BaileysEventEmitter;
    emit<T extends keyof BaileysEventMap>(event: T, arg: BaileysEventMap[T]): boolean;
    removeAllListeners(event?: keyof BaileysEventMap): BaileysEventEmitter;
    process(handler: (events: Partial<BaileysEventMap>) => void | Promise<void>): () => void;
};

export type BaileysEventMap = {
    'connection.update': Partial<ConnectionState>;
    'creds.update': Partial<AuthenticationCreds>;
    'messaging-history.set': { chats: Chat[]; contacts: Contact[]; messages: WAMessage[]; syncType: proto.HistorySync.HistorySyncType; progress?: number; isLatest?: boolean };
    'chats.upsert': Chat[];
    'chats.update': Partial<Chat>[];
    'chats.delete': string[];
    'presence.update': { id: string; presences: { [participant: string]: PresenceData } };
    'contacts.upsert': Contact[];
    'contacts.update': Partial<Contact>[];
    'messages.delete': { keys: proto.IMessageKey[] } | { jid: string; all: true };
    'messages.update': WAMessageUpdate[];
    'messages.upsert': { messages: WAMessage[]; type: MessageUpsertType };
    'messages.reaction': { key: proto.IMessageKey; reaction: proto.IReaction }[];
    'message-receipt.update': MessageUserReceiptUpdate[];
    'groups.upsert': GroupMetadata[];
    'groups.update': Partial<GroupMetadata>[];
    'group-participants.update': { id: string; participants: string[]; action: ParticipantAction };
    'blocklist.set': { blocklist: string[] };
    'blocklist.update': { blocklist: string[]; type: 'add' | 'remove' };
    'call': WACallEvent[];
    'labels.association': LabelAssociation;
    'labels.edit': Label;
};

export type MessageUpsertType = 'append' | 'notify';
export type WAReceiptType = 'read' | 'read-self' | 'hist-sync' | 'peer-msg' | 'sender' | 'inactive' | 'played';
export type ParticipantAction = 'add' | 'remove' | 'demote' | 'promote';
export type GroupSetting = 'announcement' | 'not_announcement' | 'locked' | 'unlocked';
export type WAMessageUpdate = { key: proto.IMessageKey; update: Partial<proto.IWebMessageInfo> };
export type MessageUserReceiptUpdate = { key: proto.IMessageKey; receipt: proto.IUserReceipt };
export type PresenceData = { lastKnownPresence: WAPresence; lastSeen?: number };
export type WAPresence = 'unavailable' | 'available' | 'composing' | 'recording' | 'paused';
export type WACallEvent = { chatId: string; id: string; isInitiator: boolean; isVideo: boolean; status: WACallStatus; date: Date; offline: boolean; participants?: string[] };
export type WACallStatus = 'offer' | 'ringing' | 'reject' | 'accept' | 'timeout' | 'offer_call_relays';
export type LabelAssociation = { type: 'chat'; chatId: string; labelId: string } | { type: 'message'; chatId: string; messageId: string; labelId: string };
export type Label = { id: string; name: string; predefinedId?: string; color: number; deleted?: boolean };
export type WABusinessProfile = { description: string; email: string | null; website: string[]; latitude?: number; longitude?: number; businessHours?: { config?: proto.IConversation; timezone?: string }; address?: string; statement?: string; helpDissatisfiedMessage?: string };

// ─── Proto namespace re-export ───────────────────────────────────────────────
import * as proto from '../WAProto';
export { proto };
export type { Long } from 'long';
