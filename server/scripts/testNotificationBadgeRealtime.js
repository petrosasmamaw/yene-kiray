import { io } from '../../frontend/node_modules/socket.io-client/build/esm/index.js';
import pool from '../config/db.js';

const API_BASE = 'http://localhost:5000/api';
const SOCKET_URL = 'http://localhost:5000';

async function testNotificationBadgeFlow() {
  console.log('🧪 [Antigravity Terminal]: Starting Real-time Notification Badge & Seen Test...');

  // 1. Log in Client 1
  const login1Res = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'client1@gmail.com', password: '12345678' })
  });
  const client1Data = await login1Res.json();
  if (!client1Data.success) throw new Error(`Client 1 login failed: ${client1Data.message}`);
  const client1 = client1Data.user;
  const token1 = client1Data.token;
  console.log(`✅ Client 1 logged in: ${client1.name} (${client1.email})`);

  // 2. Log in Client 2
  const login2Res = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'client2@gmail.com', password: '12345678' })
  });
  const client2Data = await login2Res.json();
  if (!client2Data.success) throw new Error(`Client 2 login failed: ${client2Data.message}`);
  const client2 = client2Data.user;
  const token2 = client2Data.token;
  console.log(`✅ Client 2 logged in: ${client2.name} (${client2.email})`);

  // 3. Connect Client 1 socket and join user room (simulating browsing any page)
  const socket1 = io(SOCKET_URL, { transports: ['websocket'] });
  const socket2 = io(SOCKET_URL, { transports: ['websocket'] });

  await new Promise((resolve) => socket1.on('connect', resolve));
  await new Promise((resolve) => socket2.on('connect', resolve));

  socket1.emit('join_user', client1.id);
  socket2.emit('join_user', client2.id);
  console.log('⚡ Both client sockets connected and joined their personal rooms');

  // 4. Ensure conversation exists between Client 1 and Client 2
  const convRes = await pool.query(
    'SELECT id FROM conversations WHERE (renter_id = $1 AND owner_id = $2) OR (renter_id = $2 AND owner_id = $1) LIMIT 1',
    [client1.id, client2.id]
  );
  if (convRes.rows.length === 0) {
    throw new Error('No existing conversation found between Client 1 and Client 2');
  }
  const conversationId = convRes.rows[0].id;
  console.log(`💬 Using Conversation ID: ${conversationId}`);

  // 5. Test notification arrival when Client 1 is on another page (not joined conversation room)
  let notificationReceivedByClient1 = false;
  let receivedMessageContent = null;

  socket1.on('new_message', (msg) => {
    if (msg.conversation_id === conversationId && msg.sender_id === client2.id) {
      notificationReceivedByClient1 = true;
      receivedMessageContent = msg.content;
      console.log(`🔔 [Client 1 Notification Received]: "${msg.content}" (Sender: ${msg.sender_name})`);
    }
  });

  // Client 2 sends a message
  const testMsg = `Real-time badge test ping @ ${Date.now()}`;
  console.log(`📤 Client 2 sending message: "${testMsg}"...`);
  const sendRes = await fetch(`${API_BASE}/chat/conversations/${conversationId}/messages`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token2}`
    },
    body: JSON.stringify({ content: testMsg })
  });
  const sendData = await sendRes.json();
  if (!sendData.success) throw new Error(`Send failed: ${sendData.message}`);

  // Wait 1.5 seconds for socket event propagation
  await new Promise((r) => setTimeout(r, 1500));

  if (!notificationReceivedByClient1) {
    throw new Error('❌ Client 1 failed to receive real-time notification on their user room!');
  }
  console.log('✅ PASS: Client 1 received real-time notification badge event while browsing other pages!');

  // 6. Test seen receipt & badge auto-clearing
  let client2SawSeenReceipt = false;
  socket2.on('messages_read', ({ convId, readerId }) => {
    if (readerId === client1.id) {
      client2SawSeenReceipt = true;
      console.log(`👀 [Client 2 Seen Receipt]: Client 1 marked conversation as read!`);
    }
  });

  // Client 1 opens / marks conversation read
  console.log('📬 Client 1 opening chat and marking conversation as read...');
  socket1.emit('mark_read', { conversationId, userId: client1.id });

  await new Promise((r) => setTimeout(r, 1500));

  // 7. Verify unread count in DB for Client 1 is now 0
  const unreadCountRes = await fetch(`${API_BASE}/chat/conversations`, {
    headers: { 'Authorization': `Bearer ${token1}` }
  });
  const convList = await unreadCountRes.json();
  const targetConv = convList.conversations.find((c) => c.id === conversationId);
  const unreadCount = parseInt(targetConv?.unread_count, 10) || 0;
  console.log(`📊 Client 1 unread count after marking seen: ${unreadCount}`);

  socket1.disconnect();
  socket2.disconnect();

  if (unreadCount === 0) {
    console.log('\n🎉 ALL TESTS PASSED! Notification badge appends immediately and clears automatically on seen!');
    process.exit(0);
  } else {
    console.log(`⚠️ Expected unread count 0, got ${unreadCount}`);
    process.exit(1);
  }
}

testNotificationBadgeFlow().catch((err) => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});
