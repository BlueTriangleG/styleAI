/**
 * Script to test Stripe setup and verify products
 * Run with: node scripts/test-stripe-setup.js
 */

require('dotenv').config({ path: '.env.local' });
const Stripe = require('stripe');

if (!process.env.STRIPE_SECRET_KEY) {
    console.error('❌ STRIPE_SECRET_KEY not found in environment variables');
    process.exit(1);
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2023-10-16',
});

/**
 * Test Stripe connection and list products
 */
async function testStripeSetup() {
    try {
        console.log('🔍 Testing Stripe connection...\n');

        // Check if we're in test mode
        const isTestMode = process.env.STRIPE_SECRET_KEY.startsWith('sk_test_');
        console.log(`🔑 Mode: ${isTestMode ? 'TEST' : 'LIVE'}`);

        if (!isTestMode) {
            console.log('⚠️  Warning: You are using LIVE keys! Be careful with real payments.');
        }

        // Test connection by listing products
        console.log('\n📦 Fetching products...');
        const products = await stripe.products.list({ limit: 10 });

        console.log(`✅ Found ${products.data.length} products:`);

        for (const product of products.data) {
            console.log(`\n• ${product.name} (${product.id})`);
            console.log(`  Description: ${product.description || 'No description'}`);
            console.log(`  Active: ${product.active}`);

            // Get prices for this product
            const prices = await stripe.prices.list({ product: product.id });
            if (prices.data.length > 0) {
                console.log(`  Prices:`);
                prices.data.forEach(price => {
                    const amount = price.unit_amount ? `$${(price.unit_amount / 100).toFixed(2)}` : 'Free';
                    console.log(`    - ${amount} ${price.currency.toUpperCase()} (${price.id})`);
                });
            }
        }

        // Test customer creation
        console.log('\n👤 Testing customer creation...');
        const testCustomer = await stripe.customers.create({
            email: 'test@example.com',
            name: 'Test User',
            metadata: {
                test: 'true',
            },
        });

        console.log(`✅ Test customer created: ${testCustomer.id}`);

        // Clean up test customer
        await stripe.customers.del(testCustomer.id);
        console.log(`🗑️  Test customer deleted`);

        console.log('\n🎉 Stripe setup is working correctly!');
        console.log('\n📋 Test card numbers for payments:');
        console.log('• Success: 4242 4242 4242 4242');
        console.log('• Declined: 4000 0000 0000 0002');
        console.log('• Requires authentication: 4000 0027 6000 3184');
        console.log('• Insufficient funds: 4000 0000 0000 9995');

    } catch (error) {
        console.error('\n❌ Stripe setup test failed:', error.message);

        if (error.type === 'StripeAuthenticationError') {
            console.log('\n💡 This usually means your API key is invalid or not set correctly.');
            console.log('Check your .env.local file and make sure STRIPE_SECRET_KEY is set.');
        }

        process.exit(1);
    }
}

// Run the test
testStripeSetup(); 