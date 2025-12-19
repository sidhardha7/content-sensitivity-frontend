# Frontend - Video Content Sensitivity Analysis Platform

A modern React + Vite + TypeScript frontend application for video management and content sensitivity analysis.

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Running the Application](#running-the-application)
- [Project Structure](#project-structure)
- [Environment Variables](#environment-variables)
- [Building for Production](#building-for-production)
- [Troubleshooting](#troubleshooting)

## ✨ Features

- **Modern UI** with shadcn/ui components
- **Dark/Light Theme** with system preference detection
- **Responsive Design** - Mobile, tablet, and desktop support
- **Real-Time Updates** via Socket.io
- **Video Upload** with progress tracking
- **Video Library** with search and filtering
- **Content Analysis** with real-time progress
- **User Management** (Admin only)
- **Role-Based Access Control** - Viewer, Editor, Admin
- **Toast Notifications** with Sonner

## 🛠️ Tech Stack

- **Framework**: React 19
- **Build Tool**: Vite 7
- **Language**: TypeScript
- **Styling**: Tailwind CSS 3.4
- **UI Components**: shadcn/ui (Radix UI)
- **Routing**: React Router 7
- **HTTP Client**: Axios
- **Real-Time**: Socket.io Client
- **Notifications**: Sonner
- **Icons**: Lucide React
- **3D Graphics**: Three.js + React Three Fiber

## 📦 Prerequisites

Before you begin, ensure you have:

- **Node.js** (v18 or higher) - [Download](https://nodejs.org/)
- **npm** (comes with Node.js) or **yarn**
- **Backend API** running (see [Backend README](../backend/README.md))

## 🚀 Installation

### Step 1: Navigate to Frontend Directory

```bash
cd frontend
```

### Step 2: Install Dependencies

```bash
npm install
```

### Step 3: Set Up Environment Variables

Create a `.env` file in the `frontend` directory:

```bash
cp .env.example .env
```

Edit the `.env` file:

```env
VITE_API_URL=http://localhost:5000/api
```

For production, use your deployed backend URL:

```env
VITE_API_URL=https://content-sensitivity-backend-production.up.railway.app/api
```

### Step 4: Start Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:5173`

## ⚙️ Configuration

### Environment Variables

Create a `.env` file in the `frontend` directory:

```env
# Backend API URL (required)
VITE_API_URL=http://localhost:5000/api
```

**Important:**

- The URL must include `/api` at the end
- Use full URL (with `http://` or `https://`) for production
- Vite requires the `VITE_` prefix for environment variables

### API Configuration

The frontend automatically configures:

- **Base URL**: From `VITE_API_URL` environment variable
- **JWT Token**: Stored in `localStorage` and sent in Authorization header
- **Socket.io**: Connects to backend Socket.io server
- **CORS**: Handled by backend

## 🏃 Running the Application

### Development Mode

```bash
npm run dev
```

This starts the Vite development server with:

- Hot Module Replacement (HMR)
- Fast refresh
- Source maps
- TypeScript checking

### Production Build

```bash
# Build for production
npm run build

# Preview production build locally
npm run preview
```

The build output will be in the `dist/` directory.

### Linting

```bash
npm run lint
```

## 📁 Project Structure

```
frontend/
├── src/
│   ├── components/
│   │   ├── admin/              # Admin-specific components
│   │   │   ├── CreateUserDialog.tsx
│   │   │   ├── EditUserDialog.tsx
│   │   │   ├── DeleteUserDialog.tsx
│   │   │   ├── VideoPermissionsDialog.tsx
│   │   │   └── UsersTable.tsx
│   │   ├── video/              # Video-related components
│   │   │   ├── VideoPlayer.tsx
│   │   │   ├── VideoInfo.tsx
│   │   │   ├── VideoAssignments.tsx
│   │   │   ├── VideoUploadDialog.tsx
│   │   │   ├── ProcessingProgress.tsx
│   │   │   └── DeleteVideoDialog.tsx
│   │   ├── ui/                 # shadcn/ui components
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── dialog.tsx
│   │   │   ├── input.tsx
│   │   │   └── select.tsx
│   │   ├── Antigravity.tsx     # Background animation
│   │   ├── Layout.tsx          # Main layout wrapper
│   │   ├── Sidebar.tsx         # Navigation sidebar
│   │   ├── ProtectedRoute.tsx  # Route protection
│   │   └── ThemeToggle.tsx     # Theme switcher
│   ├── context/
│   │   ├── AuthContext.tsx      # Authentication state
│   │   ├── SocketContext.tsx   # Socket.io connection
│   │   └── ThemeContext.tsx    # Theme management
│   ├── pages/
│   │   ├── Login.tsx           # Login page
│   │   ├── Register.tsx        # Registration page
│   │   ├── Dashboard.tsx       # Dashboard with stats
│   │   ├── VideoLibrary.tsx    # Video list page
│   │   ├── VideoDetail.tsx    # Video detail page
│   │   ├── VideoUpload.tsx    # Upload page (legacy)
│   │   └── AdminUsers.tsx      # User management (admin)
│   ├── lib/
│   │   ├── api.ts              # Axios instance & interceptors
│   │   └── utils.ts            # Utility functions
│   ├── App.tsx                 # Main app component
│   ├── main.tsx                # Application entry point
│   └── index.css               # Global styles
├── public/                     # Static assets
├── dist/                       # Build output (production)
├── package.json
├── vite.config.ts              # Vite configuration
├── tailwind.config.js          # Tailwind CSS configuration
├── tsconfig.json               # TypeScript configuration
└── .env                        # Environment variables
```

## 🎨 UI Components

### shadcn/ui

This project uses [shadcn/ui](https://ui.shadcn.com/) components built on Radix UI:

- **Button** - Various button styles
- **Card** - Container components
- **Dialog** - Modal dialogs
- **Input** - Form inputs
- **Select** - Dropdown selects

### Adding New Components

```bash
npx shadcn@latest add <component-name>
```

Example:

```bash
npx shadcn@latest add table
npx shadcn@latest add toast
```

## 🌓 Theme System

The application supports dark and light themes:

- **System Preference**: Automatically detects OS theme
- **Manual Toggle**: Theme switcher in sidebar
- **Persistence**: Theme preference saved in `localStorage`
- **Default**: Dark mode

### Theme Colors

Custom colors defined in `src/index.css`:

- Background: `#181818` (dark), `#ffffff` (light)
- Borders: Greyish tones
- Primary: Theme-aware colors

## 📱 Responsive Design

The application is fully responsive:

- **Mobile**: Hamburger menu, stacked layouts
- **Tablet**: Collapsible sidebar, adaptive grids
- **Desktop**: Full sidebar, multi-column layouts

### Breakpoints

- `sm`: 640px
- `md`: 768px
- `lg`: 1024px
- `xl`: 1280px

## 🔐 Authentication Flow

1. User logs in via `/login`
2. JWT token stored in `localStorage`
3. Token sent in `Authorization` header for all API requests
4. Token automatically refreshed on API calls
5. On 401 error, user redirected to login

## 📡 API Integration

### Axios Instance

Configured in `src/lib/api.ts`:

- Base URL from `VITE_API_URL`
- JWT token injection
- 401 error handling
- Request/response interceptors

### Usage Example

```typescript
import api from "@/lib/api";

// GET request
const response = await api.get("/videos");
const videos = response.data.videos;

// POST request
const response = await api.post("/videos/upload", formData, {
  headers: { "Content-Type": "multipart/form-data" },
});
```

## 🔄 Real-Time Updates

Socket.io integration for real-time video processing updates:

```typescript
import { useSocket } from "@/context/SocketContext";

const { socket } = useSocket();

socket?.on("processing:progress", (data) => {
  // Update UI with progress
});
```

## 🏗️ Building for Production

### Build Command

```bash
npm run build
```

This creates an optimized production build in `dist/`:

- Minified JavaScript
- Optimized CSS
- Asset optimization
- Tree shaking

### Deployment

#### Vercel (Recommended)

1. Connect GitHub repository
2. Set build command: `npm run build`
3. Set output directory: `dist`
4. Add environment variable: `VITE_API_URL`
5. Deploy!

#### Netlify

1. Connect GitHub repository
2. Build command: `npm run build`
3. Publish directory: `dist`
4. Add environment variable: `VITE_API_URL`
5. Deploy!

#### Manual Deployment

1. Build: `npm run build`
2. Upload `dist/` folder to web server
3. Configure server to serve `index.html` for all routes (SPA routing)

## 🐛 Troubleshooting

### Build Errors

**Issue**: `Cannot find module '@/'`

- **Solution**: Check `tsconfig.json` and `vite.config.ts` for path alias configuration

**Issue**: `shadcn not finding import alias`

- **Solution**: Ensure path aliases are in main `tsconfig.json`, not just `tsconfig.app.json`

### Runtime Errors

**Issue**: `Cannot connect to backend`

- **Solution**:
  - Verify `VITE_API_URL` is correct
  - Check backend is running
  - Verify CORS settings on backend

**Issue**: `401 Unauthorized` on all requests

- **Solution**:
  - Login again to get new token
  - Check token is stored in `localStorage`
  - Verify backend JWT_SECRET matches

**Issue**: `Socket.io connection failed`

- **Solution**:
  - Check Socket.io server is running
  - Verify Socket.io URL matches backend URL
  - Check authentication token is valid

### UI Issues

**Issue**: Theme not applying on page load

- **Solution**: Check `index.html` has inline script to set theme before React loads

**Issue**: Components not styled correctly

- **Solution**:
  - Verify Tailwind CSS is configured
  - Check `index.css` imports Tailwind directives
  - Ensure PostCSS is configured

## 📝 Development Tips

### Adding New Pages

1. Create component in `src/pages/`
2. Add route in `src/App.tsx`
3. Add navigation link in `src/components/Sidebar.tsx` (if needed)

### Adding New API Calls

1. Use `api` instance from `src/lib/api.ts`
2. Handle errors appropriately
3. Update loading states
4. Show toast notifications for user feedback

### Styling Guidelines

- Use Tailwind CSS utility classes
- Follow shadcn/ui design patterns
- Maintain responsive design
- Use theme-aware colors (`bg-background`, `text-foreground`, etc.)

## 📦 Dependencies

### Core Dependencies

- `react` & `react-dom` - UI framework
- `react-router-dom` - Routing
- `axios` - HTTP client
- `socket.io-client` - Real-time communication
- `sonner` - Toast notifications

### UI Dependencies

- `tailwindcss` - CSS framework
- `@radix-ui/*` - UI primitives
- `lucide-react` - Icons
- `class-variance-authority` - Component variants

## 🔒 Security Considerations

- JWT tokens stored in `localStorage` (consider `httpOnly` cookies for production)
- API URLs should use HTTPS in production
- Environment variables are exposed to client (use only public config)
- CORS handled by backend

## 📄 License

ISC

## 👥 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a Pull Request

## 📞 Support

For issues and questions:

- Check the [Backend README](../backend/README.md)
- Review the main [README.md](../README.md)
- Open a GitHub issue

---

Built with ❤️ using React, Vite, and TypeScript
