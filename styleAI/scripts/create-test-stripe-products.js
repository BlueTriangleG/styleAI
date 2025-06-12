/**
 * Script to create Stripe products and prices for testing
 * Run with: node scripts/create-test-stripe-products.js
 */

require('dotenv').config({ path: '.env.local' });
const Stripe = require('stripe');

if (!process.env.STRIPE_SECRET_KEY) {
    console.error('❌ STRIPE_SECRET_KEY not found in environment variables');
    console.log('Please add your test secret key to .env.local:');
    console.log('STRIPE_SECRET_KEY=sk_test_...');
    process.exit(1);
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2025-03-31.basil',
});

/**
 * Credit tiers to create
 */
const CREDIT_TIERS = [
    {
        id: 'basic',
        name: 'Basic',
        description: 'Perfect for getting started',
        price: 5,
        credits: 50,
    },
    {
        id: 'standard',
        name: 'Standard',
        description: '20% bonus credits',
        price: 10,
        credits: 120,
    },
    {
        id: 'premium',
        name: 'Premium',
        description: '40% bonus credits',
        price: 50,
        credits: 700,
    },
];

/**
 * Create a product and price in Stripe
 */
async function createProductAndPrice(tier) {
    try {
        console.log(`\n🔄 Creating product: ${tier.name}...`);

        // Create product
        const product = await stripe.products.create({
            name: `Style AI Credits - ${tier.name}`,
            description: `${tier.description} - ${tier.credits} credits for style recommendations`,
            metadata: {
                tier: tier.id,
                credits: tier.credits.toString(),
            },
        });

        console.log(`✅ Product created: ${product.id}`);

        // Create price
        const price = await stripe.prices.create({
            product: product.id,
            unit_amount: tier.price * 100, // Convert to cents
            currency: 'usd',
            metadata: {
                tier: tier.id,
                credits: tier.credits.toString(),
            },
        });

        console.log(`✅ Price created: ${price.id}`);

        return {
            tier: tier.id,
            productId: product.id,
            priceId: price.id,
            name: tier.name,
            price: tier.price,
            credits: tier.credits,
        };
    } catch (error) {
        console.error(`❌ Error creating ${tier.name}:`, error.message);
        throw error;
    }
}

/**
 * Main function to create all products
 */
async function main() {
    try {
        console.log('🚀 Creating Stripe test products and prices...\n');

        // Check if we're in test mode
        if (!process.env.STRIPE_SECRET_KEY.startsWith('sk_test_')) {
            console.error('❌ Warning: Not using test key! Please use sk_test_... key for testing');
            process.exit(1);
        }

        const results = [];

        // Create each tier
        for (const tier of CREDIT_TIERS) {
            const result = await createProductAndPrice(tier);
            results.push(result);
        }

        console.log('\n🎉 All products created successfully!\n');

        // Generate code for stripe.ts
        console.log('📝 Update your src/lib/stripe.ts with these product IDs:\n');
        console.log('export const CREDIT_TIERS = {');

        results.forEach((result) => {
            console.log(`  ${result.tier}: {`);
            console.log(`    name: "${result.name}",`);
            console.log(`    price: ${result.price},`);
            console.log(`    credits: ${result.credits},`);
            console.log(`    productId: "${result.productId}",`);
            console.log(`    priceId: "${result.priceId}",`);
            console.log(`  },`);
        });

        console.log('};');

        console.log('\n📋 Summary:');
        results.forEach((result) => {
            console.log(`• ${result.name}: $${result.price} → ${result.credits} credits (Product: ${result.productId})`);
        });

        console.log('\n✅ You can now test payments with these test card numbers:');
        console.log('• Success: 4242 4242 4242 4242');
        console.log('• Declined: 4000 0000 0000 0002');
        console.log('• Requires authentication: 4000 0027 6000 3184');

    } catch (error) {
        console.error('\n❌ Script failed:', error.message);
        process.exit(1);
    }
}

// Run the script
main(); 