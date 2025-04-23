# Server Actions

This directory contains Next.js server actions that handle server-side logic for the application.

## Available Actions

### `stripeActions.ts`

Server actions for Stripe payment integration.

#### `createCheckoutSession`

Creates a Stripe checkout session for a product.

```typescript
import { createCheckoutSession } from '@/app/actions/stripeActions';

// Example usage in a client component
const result = await createCheckoutSession({
  productId: 'prod_SABGtwXELcJ7EZ',
});

if (result.error || !result.clientSecret) {
  // Handle error
} else {
  // Use the client secret with Stripe.js
  const clientSecret = result.clientSecret;
}
```

#### `getCheckoutStatus`

Gets the status of a Stripe checkout session.

```typescript
import { getCheckoutStatus } from '@/app/actions/stripeActions';

// Example usage in a client component
const sessionId = 'cs_test_...'; // From URL query
const result = await getCheckoutStatus({ sessionId });

if (result.error) {
  // Handle error
} else {
  // Use session status
  const status = result.status;
}
```

## Benefits of Server Actions

1. **Direct API Access**: Server actions execute on the server, providing secure access to backend APIs and resources.
2. **Type Safety**: Fully typed interfaces ensure proper data handling between client and server.
3. **Progressive Enhancement**: Server actions work with or without JavaScript, improving reliability.
4. **Reduced API Routes**: Eliminates the need for separate API routes, simplifying the codebase.
5. **Simplified Error Handling**: Errors can be caught and handled directly in the component calling the action.

## Usage Guidelines

- Import server actions directly into client components.
- Use `try/catch` for proper error handling.
- Validate input data on the server using Zod schemas.
- Provide meaningful error messages to the client.
