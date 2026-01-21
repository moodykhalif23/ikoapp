# IKO App - Industrial Reporting System

A modern, mobile-responsive industrial reporting application built with Next.js, MongoDB, and Tailwind CSS. Features a comprehensive reporting flow with database persistence, user authentication, and modern UI/UX practices.

## Features

- **Complete Reporting Flow**: Step-by-step reporting with validation and database persistence
- **MongoDB Integration**: Full database setup with Docker and comprehensive data models
- **Mobile-First Design**: Responsive design with touch-friendly interfaces
- **Modern Typography**: Large, bold fonts with enhanced readability
- **Real-time Validation**: Form validation with immediate feedback
- **Progress Tracking**: Visual progress indicators with completion status
- **API-Driven Architecture**: RESTful API endpoints for all operations

## Tech Stack

- **Frontend**: Next.js 16, React 19, TypeScript
- **Styling**: Tailwind CSS, Material-UI Icons
- **Database**: MongoDB with Mongoose ODM
- **Containerization**: Docker & Docker Compose
- **Forms**: React Hook Form with Zod validation
- **Notifications**: Sonner toast notifications

## Quick Start

### Prerequisites

- Node.js 18+ and pnpm
- Docker and Docker Compose
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd ikoapp
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Start MongoDB with Docker**
   ```bash
   pnpm run db:start
   ```

4. **Run database migration (seed initial data)**
   ```bash
   pnpm run migrate
   ```

5. **Start the development server**
   ```bash
   pnpm run dev
   ```

6. **Access the application**
   - Main app: http://localhost:3000
   - MongoDB Admin: http://localhost:8081 (admin/password123)

## Database Setup

The application uses MongoDB running in Docker with the following services:

- **MongoDB**: Main database server
- **Mongo Express**: Web-based MongoDB admin interface

### Database Configuration

- **Host**: localhost:27017
- **Database**: ikoapp
- **Username**: admin
- **Password**: password123

### Available Scripts

```bash
# Start database services
pnpm run db:start

# Stop database services
pnpm run db:stop

# Run database migration
pnpm run migrate

# Start development server
pnpm run dev

# Build for production
pnpm run build

# Start production server
pnpm run start
```

## Project Structure

```
ikoapp/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   │   └── reports/       # Report-related endpoints
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx          # Home page
├── components/            # React components
│   ├── reporter/         # Reporting components
│   │   ├── forms/        # Individual form components
│   │   └── reporting-flow.tsx
│   └── ui/               # Reusable UI components
├── lib/                  # Utility libraries
│   ├── models/          # Mongoose models
│   ├── mongodb.ts       # Database connection
│   └── utils.ts         # Helper functions
├── docker-compose.yml    # Docker services
├── docker-entrypoint-initdb.d/  # MongoDB initialization
└── scripts/             # Migration scripts
```

## API Endpoints

### Reports

- `GET /api/reports` - List all reports
- `POST /api/reports` - Create new report
- `GET /api/reports/[id]` - Get specific report
- `PUT /api/reports/[id]` - Update report
- `DELETE /api/reports/[id]` - Delete report

### Report Sections

- `POST /api/reports/[id]/power-interruption` - Save power interruption data
- `POST /api/reports/[id]/site-visuals` - Save site visuals data
- `POST /api/reports/[id]/daily-production` - Save production data
- `POST /api/reports/[id]/incident-report` - Save incident report
- `POST /api/reports/[id]/employee-planning` - Save employee planning

## Data Models

### Report Flow

1. **Power Interruption**: Track power outages and affected equipment
2. **Site Visuals**: Upload photos and visual documentation
3. **Daily Production**: Record production metrics and efficiency
4. **Incident Report**: Document safety, equipment, or environmental incidents
5. **Employee Planning**: Track staffing and attendance

### User Roles

- **Admin**: Full system access
- **Reporter**: Can create and submit reports
- **Viewer**: Read-only access to reports

## Features Overview

### Enhanced Typography

- Large, bold headings for better readability
- Responsive font scaling
- Improved contrast and accessibility

### Mobile Responsiveness

- Touch-friendly button sizes (minimum 44px)
- Responsive grid layouts
- Optimized form inputs for mobile
- Progressive enhancement for larger screens

### Modern UX Practices

- Step-by-step wizard with progress indicators
- Real-time form validation
- Loading states and feedback
- Toast notifications for user actions
- Smooth transitions and animations

### Database Integration

- Complete CRUD operations
- Data validation at model level
- Automatic timestamps
- Relationship management between entities
- Migration system for data seeding

## Development

### Adding New Form Steps

1. Create form component in `components/reporter/forms/`
2. Add API endpoint in `app/api/reports/[id]/`
3. Create Mongoose model in `lib/models/`
4. Update reporting flow in `reporting-flow.tsx`

### Styling Guidelines

- Use Tailwind CSS classes
- Leverage brand color variables
- Follow mobile-first responsive design
- Use semantic HTML elements
- Implement proper touch targets

## Contributing

1. Fork the repository
2. Create feature branch
3. Make changes with proper TypeScript types
4. Test mobile responsiveness
5. Submit pull request

## License

This project is licensed under the MIT License.