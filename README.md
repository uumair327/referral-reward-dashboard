# Referral & Rewards Dashboard

A modern, responsive web application for managing and displaying referral offers across various categories. Built with Angular 17+ and Material Design.

## Features

### Public Interface
- **Category Browse**: Explore referral offers by category (Demat Accounts, Medical Apps, Hospitality, Entertainment, Online Products)
- **Responsive Design**: Optimized for desktop, tablet, and mobile devices
- **Search & Filter**: Find specific offers with real-time search
- **Click Tracking**: Automatic tracking of referral link clicks

### Admin Dashboard
- **Category Management**: Create, edit, and organize referral categories
- **Offer Management**: Full CRUD operations for referral offers with bulk actions
- **Rich Text Editor**: Format descriptions with WYSIWYG editor
- **Admin Utilities**: Link validation, referral code generation, and content preview tools
- **Authentication**: Secure admin access with route guards

## Technology Stack

- **Frontend**: Angular 17+ with standalone components
- **UI Framework**: Angular Material Design
- **Styling**: SCSS with responsive design
- **State Management**: RxJS with Angular services
- **Storage**: Browser localStorage for data persistence
- **Build Tool**: Angular CLI with Webpack

## Getting Started

### Prerequisites
- Node.js 18.x or 20.x
- npm 9.x or higher

### Installation

1. Clone the repository
```bash
git clone <repository-url>
cd referral-reward-dashboard
```

2. Install dependencies
```bash
npm install
```

3. Start the development server
```bash
npm start
```

4. Navigate to `http://localhost:4200/`

### Admin Access
- URL: `http://localhost:4200/admin/login`
- Username: `admin`
- Password: `admin123`

## Available Scripts

- `npm start` - Start development server
- `npm run build` - Build for development
- `npm run build:prod` - Build for production
- `npm test` - Run unit tests
- `npm run test:ci` - Run tests in CI mode
- `npm run lint` - Run linting

## Project Structure

```
src/
├── app/
│   ├── models/           # Data models and interfaces
│   ├── services/         # Business logic and data services
│   ├── modules/
│   │   ├── public/       # Public-facing components
│   │   ├── admin/        # Admin dashboard components
│   │   └── shared/       # Shared components and utilities
│   └── ...
├── assets/               # Static assets
└── ...
```

## Key Components

### Public Components
- **HomeComponent**: Landing page with category grid
- **CategoryDisplayComponent**: Category-specific offer listings
- **ReferralCardComponent**: Individual offer display cards

### Admin Components
- **AdminDashboardComponent**: Main admin interface
- **CategoryManagementComponent**: Category CRUD operations
- **OfferManagementComponent**: Offer management with bulk actions
- **RichTextEditorComponent**: WYSIWYG content editor
- **UtilitiesComponent**: Admin tools and utilities

## Data Models

### Core Models
- **ReferralOffer**: Individual referral offers with links and codes
- **Category**: Offer categories with icons and descriptions
- **AdminSettings**: Application configuration settings

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support and questions, please open an issue in the GitHub repository.