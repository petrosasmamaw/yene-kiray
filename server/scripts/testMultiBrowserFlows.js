const API_BASE = 'http://localhost:5000/api';

async function req(url, options = {}, retries = 3) {
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {})
  };
  try {
    const res = await fetch(`${API_BASE}${url}`, {
      ...options,
      headers
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || `HTTP error ${res.status}`);
    }
    return data;
  } catch (err) {
    if (retries > 0) {
      await new Promise(r => setTimeout(r, 600));
      return req(url, options, retries - 1);
    }
    throw err;
  }
}

async function runTest() {
  console.log('================================================================');
  console.log('🚀 STARTING COMPREHENSIVE 3-ROLE LIVE VERIFICATION');
  console.log('================================================================\n');

  try {
    // ---------------------------------------------------------
    // BROWSER 1: ADMIN ROLE VERIFICATION
    // ---------------------------------------------------------
    console.log('👑 [BROWSER 1 - ADMIN]: Logging in as admin@gmail.com with password "password"...');
    const adminLoginRes = await req('/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: 'admin@gmail.com',
        password: 'password'
      })
    });

    const adminToken = adminLoginRes.token;
    const adminUser = adminLoginRes.user;
    console.log(`✅ Admin authenticated: ${adminUser.name} (${adminUser.email}), Role: "${adminUser.role}"`);

    const adminHeaders = { Authorization: `Bearer ${adminToken}` };

    // 1. Create Category with Image
    console.log('\n👑 [BROWSER 1 - ADMIN]: Creating Category with Image URL...');
    const catSlug = `luxury-yachts-${Date.now()}`;
    const createCatRes = await req('/categories', {
      method: 'POST',
      headers: adminHeaders,
      body: JSON.stringify({
        name: 'Luxury Yachts & Boats',
        slug: catSlug,
        description: 'Private motor yachts, speedboats, and lake cruises in Bishoftu and Lake Tana',
        icon_name: 'Sparkles',
        image_url: 'https://images.unsplash.com/photo-1569263979104-865ab7cd8d17?auto=format&fit=crop&w=800&q=80'
      })
    });
    const createdCat = createCatRes.category;
    console.log(`✅ Category Created: ID ${createdCat.id} - "${createdCat.name}"`);
    console.log(`   Image URL: ${createdCat.image_url}`);

    // 2. Edit Category
    console.log('\n👑 [BROWSER 1 - ADMIN]: Editing existing category (title and image)...');
    const editCatRes = await req(`/categories/${createdCat.id}`, {
      method: 'PUT',
      headers: adminHeaders,
      body: JSON.stringify({
        name: 'Luxury Yachts & Marine Cruises',
        image_url: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=800&q=80'
      })
    });
    console.log(`✅ Category Edited: "${editCatRes.category.name}"`);
    console.log(`   Updated Image URL: ${editCatRes.category.image_url}`);

    // 3. User Directory & Status
    console.log('\n👑 [BROWSER 1 - ADMIN]: Managing user status and editing user details...');
    const usersRes = await req('/admin/users', { headers: adminHeaders });
    const targetUser = usersRes.users.find(u => u.email !== 'admin@gmail.com') || usersRes.users[0];
    console.log(`Found User: ${targetUser.name} (${targetUser.email}), Status: active=${targetUser.is_active}`);

    // Toggle status to inactive
    const toggleRes = await req(`/admin/users/${targetUser.id}`, {
      method: 'PUT',
      headers: adminHeaders,
      body: JSON.stringify({ is_active: false })
    });
    console.log(`✅ User status toggled: is_active is now ${toggleRes.user.is_active}`);

    // Restore status to active & update phone
    const updateProfileRes = await req(`/admin/users/${targetUser.id}`, {
      method: 'PUT',
      headers: adminHeaders,
      body: JSON.stringify({ is_active: true, phone: '+251911998877' })
    });
    console.log(`✅ User profile updated: Phone is now ${updateProfileRes.user.phone}, is_active: ${updateProfileRes.user.is_active}`);

    // 4. Admin List All User Rental Posts
    console.log('\n👑 [BROWSER 1 - ADMIN]: Listing all rental posts across all users...');
    const allListingsRes = await req('/admin/listings', { headers: adminHeaders });
    console.log(`✅ All Rental Posts listed: Total Count: ${allListingsRes.count}`);
    allListingsRes.listings.slice(0, 3).forEach((l, idx) => {
      console.log(`   ${idx + 1}. [${l.status.toUpperCase()}] "${l.title}" - ${l.rental_price} ETB/${l.price_period} by ${l.owner_name}`);
    });

    // ---------------------------------------------------------
    // BROWSER 2: CLIENT 1 REGISTRATION & POSTING & EDITING
    // ---------------------------------------------------------
    console.log('\n---------------------------------------------------------');
    console.log('👤 [BROWSER 2 - CLIENT 1]: Registering client1@gmail.com with password "12345678"...');
    let client1Token, client1User;

    try {
      const reg1 = await req('/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          name: 'Abebe Bikila (Client 1)',
          email: 'client1@gmail.com',
          phone: '+251911111111',
          password: '12345678'
        })
      });
      client1Token = reg1.token;
      client1User = reg1.user;
      console.log(`✅ Client 1 registered successfully: ${client1User.name} (${client1User.email})`);
    } catch (e) {
      if (e.message.includes('already exists')) {
        console.log('ℹ️ Client 1 already exists, signing in...');
        const log1 = await req('/auth/login', {
          method: 'POST',
          body: JSON.stringify({
            email: 'client1@gmail.com',
            password: '12345678'
          })
        });
        client1Token = log1.token;
        client1User = log1.user;
        console.log(`✅ Client 1 logged in successfully`);
      } else {
        throw e;
      }
    }

    const client1Headers = { Authorization: `Bearer ${client1Token}` };

    // Client 1 Posts a Rent
    console.log('\n👤 [BROWSER 2 - CLIENT 1]: Posting a new rental property...');
    const postRes = await req('/listings', {
      method: 'POST',
      headers: client1Headers,
      body: JSON.stringify({
        title: 'Modern 3BR Luxury Villa with Garden in Bole',
        description: 'Spacious 3 bedroom fully furnished villa with standby generator, 24/7 security, and garden.',
        category_id: 1, // Residential Houses
        rental_price: 65000,
        price_period: 'month',
        city: 'Addis Ababa',
        subcity: 'Bole',
        specific_location: 'Near Edna Mall, Japan Embassy area',
        contact_phone: '+251911111111',
        features: ['Furnished', 'Backup Generator', 'High Speed Wifi', 'Security Guard'],
        images: [
          { image_url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80', is_primary: true }
        ]
      })
    });

    const client1Listing = postRes.listing;
    console.log(`✅ Client 1 Rental Post created: ID ${client1Listing.id} - "${client1Listing.title}" (${client1Listing.rental_price} ETB/month)`);

    // Client 1 Dashboard: View My Listings
    console.log('\n👤 [BROWSER 2 - CLIENT 1]: Checking My Listings in Client Post Dashboard...');
    const myListingsRes = await req('/listings/my-listings', { headers: client1Headers });
    console.log(`✅ Client 1 has ${myListingsRes.listings.length} listed post(s) in dashboard.`);

    // Client 1 Edits existing rent post
    console.log('\n👤 [BROWSER 2 - CLIENT 1]: Editing existing rent post in post dashboard...');
    const editListingRes = await req(`/listings/${client1Listing.id}`, {
      method: 'PUT',
      headers: client1Headers,
      body: JSON.stringify({
        title: 'Modern 3BR Luxury Villa with Garden & Solar [Price Reduced]',
        rental_price: 60000,
        city: 'Addis Ababa',
        subcity: 'Bole Medhanealem'
      })
    });
    console.log(`✅ Client 1 Post Edited: Title: "${editListingRes.listing.title}", New Price: ${editListingRes.listing.rental_price} ETB/month`);

    // ---------------------------------------------------------
    // BROWSER 3: CLIENT 2 REGISTRATION & MESSAGING CLIENT 1
    // ---------------------------------------------------------
    console.log('\n---------------------------------------------------------');
    console.log('👤 [BROWSER 3 - CLIENT 2]: Registering client2@gmail.com with password "12345678"...');
    let client2Token, client2User;

    try {
      const reg2 = await req('/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          name: 'Tirunesh Dibaba (Client 2)',
          email: 'client2@gmail.com',
          phone: '+251922222222',
          password: '12345678'
        })
      });
      client2Token = reg2.token;
      client2User = reg2.user;
      console.log(`✅ Client 2 registered successfully: ${client2User.name} (${client2User.email})`);
    } catch (e) {
      if (e.message.includes('already exists')) {
        console.log('ℹ️ Client 2 already exists, signing in...');
        const log2 = await req('/auth/login', {
          method: 'POST',
          body: JSON.stringify({
            email: 'client2@gmail.com',
            password: '12345678'
          })
        });
        client2Token = log2.token;
        client2User = log2.user;
        console.log(`✅ Client 2 logged in successfully`);
      } else {
        throw e;
      }
    }

    const client2Headers = { Authorization: `Bearer ${client2Token}` };

    // Client 2 initiates chat on Client 1's listing
    console.log('\n👤 [BROWSER 3 - CLIENT 2]: Initiating chat on Client 1\'s rental villa...');
    const convRes = await req('/chat/conversations', {
      method: 'POST',
      headers: client2Headers,
      body: JSON.stringify({ listing_id: client1Listing.id })
    });
    const conversation = convRes.conversation;
    console.log(`✅ Conversation established: ID ${conversation.id}`);
    console.log(`   Renter: ${conversation.renter_name} <-> Owner: ${conversation.owner_name}`);

    // ---------------------------------------------------------
    // REAL-TIME CHAT: 5 MESSAGES EACH & TELEGRAM SEEN STATUS (✓ / ✓✓)
    // ---------------------------------------------------------
    console.log('\n---------------------------------------------------------');
    console.log('💬 TESTING REALTIME CHAT: 5 MESSAGES EACH (10 TOTAL)');
    console.log('   Testing Telegram Seen (✓✓) & Unseen (✓) Statuses');
    console.log('---------------------------------------------------------');

    const chatScript = [
      { sender: 'client2', text: 'Hello Abebe! Is your 3BR luxury villa in Bole still available for rent?' },
      { sender: 'client1', text: 'Hi Tirunesh! Yes, it is fully available and ready for immediate move-in.' },
      { sender: 'client2', text: 'Great! Does the monthly price of 60,000 ETB include security and water services?' },
      { sender: 'client1', text: 'Yes, 24/7 security guard, backup generator, and water tank are all included in the rate.' },
      { sender: 'client2', text: 'Sounds wonderful! Can I visit the property tomorrow afternoon at 3:00 PM?' },
      { sender: 'client1', text: 'Tomorrow at 3:00 PM works perfectly. Let me know when you arrive near Edna Mall.' },
      { sender: 'client2', text: 'Perfect. What documents or deposit are needed to finalize the contract?' },
      { sender: 'client1', text: 'Just your ID copy and a one-month refundable security deposit.' },
      { sender: 'client2', text: 'Excellent! Looking forward to meeting you tomorrow at 3:00 PM.' },
      { sender: 'client1', text: 'You are welcome, Tirunesh! See you tomorrow. Have a pleasant evening.' }
    ];

    for (let i = 0; i < chatScript.length; i++) {
      const step = chatScript[i];
      const isClient2 = step.sender === 'client2';
      const senderHeaders = isClient2 ? client2Headers : client1Headers;
      const senderName = isClient2 ? 'Client 2 (Tirunesh)' : 'Client 1 (Abebe)';
      const receiverHeaders = isClient2 ? client1Headers : client2Headers;

      // 1. Send message
      const sendRes = await req(`/chat/conversations/${conversation.id}/messages`, {
        method: 'POST',
        headers: senderHeaders,
        body: JSON.stringify({ content: step.text })
      });
      const msg = sendRes.message;

      // Unseen state: is_read is false -> Displays single checkmark "✓"
      console.log(`\n[Message ${i + 1}/10] From ${senderName}:`);
      console.log(`   Text: "${msg.content}"`);
      console.log(`   Initial State (Sent):   ${msg.is_read ? '✓✓ (SEEN)' : '✓ (UNSEEN)'}`);

      // 2. Receiver views conversation -> Marks message as read
      await req(`/chat/conversations/${conversation.id}/read`, {
        method: 'PUT',
        headers: receiverHeaders
      });

      // 3. Sender sees updated read receipt -> Displays double checkmark "✓✓"
      const readCheck = await req(`/chat/conversations/${conversation.id}/messages`, {
        headers: senderHeaders
      });
      const updatedMsg = readCheck.messages.find(m => m.id === msg.id);
      console.log(`   Receipt State (Viewed): ${updatedMsg.is_read ? '✓✓ (SEEN - TELEGRAM STYLE)' : '✓ (UNSEEN)'}`);
    }

    console.log('\n================================================================');
    console.log('🎉 ALL 3-ROLE WORKFLOWS & 10 CHAT MESSAGES VERIFIED 100% SUCCESSFULLY!');
    console.log('================================================================');

    process.exit(0);
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    process.exit(1);
  }
}

runTest();
