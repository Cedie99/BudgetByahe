# 🚍 Budget Byahe

**A Transparent Fare Calculation System for Jeepneys and Tricycle Services**

Developed by **ByaHERO**

---

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Running the Application](#running-the-application)
- [Admin Setup](#admin-setup)
- [Project Structure](#project-structure)
- [API Endpoints](#api-endpoints)
- [Contributing](#contributing)
- [License](#license)

---

## 🎯 Overview

**Budget Byahe** is a web-based application designed to provide transparency in fare calculation for jeepney and tricycle services in the Philippines. The system helps commuters understand fare structures, calculate trip costs, and access real-time transportation information.

The application empowers both passengers and transport operators by:
- Providing accurate fare calculations based on distance
- Displaying interactive route maps
- Offering transparent pricing information
- Enabling easy fare matrix management for administrators

---

## ✨ Features

### For Passengers
- 🗺️ **Interactive Map Integration** - View routes and calculate fares using Google Maps
- 💰 **Transparent Fare Calculation** - Clear breakdown of jeepney and tricycle fares
- 📍 **Route Information** - Access detailed information about transport routes
- 💬 **AI Chatbot Assistant** - Get instant help and information
- 👤 **User Profiles** - Manage personal information and preferences
- 🔐 **Secure Authentication** - Login via email/password, Google, or Facebook

### For Administrators
- 📊 **Admin Dashboard** - Comprehensive overview of system metrics
- 🚌 **Route Management** - Add, edit, and delete transport routes
- 📋 **Fare Matrix Upload** - Upload and manage fare matrices via CSV
- 💬 **Feedback Management** - View and respond to user feedback
- 📝 **Content Management System** - Update application content dynamically
- 📈 **Analytics & Reporting** - Track usage statistics and user engagement

### Technical Features
- 🔥 **Firebase Integration** - Real-time database and authentication
- 🎨 **Responsive Design** - Works seamlessly on desktop and mobile devices
- 🔒 **Role-Based Access Control** - Separate user and admin interfaces
- 📤 **File Upload & Processing** - CSV parsing for fare matrices
- 🌐 **RESTful API** - Laravel backend with clean API architecture

---

## 🛠️ Tech Stack

### Frontend
- **Framework:** React 19.1.0
- **Routing:** React Router DOM 7.7.1
- **Maps:** Google Maps API (@react-google-maps/api 2.20.7)
- **Styling:** Custom CSS
- **Icons:** React Icons 5.5.0
- **CSV Parsing:** PapaParse 5.5.3
- **PDF Processing:** PDF.js 5.4.296

### Backend
- **Framework:** Laravel 9.x
- **Language:** PHP 8.0+
- **Database:** MySQL (via XAMPP)
- **Authentication:** Laravel Sanctum 2.14
- **CORS:** Fruitcake Laravel CORS 2.0.5

### Database & Services
- **Primary Database:** Firebase Firestore
- **Authentication:** Firebase Authentication
- **Storage:** Firebase Storage
- **SQL Database:** MySQL (for backend operations)

### Development Tools
- **Package Manager (Frontend):** npm
- **Package Manager (Backend):** Composer
- **Version Control:** Git
- **Web Server:** XAMPP (Apache + MySQL + PHP)

---

## 📦 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v14 or higher) - [Download](https://nodejs.org/)
- **npm** (comes with Node.js)
- **XAMPP** (PHP 8.0+, MySQL, Apache) - [Download](https://www.apachefriends.org/)
- **Composer** - [Download](https://getcomposer.org/)
- **Git** - [Download](https://git-scm.com/)
- **Firebase Account** - [Sign up](https://firebase.google.com/)
- **Google Maps API Key** - [Get API Key](https://developers.google.com/maps/documentation/javascript/get-api-key)

---

## 🚀 Installation

### 1. Clone the Repository

```bash
git clone https://github.com/Cedie99/BudgetByahe.git
cd BudgetByahe
```

### 2. Frontend Setup

```bash
# Navigate to frontend directory
cd transpo-system-frontend

# Install dependencies
npm install

# Create .env file
copy .env.example .env
```

Edit `.env` and add your Firebase and Google Maps credentials:

```env
REACT_APP_FIREBASE_API_KEY=your_firebase_api_key
REACT_APP_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=your_project_id
REACT_APP_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
REACT_APP_FIREBASE_APP_ID=your_app_id
REACT_APP_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
```

### 3. Backend Setup

```bash
# Navigate to backend directory
cd ../transpo-system-backend

# Install PHP dependencies
composer install

# Copy environment file
copy .env.example .env

# Generate application key
php artisan key:generate
```

Edit `.env` and configure your database:

```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=budget_byahe
DB_USERNAME=root
DB_PASSWORD=

FIREBASE_CREDENTIALS=storage/firebase-service-account.json
```

### 4. Database Setup

#### MySQL Database (via XAMPP)

1. Start XAMPP Control Panel
2. Start Apache and MySQL services
3. Open phpMyAdmin: `http://localhost/phpmyadmin`
4. Create a new database named `budget_byahe`

```sql
CREATE DATABASE budget_byahe;
```

5. Run Laravel migrations:

```bash
php artisan migrate
```

#### Firebase Setup

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or select existing project
3. Enable **Authentication** (Email/Password, Google, Facebook)
4. Create **Firestore Database** in production mode
5. Enable **Storage** for file uploads
6. Download service account key:
   - Go to Project Settings → Service Accounts
   - Click "Generate New Private Key"
   - Save as `firebase-service-account.json` in `transpo-system-backend/storage/`

---

## ⚙️ Configuration

### Firebase Firestore Security Rules

Set up the following collections in Firestore:

- `users` - User profiles and authentication data
- `routes` - Transport route information
- `fares` - Fare matrix data
- `feedback` - User feedback and inquiries

### Google Maps API

Enable the following APIs in Google Cloud Console:
- Maps JavaScript API
- Directions API
- Distance Matrix API
- Places API

---

## 🏃 Running the Application

### Start Backend Server

```bash
# In transpo-system-backend directory
cd transpo-system-backend
php artisan serve
```

Backend will run on `http://localhost:8000`

### Start Frontend Server

```bash
# In transpo-system-frontend directory (new terminal)
cd transpo-system-frontend
npm start
```

Frontend will run on `http://localhost:3000`

### Access Points

- **User Interface:** `http://localhost:3000`
- **Admin Login:** `http://localhost:3000/admin/login`
- **Admin Dashboard:** `http://localhost:3000/admin/dashboard`
- **Backend API:** `http://localhost:8000/api`

---

## 👨‍💼 Admin Setup

To create an admin account, refer to the detailed guide in `ADMIN_SETUP_GUIDE.md`.

### Quick Method (Firebase Console):

1. Sign up a regular user at `http://localhost:3000/signup`
2. Go to Firebase Console → Firestore Database
3. Find the user document in the `users` collection
4. Add a field: `role` = `admin` (string)
5. Login at `http://localhost:3000/admin/login`

---

## 📁 Project Structure

```
BudgetByahe/
├── transpo-system-frontend/          # React frontend
│   ├── public/                       # Static files
│   ├── src/
│   │   ├── admin/                    # Admin components
│   │   │   ├── AdminDashboard.js
│   │   │   ├── AdminRoutes.js
│   │   │   ├── AdminCMS.js
│   │   │   └── AdminFeedback.js
│   │   ├── components/               # Reusable components
│   │   │   ├── ChatbotWidget.js
│   │   │   └── NotificationModal.js
│   │   ├── utils/                    # Utility functions
│   │   ├── firebase.js               # Firebase configuration
│   │   ├── App.js                    # Main app component
│   │   ├── Home.js                   # Landing page
│   │   ├── Map.js                    # Map interface
│   │   ├── Fares.js                  # Fare display
│   │   └── Profile.js                # User profile
│   └── package.json
│
├── transpo-system-backend/           # Laravel backend
│   ├── app/
│   │   ├── Http/Controllers/         # API controllers
│   │   ├── Models/                   # Eloquent models
│   │   └── Providers/                # Service providers
│   ├── config/                       # Configuration files
│   │   ├── firebase.php              # Firebase config
│   │   └── database.php              # Database config
│   ├── database/
│   │   ├── migrations/               # Database migrations
│   │   └── seeders/                  # Database seeders
│   ├── routes/
│   │   ├── api.php                   # API routes
│   │   └── web.php                   # Web routes
│   ├── storage/
│   │   └── firebase-service-account.json
│   └── composer.json
│
├── ADMIN_SETUP_GUIDE.md              # Admin setup instructions
└── README.md                         # This file
```

---

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout

### Routes
- `GET /api/routes` - Get all routes
- `POST /api/routes` - Create new route (admin)
- `PUT /api/routes/{id}` - Update route (admin)
- `DELETE /api/routes/{id}` - Delete route (admin)

### Fares
- `GET /api/fares` - Get fare information
- `POST /api/fares/upload` - Upload fare matrix (admin)

### User Profile
- `GET /api/user/profile` - Get user profile
- `PUT /api/user/profile` - Update user profile

---

## 🤝 Contributing

We welcome contributions to Budget Byahe! Here's how you can help:

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/AmazingFeature
   ```
3. **Commit your changes**
   ```bash
   git commit -m 'Add some AmazingFeature'
   ```
4. **Push to the branch**
   ```bash
   git push origin feature/AmazingFeature
   ```
5. **Open a Pull Request**

### Development Guidelines

- Follow existing code style and conventions
- Write clear commit messages
- Test your changes thoroughly
- Update documentation as needed
- Ensure responsive design for mobile devices

---

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

## 👥 Team ByaHERO

**Budget Byahe** is developed and maintained by the ByaHERO team, dedicated to improving transportation transparency in the Philippines.

---

## 📞 Support

For issues, questions, or suggestions:

- **GitHub Issues:** [Create an issue](https://github.com/Cedie99/BudgetByahe/issues)
- **Email:** support@budgetbyahe.com (if applicable)

---

## 🙏 Acknowledgments

- Firebase for backend infrastructure
- Google Maps Platform for mapping services
- Laravel community for excellent documentation
- React community for frontend tools
- All contributors and testers

---

## 🗺️ Roadmap

### Current Features
- ✅ User authentication and profiles
- ✅ Interactive route mapping
- ✅ Fare calculation system
- ✅ Admin dashboard and CMS
- ✅ Feedback system
- ✅ AI chatbot integration

### Planned Features
- 🔄 Real-time vehicle tracking
- 🔄 Mobile application (iOS/Android)
- 🔄 Payment integration
- 🔄 Multi-language support
- 🔄 Offline mode capability
- 🔄 Driver/operator interface
- 🔄 Advanced analytics dashboard

---

## 📊 System Requirements

### Minimum Requirements
- **OS:** Windows 10/11, macOS 10.14+, Ubuntu 18.04+
- **RAM:** 4GB
- **Storage:** 2GB free space
- **Browser:** Chrome 90+, Firefox 88+, Safari 14+, Edge 90+

### Recommended Requirements
- **RAM:** 8GB or more
- **Storage:** 5GB free space
- **Internet:** Stable broadband connection for real-time features

---

<div align="center">

**Made with ❤️ by ByaHERO**

*Empowering Filipino commuters with transparent transportation solutions*

</div>
