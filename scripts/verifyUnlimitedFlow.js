const API_BASE = 'http://localhost:5000/api';

async function req(url, options = {}) {
  const res = await fetch(`${API_BASE}${url}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {})
    }
  });

  const contentType = res.headers.get('content-type') || '';
  const data = contentType.includes('application/json') ? await res.json() : await res.text();

  if (!res.ok) {
    const error = new Error(data.message || `HTTP error ${res.status}`);
    error.status = res.status;
    error.data = data;
    throw error;
  }
  return data;
}

async function runVerification() {
  console.log('🚀 Starting One-Time Unlimited Membership & Flow Verification Test...');

  const testEmail = `tester_${Date.now()}@testflow.com`;
  const testPassword = 'Password123!';
  const testName = 'Unlimited Access Test User';
  const testPhone = '0912345678';

  // 1. Register new user
  console.log(`\n1. Registering test user: ${testEmail}`);
  const regRes = await req('/auth/register', {
    method: 'POST',
    body: JSON.stringify({
      name: testName,
      email: testEmail,
      password: testPassword,
      phone: testPhone
    })
  });

  const userToken = regRes.token;
  const userHeaders = { Authorization: `Bearer ${userToken}` };
  console.log('✅ User registered successfully. Free trial remaining:', regRes.user.free_trial_posts_remaining);

  // 2. Check initial posting eligibility
  console.log('\n2. Checking posting eligibility for newly registered user...');
  let eligRes = await req('/listings/user/posting-eligibility', { headers: userHeaders });
  const eligData = eligRes.data;
  console.log('Eligibility result:', eligData);
  if (!eligData.can_post) {
    throw new Error('Expected new user to have can_post = true during free trial');
  }

  // 3. Login as admin to set user free trial to 0 (simulating free trial expiration)
  console.log('\n3. Simulating free trial expiration...');
  const adminRes = await req('/auth/login', {
    method: 'POST',
    body: JSON.stringify({
      email: 'admin@gmail.com',
      password: '12345678'
    })
  });
  const adminToken = adminRes.token;
  const adminHeaders = { Authorization: `Bearer ${adminToken}` };

  await req(`/admin/users/${regRes.user.id}`, {
    method: 'PUT',
    headers: adminHeaders,
    body: JSON.stringify({
      name: testName,
      phone: testPhone,
      role: 'user',
      is_active: true,
      free_trial_posts_remaining: 0,
      has_unlimited_access: false
    })
  });
  console.log('✅ User set to 0 free trial and no unlimited access.');

  // 4. Verify post form lock & blocked status
  console.log('\n4. Verifying posting eligibility after free trial ended...');
  eligRes = await req('/listings/user/posting-eligibility', { headers: userHeaders });
  console.log('Eligibility result:', eligRes.data);
  if (eligRes.data.can_post) {
    throw new Error('User should NOT be allowed to post when free trial ended and not paid');
  }
  if (!eligRes.data.requires_payment) {
    throw new Error('Expected requires_payment = true');
  }

  // 5. Attempt creating a listing (should be blocked with 403)
  console.log('\n5. Attempting to create a listing while unpaid...');
  try {
    await req('/listings', {
      method: 'POST',
      headers: userHeaders,
      body: JSON.stringify({
        title: 'Blocked Rental Post Attempt',
        rental_price: 25000,
        price_period: 'monthly',
        category_id: 1,
        city: 'Addis Ababa',
        subcity: 'Bole',
        contact_phone: testPhone,
        description: 'This post should be blocked by server middleware because trial ended.',
        images: ['https://res.cloudinary.com/mock/image/upload/sample.jpg']
      })
    });
    throw new Error('Listing creation should have failed with 403!');
  } catch (err) {
    if (err.status === 403) {
      console.log('✅ Correctly blocked with 403:', err.data?.message);
    } else {
      throw err;
    }
  }

  // 6. Submit One-Time Unlimited Membership Payment Proof
  console.log('\n6. Submitting one-time membership payment proof (Telebirr)...');
  const payRes = await req('/payments/proof', {
    method: 'POST',
    headers: userHeaders,
    body: JSON.stringify({
      payment_method: 'telebirr',
      transaction_reference: `TB-${Date.now()}`,
      amount: 200,
      receipt_image_url: 'https://res.cloudinary.com/demo/image/upload/receipt_test.jpg',
      payment_type: 'unlimited_access'
    })
  });
  console.log('✅ Membership payment submitted:', payRes.payment);
  const paymentId = payRes.payment.id;

  // 7. Check eligibility: should show pending payment
  console.log('\n7. Verifying eligibility shows pending membership payment...');
  eligRes = await req('/listings/user/posting-eligibility', { headers: userHeaders });
  console.log('Eligibility result:', eligRes.data);
  if (!eligRes.data.pending_payment) {
    throw new Error('Expected pending_payment = true while awaiting admin review');
  }

  // 8. Admin approves the membership payment
  console.log(`\n8. Admin approving payment #${paymentId}...`);
  const approveRes = await req(`/admin/payments/${paymentId}/status`, {
    method: 'PUT',
    headers: adminHeaders,
    body: JSON.stringify({
      status: 'approved',
      admin_notes: 'Verified via bank app - Unlimited access approved'
    })
  });
  console.log('✅ Payment approved by admin:', approveRes.message);

  // 9. Verify user now has unlimited access
  console.log('\n9. Checking user eligibility after admin approval...');
  eligRes = await req('/listings/user/posting-eligibility', { headers: userHeaders });
  console.log('Eligibility result:', eligRes.data);
  if (!eligRes.data.can_post || !eligRes.data.has_unlimited_access) {
    throw new Error('Expected can_post = true and has_unlimited_access = true');
  }

  // 10. Post a listing now: should publish live immediately!
  console.log('\n10. Posting a listing with unlimited access...');
  const postRes = await req('/listings', {
    method: 'POST',
    headers: userHeaders,
    body: JSON.stringify({
      title: 'Luxury Villa in Bole (Unlimited Member)',
      rental_price: 65000,
      price_period: 'monthly',
      category_id: 1,
      city: 'Addis Ababa',
      subcity: 'Bole',
      contact_phone: testPhone,
      description: 'Beautiful 4 bedroom villa posted with lifetime unlimited posting access.',
      images: ['https://res.cloudinary.com/demo/image/upload/sample.jpg']
    })
  });
  console.log('✅ Listing created successfully!');
  console.log('Status:', postRes.listing.status);
  console.log('Message:', postRes.message);

  if (postRes.listing.status !== 'approved') {
    throw new Error(`Expected listing status to be 'approved', got '${postRes.listing.status}'`);
  }

  console.log('\n🎉 ALL TESTS PASSED SUCCESSFULLY! One-Time Membership logic works flawlessly!');
}

runVerification().catch((err) => {
  console.error('\n❌ Verification Failed:', err.data || err.message);
  process.exit(1);
});
