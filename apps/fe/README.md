# BetterStack Frontend

A modern, responsive web application built with Next.js 15, React 19, and Tailwind CSS for monitoring website uptime and managing incidents.

## Features

- 🎨 **Modern UI**: Beautiful, responsive design with dark theme
- 🔐 **Authentication**: User signup, signin, and JWT-based authentication
- 📊 **Dashboard**: Overview of all monitored websites
- 🌐 **Website Monitoring**: Add and track website uptime
- 📈 **Status Tracking**: View detailed monitoring history and response times
- 📱 **Responsive Design**: Works perfectly on desktop, tablet, and mobile

## Tech Stack

- **Framework**: Next.js 15 with App Router
- **UI Library**: React 19
- **Styling**: Tailwind CSS 4
- **Icons**: Lucide React
- **Components**: Custom UI components with Radix UI primitives
- **State Management**: React hooks (useState, useEffect)
- **Routing**: Next.js built-in routing

## Getting Started

### Prerequisites

- Node.js 18+ or Bun
- Backend API running on port 3001

### Installation

1. Install dependencies:
   ```bash
   bun install
   # or
   npm install
   ```

2. Start the development server:
   ```bash
   bun run dev
   # or
   npm run dev
   ```

3. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
app/
├── dashboard/          # Dashboard page for managing websites
├── signin/            # User signin page
├── signup/            # User signup page
├── website/           # Website detail pages
│   └── [websiteId]/   # Dynamic route for individual websites
├── globals.css        # Global styles and CSS variables
├── layout.tsx         # Root layout component
└── page.tsx           # Landing page

components/
└── ui/                # Reusable UI components
    ├── button.tsx     # Button component with variants
    ├── card.tsx       # Card component
    ├── input.tsx      # Input field component
    ├── label.tsx      # Label component
    ├── badge.tsx      # Badge component
    └── loading.tsx    # Loading spinner component

lib/
└── utils.ts           # Utility functions
```

## API Integration

The frontend communicates with the backend API through Next.js API routes. The configuration is set up in `next.config.ts` to proxy API calls to `http://localhost:3001`.

### Available Endpoints

- `POST /api/user/signup` - User registration
- `POST /api/user/signin` - User authentication
- `GET /api/websites` - Fetch user's websites
- `POST /api/website` - Add new website
- `GET /api/status/:websiteId` - Get website monitoring status

## Authentication Flow

1. Users can sign up with username and password
2. After successful signup, they're redirected to signin
3. Upon successful signin, a JWT token is stored in localStorage
4. The token is used for authenticated API requests
5. Users are redirected to dashboard after authentication
6. Unauthorized requests redirect to signin page

## Styling

The application uses a consistent design system with:
- Dark theme with green accent colors
- CSS custom properties for consistent theming
- Tailwind CSS for utility-first styling
- Responsive design patterns
- Smooth transitions and hover effects

## Development

### Available Scripts

- `bun run dev` - Start development server
- `bun run build` - Build for production
- `bun run start` - Start production server
- `bun run lint` - Run ESLint

### Code Style

- TypeScript for type safety
- ESLint for code quality
- Prettier for code formatting
- Component-based architecture
- Custom hooks for reusable logic

## Deployment

The application can be deployed to any platform that supports Next.js:

- Vercel (recommended)
- Netlify
- AWS Amplify
- Docker containers

## Contributing

1. Follow the existing code style
2. Add TypeScript types for new features
3. Test your changes thoroughly
4. Update documentation as needed

## License

This project is part of the BetterStack clone application.
