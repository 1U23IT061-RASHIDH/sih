require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const tls = require('tls');
const dns = require('dns').promises;

async function checkHost(host, port) {
  process.stdout.write(`  • Testing ${host}:${port} ... `);
  try {
    const addresses = await dns.lookup(host);
    process.stdout.write(`[DNS: ${addresses.address}] `);

    await new Promise((resolve, reject) => {
      const socket = tls.connect(
        {
          host,
          port: parseInt(port, 10),
          servername: host,
          rejectUnauthorized: false,
          timeout: 4000,
        },
        () => {
          socket.end();
          resolve();
        }
      );
      socket.on('error', (err) => reject(err));
      socket.on('timeout', () => {
        socket.destroy();
        reject(new Error('Connection timed out'));
      });
    });
    console.log('✅ TLS Connected');
    return true;
  } catch (err) {
    console.log(`❌ TLS Handshake Failed (${err.message})`);
    return false;
  }
}

async function testConnection() {
  console.log('=====================================================');
  console.log('           DATABASE CONNECTION TEST                  ');
  console.log('=====================================================\n');

  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    console.error('❌ Error: DATABASE_URL is not defined in .env');
    process.exit(1);
  }

  const maskedUrl = dbUrl.replace(/(:\/\/[^:]+:)([^@]+)(@)/, '$1******$3');
  console.log(`📡 Target URL: ${maskedUrl}\n`);

  // Step 1: Network & TLS Reachability
  console.log('1️⃣  Testing Network & TLS Handshake:');
  const hostMatch = dbUrl.match(/@([^/?]+)/);
  let tlsSuccess = true;
  if (hostMatch) {
    const hosts = hostMatch[1].split(',');
    for (const h of hosts) {
      const [hostname, port = '27017'] = h.split(':');
      const ok = await checkHost(hostname, port);
      if (!ok) tlsSuccess = false;
    }
  }

  // Step 2: Prisma Client Query Test
  console.log('\n2️⃣  Testing Prisma Client & Database Queries:');
  const prisma = new PrismaClient({
    datasources: {
      db: {
        url: dbUrl,
      },
    },
    log: ['error'],
  });

  const queryWithTimeout = (promise, ms = 6000) => {
    return Promise.race([
      promise,
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error(`Operation timed out after ${ms / 1000}s`)), ms)
      ),
    ]);
  };

  try {
    await queryWithTimeout(prisma.$connect(), 5000);
    console.log('  ✅ Prisma Client Initialized ($connect OK)');

    console.log('  • Querying User collection...');
    const userCount = await queryWithTimeout(prisma.user.count(), 5000);
    console.log(`  ✅ Users count: ${userCount}`);

    console.log('  • Querying Pass collection...');
    const passCount = await queryWithTimeout(prisma.pass.count(), 5000);
    console.log(`  ✅ Passes count: ${passCount}`);

    console.log('\n=====================================================');
    console.log('🎉 RESULT: Database is FULLY CONNECTED and accessible!');
    console.log('=====================================================');
  } catch (error) {
    console.log(`\n❌ Database Query Error: ${error.message}`);

    console.log('\n=====================================================');
    console.log('🔍 ROOT CAUSE & SOLUTION:');
    console.log('=====================================================');
    if (
      error.message.includes('InternalError') ||
      error.message.includes('Server selection timeout') ||
      !tlsSuccess
    ) {
      console.log('👉 MongoDB Atlas IP Whitelist Issue (TLS Alert 80):');
      console.log('   MongoDB Atlas is rejecting the connection because your current');
      console.log('   public IP address is not whitelisted in Atlas Network Access.\n');
      console.log('   🛠️ Fix:');
      console.log('   1. Log into your MongoDB Atlas dashboard (cloud.mongodb.com).');
      console.log('   2. Navigate to "Security" -> "Network Access".');
      console.log('   3. Click "Add IP Address" and either:');
      console.log('      - Click "Add Current IP Address", OR');
      console.log('      - Add "0.0.0.0/0" (Allow access from anywhere for development).');
      console.log('   4. Save and wait 1-2 minutes for Atlas to deploy the change.');
    } else {
      console.log(`👉 Please verify credentials and DATABASE_URL format in .env.`);
    }
  } finally {
    await prisma.$disconnect();
  }
}

testConnection();
