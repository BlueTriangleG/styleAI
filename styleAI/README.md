# Style-AI

Style-AI is an AI-powered styling assistant application built with Next.js.

## Features

- AI-powered styling recommendations
- User authentication with Clerk
- Dashboard for managing your style preferences
- Responsive design for all devices

## Authentication

This project uses [Clerk](https://clerk.dev/) for authentication. Clerk provides a complete user management system with features like:

- Social login (Google, GitHub, etc.)
- Email/password authentication
- Multi-factor authentication
- User profile management
- Session management

## Getting Started

### Prerequisites

- Node.js 18.x or later
- npm or yarn
- A Clerk account (for authentication)

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/yourusername/style-ai.git
   cd style-ai
   ```

2. Install dependencies:

   ```bash
   npm install
   # or
   yarn install
   ```

3. Set up environment variables:

   - Copy `.env.local.example` to `.env.local`
   - Fill in your Clerk API keys and other environment variables

4. Run the development server:

   ```bash
   npm run dev
   # or
   yarn dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## Deployment

The application can be deployed to any platform that supports Next.js, such as Vercel, Netlify, or a custom server.

### Environment Variables

Make sure to set the following environment variables in your deployment environment:

- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`: Your Clerk publishable key
- `CLERK_SECRET_KEY`: Your Clerk secret key
- `NEXT_PUBLIC_CLERK_SIGN_IN_URL`: The sign-in URL (default: `/login`)
- `NEXT_PUBLIC_CLERK_SIGN_UP_URL`: The sign-up URL (default: `/signup`)
- `NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL`: The URL to redirect to after sign-in (default: `/dashboard`)
- `NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL`: The URL to redirect to after sign-up (default: `/dashboard`)
- `NEXT_PUBLIC_BASE_PATH`: The base path for the application (default: `/styleai`)
- `STRIPE_SECRET_KEY`: Your Stripe secret key for payment processing
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`: Your Stripe publishable key for client-side integration
- `NEXT_PUBLIC_URL`: The public URL of your application (used for Stripe redirects)

## Payment Integration

This project uses Stripe for payment processing. The following features are included:

- One-time payment checkout with Stripe Embedded Checkout
- Product: "Style recommends credit" (ID: prod_SAFz8thNESwg5S)
- Support for credit card payments

### Setting up Stripe

1. Create a Stripe account if you don't have one
2. Add your Stripe **test mode** API keys to your `.env.local` file:
   ```
   STRIPE_SECRET_KEY=sk_test_your_stripe_test_secret_key
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_test_publishable_key
   NEXT_PUBLIC_URL=http://localhost:3000
   ```
3. The application is configured to use a specific product ID. Make sure you're using test mode keys, as the product is set up in test mode.

### Testing Payments

For testing payments, you can use Stripe's test cards:

- Card number: 4242 4242 4242 4242
- Any future expiration date
- Any 3-digit CVC
- Any postal code

### Important Note on API Keys

Make sure to use **test mode** Stripe API keys, as the product is configured in test mode. Using live mode keys with test mode products will result in errors.
