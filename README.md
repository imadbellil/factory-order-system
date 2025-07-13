# Internal Factory Order Management System

A complete production-ready web application for managing internal factory production orders across three departments: Rouiba, Meftah, and Hangar.

## 🚀 Features

- **Role-based Authentication**: Firebase Authentication with three user roles
- **Real-time Updates**: Live order status updates using Firestore
- **Responsive Design**: Optimized for mobile, tablet, and desktop
- **Production Ready**: Complete error handling, validation, and security
- **Dark/Light Mode**: Theme toggle for different working conditions
- **Offline Support**: PWA-ready with caching capabilities

## 🏗️ Architecture

### User Roles & Permissions

1. **Rouiba**
   - Create new production orders
   - View own order history
   - Track order status

2. **Meftah**
   - View pending orders
   - Accept or reject orders with reasons
   - Real-time notifications

3. **Hangar**
   - View accepted orders
   - Update order status through production stages:
     - Commande lancée
     - En cours de production
     - Fini
     - Marchandise chargée

### Tech Stack

- **Frontend**: React + TypeScript + Tailwind CSS
- **Backend**: Firebase (Auth + Firestore)
- **Icons**: Lucide React
- **Routing**: React Router DOM
- **Build Tool**: Vite

## 📦 Installation

1. **Clone and install dependencies**:
```bash
npm install
```

2. **Firebase Setup**:
   - Create a new Firebase project at [Firebase Console](https://console.firebase.google.com)
   - Enable Authentication (Email/Password)
   - Create Firestore database
   - Copy your Firebase config to `src/services/firebase.ts`

3. **Update Firebase Configuration**:
```typescript
// src/services/firebase.ts
const firebaseConfig = {
  apiKey: "your-api-key",
  authDomain: "your-project-id.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project-id.appspot.com",
  messagingSenderId: "123456789",
  appId: "your-app-id"
};
```

4. **Deploy Firestore Security Rules**:
```bash
firebase deploy --only firestore:rules
firebase deploy --only firestore:indexes
```

5. **Create Demo Users** (in Firebase Console Authentication):
   - rouiba@factory.com / password (role: rouiba)
   - meftah@factory.com / password (role: meftah)
   - hangar@factory.com / password (role: hangar)

6. **Add User Profiles** (in Firestore users collection):
```javascript
// Document ID: user-uid-from-auth
{
  email: "rouiba@factory.com",
  role: "rouiba",
  displayName: "Rouiba User",
  createdAt: new Date()
}
```

## 🚀 Development

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## 📱 Deployment

### Firebase Hosting

1. **Install Firebase CLI**:
```bash
npm install -g firebase-tools
```

2. **Login and initialize**:
```bash
firebase login
firebase init hosting
```

3. **Build and deploy**:
```bash
npm run build
firebase deploy
```

### Vercel

1. **Install Vercel CLI**:
```bash
npm install -g vercel
```

2. **Deploy**:
```bash
npm run build
vercel --prod
```

## 🔐 Security Features

- Firebase Authentication with email/password
- Firestore security rules for role-based access
- Input validation and sanitization
- Error boundaries and graceful error handling
- HTTPS enforcement in production

## 📊 Database Schema

### Users Collection
```typescript
{
  id: string,           // Firebase Auth UID
  email: string,
  role: 'rouiba' | 'meftah' | 'hangar',
  displayName: string,
  createdAt: Timestamp
}
```

### Orders Collection
```typescript
{
  id: string,           // Auto-generated
  productType: string,
  quantity: number,
  machineName: string,
  status: 'pending' | 'accepted' | 'rejected' | 'commande_lancee' | 'en_cours' | 'fini' | 'charge',
  createdBy: string,    // User UID
  createdAt: Timestamp,
  updatedAt: Timestamp,
  rejectionReason?: string
}
```

## 🎨 UI/UX Features

- **Responsive Design**: Mobile-first approach with touch-friendly buttons
- **Dark Mode**: Automatic theme switching for different environments
- **Real-time Updates**: Live status changes without page refresh
- **Loading States**: Clear feedback during operations
- **Error Handling**: User-friendly error messages
- **Accessibility**: Proper ARIA labels and keyboard navigation

## 🔧 Configuration Files

- `firebase.json`: Firebase hosting configuration
- `firestore.rules`: Database security rules
- `firestore.indexes.json`: Database indexes for performance
- `tailwind.config.js`: Tailwind CSS configuration
- `vite.config.ts`: Vite build configuration

## 🛠️ Maintenance

### Adding New Users
1. Create user in Firebase Authentication
2. Add user profile document in Firestore users collection
3. Assign appropriate role (rouiba, meftah, hangar)

### Monitoring
- Firebase Console for authentication and database metrics
- Browser DevTools for client-side performance
- Firebase Performance Monitoring for real-world metrics

## 📄 License

Private - Internal Factory Use Only

## 🆘 Support

For technical support or questions:
1. Check Firebase Console for authentication/database issues
2. Review browser console for client-side errors
3. Verify Firestore security rules are properly deployed
4. Ensure proper user roles are assigned in the database

---

**Ready for Production** ✅
- Complete authentication system
- Real-time database integration
- Responsive design
- Security rules implemented
- Error handling throughout
- Deployment configurations included