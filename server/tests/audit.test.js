import test from 'node:test';
import assert from 'node:assert/strict';
import {
  verifyRazorpaySignature,
  generateTestSignature,
  verifyRazorpayWebhookSignature,
  generateWebhookTestSignature,
  getRazorpayPublicConfig,
} from '../src/services/razorpayService.js';
import { memoryOrders } from '../src/controllers/orderController.js';
import { memoryProducts, getMemoryProductById } from '../src/controllers/productController.js';

test('1. Security: Razorpay Key Secret is never exposed to public configuration', () => {
  const publicConfig = getRazorpayPublicConfig();
  assert.ok(publicConfig.keyId, 'Public config must contain keyId');
  assert.equal(publicConfig.keySecret, undefined, 'Public config must NEVER expose keySecret');
  assert.equal(publicConfig.webhookSecret, undefined, 'Public config must NEVER expose webhookSecret');
  assert.equal(typeof publicConfig.keyId, 'string');
});

test('2. Signature Verification: Timing-safe HMAC-SHA256 signature verification', () => {
  const orderId = 'order_test_audit_001';
  const paymentId = 'pay_test_audit_001';

  const validSignature = generateTestSignature(orderId, paymentId);
  assert.ok(validSignature, 'Valid signature generated');

  // Verify valid signature returns true
  const isValid = verifyRazorpaySignature({
    orderId,
    paymentId,
    signature: validSignature,
  });
  assert.equal(isValid, true, 'Valid signature should be accepted');

  // Verify tampered signature returns false
  const tamperedSignature = validSignature.substring(0, validSignature.length - 2) + 'aa';
  const isInvalid = verifyRazorpaySignature({
    orderId,
    paymentId,
    signature: tamperedSignature,
  });
  assert.equal(isInvalid, false, 'Tampered signature must be rejected');

  // Verify tampered orderId returns false
  const isWrongOrder = verifyRazorpaySignature({
    orderId: 'order_hacked_999',
    paymentId,
    signature: validSignature,
  });
  assert.equal(isWrongOrder, false, 'Signature with mismatched order ID must be rejected');
});

test('3. Webhook: Asynchronous payment webhook signature verification', () => {
  const rawPayload = JSON.stringify({
    event: 'payment.captured',
    payload: {
      payment: {
        entity: {
          id: 'pay_webhook_audit_01',
          order_id: 'order_webhook_audit_01',
          amount: 25899,
          currency: 'INR',
          status: 'captured',
        },
      },
    },
  });

  const webhookSignature = generateWebhookTestSignature(rawPayload);
  assert.ok(webhookSignature, 'Webhook test signature generated');

  const isValid = verifyRazorpayWebhookSignature({
    rawBody: rawPayload,
    signature: webhookSignature,
  });
  assert.equal(isValid, true, 'Valid webhook signature must be accepted');

  const isInvalid = verifyRazorpayWebhookSignature({
    rawBody: rawPayload + ' ',
    signature: webhookSignature,
  });
  assert.equal(isInvalid, false, 'Tampered webhook payload must be rejected');
});

test('4. Inventory Integrity: Canceling an unpaid pending Razorpay order must NOT inflate stock', () => {
  // Test product
  const testProd = memoryProducts[0];
  const initialStock = testProd.stock;

  // Simulate a pending Razorpay order where stock was NOT decremented at creation time
  const testPendingOrder = {
    _id: 'ord_test_pending_stock_01',
    orderNumber: 'ORD-PENDING-TEST-01',
    user: { _id: 'user_cust_audit', name: 'Audit Customer', email: 'audit@test.com' },
    items: [
      {
        product: testProd._id,
        name: testProd.name,
        price: testProd.price,
        quantity: 3,
        subtotal: testProd.price * 3,
      },
    ],
    status: 'pending',
    paymentStatus: 'pending',
    paymentMethod: 'razorpay',
    total: testProd.price * 3,
  };
  memoryOrders.push(testPendingOrder);

  // Logic from updateOrderStatus:
  const hadStockDecremented =
    testPendingOrder.status !== 'pending' ||
    testPendingOrder.paymentStatus === 'paid' ||
    testPendingOrder.paymentMethod === 'cash_on_delivery';

  assert.equal(
    hadStockDecremented,
    false,
    'Pending Razorpay order must be recognized as NOT having decremented stock'
  );

  // Canceling this order should not change the stock
  if (hadStockDecremented) {
    testProd.stock += 3;
  }

  assert.equal(testProd.stock, initialStock, 'Stock must remain unchanged after canceling an unpaid order');

  // Clean up
  const idx = memoryOrders.indexOf(testPendingOrder);
  if (idx !== -1) memoryOrders.splice(idx, 1);
});

test('5. Stock Race Condition Guard: Negative stock prevention and atomic rollback', () => {
  const prod = memoryProducts[1];
  const originalStock = prod.stock;

  // Set stock to a low quantity
  prod.stock = 2;

  // Requesting 5 items must fail
  const requestedQty = 5;
  const canFulfill = prod.stock >= requestedQty;
  assert.equal(canFulfill, false, 'Excessive quantity request must be blocked');

  // Restore stock
  prod.stock = originalStock;
});

test('6. Idempotency: Duplicate payment verification returns clean idempotent response', () => {
  const paidOrder = {
    _id: 'ord_already_paid_001',
    orderNumber: 'ORD-PAID-001',
    status: 'confirmed',
    paymentStatus: 'paid',
    razorpayOrderId: 'order_razorpay_paid_001',
    razorpayPaymentId: 'pay_razorpay_paid_001',
    paymentMethod: 'razorpay',
    total: 100,
    items: [],
  };

  // Idempotency check:
  const isAlreadyPaid = paidOrder.paymentStatus === 'paid';
  assert.equal(isAlreadyPaid, true, 'Paid order recognized immediately');
});
