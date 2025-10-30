import {
  Client,
  TopicCreateTransaction,
  TopicMessageSubmitTransaction,
  TokenCreateTransaction,
  TokenType,
  TokenSupplyType,
  TokenMintTransaction,
  TransferTransaction,
  AccountId,
  PrivateKey,
  Hbar,
} from '@hashgraph/sdk';
import { randomBytes } from 'crypto';

export interface HederaConfig {
  network: 'testnet' | 'mainnet';
  accountId: string;
  privateKey: string;
}

export interface TaskLogPayload {
  type: 'TASK_LOG';
  taskId: string;
  chwId: string;
  taskType: string;
  geohash: string;
  consentHash: string;
  when: number;
}

export interface ApprovalLogPayload {
  type: 'TASK_APPROVAL';
  taskId: string;
  supervisorId: string;
  approved: boolean;
  when: number;
}

export interface HcsResult {
  txId: string;
  txHashHex: string;
}

export interface TokenResult {
  tokenId: string;
}

export interface TransferResult {
  receiptStatus: string;
  txHashHex: string;
}

let clientInstance: Client | null = null;

function isHederaConfigured() {
  return Boolean(process.env.HEDERA_ACCOUNT_ID && process.env.HEDERA_PRIVATE_KEY);
}

function mockTxHash(): string {
  return randomBytes(32).toString('hex');
}

export function getHederaClient(config?: HederaConfig): Client {
  if (clientInstance) {
    return clientInstance;
  }

  const network = config?.network || process.env.HEDERA_NETWORK || 'testnet';
  const accountId = config?.accountId || process.env.HEDERA_ACCOUNT_ID;
  const privateKey = config?.privateKey || process.env.HEDERA_PRIVATE_KEY;

  if (!accountId || !privateKey) {
    throw new Error('Hedera credentials not configured. Set HEDERA_ACCOUNT_ID and HEDERA_PRIVATE_KEY');
  }

  const client = network === 'testnet' ? Client.forTestnet() : Client.forMainnet();

  client.setOperator(
    AccountId.fromString(accountId),
    PrivateKey.fromString(privateKey)
  );

  clientInstance = client;
  return client;
}

export async function createHcsTopic(memo?: string): Promise<{ topicId: string }> {
  const client = getHederaClient();

  const transaction = new TopicCreateTransaction()
    .setTopicMemo(memo || 'AfyaUkweli CHW Task Logs');

  const txResponse = await transaction.execute(client);
  const receipt = await txResponse.getReceipt(client);

  if (!receipt.topicId) {
    throw new Error('Failed to create HCS topic');
  }

  return {
    topicId: receipt.topicId.toString(),
  };
}

export async function submitTaskLog(payload: TaskLogPayload): Promise<HcsResult> {
  const topicId = process.env.HCS_TOPIC_ID;

  // Mock mode when Hedera is not configured
  if (!isHederaConfigured() || !topicId) {
    return { txId: `mock-${Date.now()}`, txHashHex: mockTxHash() };
  }

  const client = getHederaClient();
  const message = JSON.stringify(payload);

  const transaction = new TopicMessageSubmitTransaction()
    .setTopicId(topicId)
    .setMessage(message);

  const txResponse = await transaction.execute(client);
  await txResponse.getReceipt(client);

  return {
    txId: txResponse.transactionId.toString(),
    txHashHex: Buffer.from(txResponse.transactionHash).toString('hex'),
  };
}

export async function submitApprovalLog(payload: ApprovalLogPayload): Promise<HcsResult> {
  const topicId = process.env.HCS_TOPIC_ID;

  if (!isHederaConfigured() || !topicId) {
    return { txId: `mock-${Date.now()}`, txHashHex: mockTxHash() };
  }

  const client = getHederaClient();
  const message = JSON.stringify(payload);

  const transaction = new TopicMessageSubmitTransaction()
    .setTopicId(topicId)
    .setMessage(message);

  const txResponse = await transaction.execute(client);
  await txResponse.getReceipt(client);

  return {
    txId: txResponse.transactionId.toString(),
    txHashHex: Buffer.from(txResponse.transactionHash).toString('hex'),
  };
}

export async function createHtsToken(
  tokenName: string = 'CHW Points',
  tokenSymbol: string = 'CHWP',
  initialSupply: number = 1000000
): Promise<{ tokenId: string }> {
  const client = getHederaClient();
  const treasuryAccount = AccountId.fromString(process.env.HEDERA_ACCOUNT_ID!);
  const treasuryKey = PrivateKey.fromString(process.env.HEDERA_PRIVATE_KEY!);

  const transaction = await new TokenCreateTransaction()
    .setTokenName(tokenName)
    .setTokenSymbol(tokenSymbol)
    .setTokenType(TokenType.FungibleCommon)
    .setDecimals(0)
    .setInitialSupply(initialSupply)
    .setTreasuryAccountId(treasuryAccount)
    .setSupplyType(TokenSupplyType.Infinite)
    .setSupplyKey(treasuryKey)
    .setAdminKey(treasuryKey)
    .setFreezeDefault(false)
    .execute(client);

  const receipt = await transaction.getReceipt(client);

  if (!receipt.tokenId) {
    throw new Error('Failed to create HTS token');
  }

  return {
    tokenId: receipt.tokenId.toString(),
  };
}

export async function mintHts(amount: number): Promise<{ txId: string }> {
  const tokenId = process.env.HTS_TOKEN_ID;
  if (!isHederaConfigured() || !tokenId) {
    return { txId: `mock-${Date.now()}` };
  }

  const client = getHederaClient();
  const transaction = await new TokenMintTransaction()
    .setTokenId(tokenId)
    .setAmount(amount)
    .execute(client);

  await transaction.getReceipt(client);
  return { txId: transaction.transactionId.toString() };
}

export async function transferPoints(
  toAccountId: string,
  amount: number
): Promise<TransferResult> {
  const tokenId = process.env.HTS_TOKEN_ID;
  if (!isHederaConfigured() || !tokenId) {
    return { receiptStatus: 'MOCK_SUCCESS', txHashHex: mockTxHash() };
  }

  const client = getHederaClient();
  const operatorAccountId = AccountId.fromString(process.env.HEDERA_ACCOUNT_ID!);

  const transaction = await new TransferTransaction()
    .addTokenTransfer(tokenId, operatorAccountId, -amount)
    .addTokenTransfer(tokenId, toAccountId, amount)
    .execute(client);

  const receipt = await transaction.getReceipt(client);
  return { receiptStatus: receipt.status.toString(), txHashHex: Buffer.from(transaction.transactionHash).toString('hex') };
}

export function getHashScanUrl(
  type: 'transaction' | 'topic' | 'token',
  id: string
): string {
  const baseUrl = process.env.NEXT_PUBLIC_HASHSCAN_BASE || 'https://hashscan.io/testnet';

  switch (type) {
    case 'transaction':
      return `${baseUrl}/transaction/${id}`;
    case 'topic':
      return `${baseUrl}/topic/${id}`;
    case 'token':
      return `${baseUrl}/token/${id}`;
    default:
      return baseUrl;
  }
}
