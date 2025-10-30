import { createHcsTopic, createHtsToken } from '../lib/hedera';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';

dotenv.config();

async function setupHedera() {
  console.log('🚀 AfyaUkweli Hedera Setup');
  console.log('==========================\n');

  try {
    console.log('📝 Step 1: Creating HCS Topic for task logs...');
    const { topicId } = await createHcsTopic('AfyaUkweli CHW Task Logs');
    console.log(`✅ HCS Topic Created: ${topicId}\n`);

    console.log('🪙  Step 2: Creating HTS Token (CHW Points)...');
    const { tokenId } = await createHtsToken('CHW Points', 'CHWP', 1000000);
    console.log(`✅ HTS Token Created: ${tokenId}\n`);

    console.log('📋 Summary');
    console.log('----------');
    console.log(`HCS Topic ID: ${topicId}`);
    console.log(`HTS Token ID: ${tokenId}\n`);

    console.log('⚠️  Next Steps:');
    console.log('1. Add these values to your .env file:');
    console.log(`   HCS_TOPIC_ID=${topicId}`);
    console.log(`   HTS_TOKEN_ID=${tokenId}`);
    console.log('2. Update NEXT_PUBLIC_HASHSCAN_BASE if needed');
    console.log('3. Run: npm run db:seed\n');

    const envPath = path.join(process.cwd(), '.env');
    let envContent = fs.readFileSync(envPath, 'utf-8');

    if (!envContent.includes('HCS_TOPIC_ID=')) {
      envContent += `\nHCS_TOPIC_ID=${topicId}`;
    } else {
      envContent = envContent.replace(/HCS_TOPIC_ID=.*/g, `HCS_TOPIC_ID=${topicId}`);
    }

    if (!envContent.includes('HTS_TOKEN_ID=')) {
      envContent += `\nHTS_TOKEN_ID=${tokenId}`;
    } else {
      envContent = envContent.replace(/HTS_TOKEN_ID=.*/g, `HTS_TOKEN_ID=${tokenId}`);
    }

    if (!envContent.includes('NEXT_PUBLIC_HASHSCAN_BASE=')) {
      envContent += `\nNEXT_PUBLIC_HASHSCAN_BASE=https://hashscan.io/testnet`;
    }

    fs.writeFileSync(envPath, envContent);
    console.log('✅ .env file updated automatically!\n');

  } catch (error) {
    console.error('❌ Setup failed:', error);
    process.exit(1);
  }
}

setupHedera();
