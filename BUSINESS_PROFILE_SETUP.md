# Business Profile Setup Implementation

## 🎯 Overview

Complete implementation of `/register/business/profile` page with logo upload, address input, and interactive map location selection.

## 🏗️ Architecture

### File Upload System
- **Upload API**: `/api/upload` - Handles image uploads with validation
- **Static Serving**: `/api/uploads/[...path]` - Serves uploaded files securely
- **Storage**: `/uploads` folder in project root
- **Validation**: File type, size (5MB max), security checks

### Location Management
- **Map Component**: Interactive Leaflet map for location selection
- **Coordinate Storage**: Latitude/longitude in PostgreSQL
- **Future PostGIS**: Schema prepared for PostGIS geometry upgrade

### Database Schema
```prisma
model Business {
  user_id           String    @id
  business_name     String
  business_category String?
  description       String?
  contact_phone     String?
  address           String?
  logo_url          String?
  latitude          Float?    // Location coordinates
  longitude         Float?
  created_at        DateTime  @default(now())
  updated_at        DateTime  @default(now()) @updatedAt
  // ... relations
}
```

## 🧩 Components

### 1. ImageUpload Component (`/src/components/ui/image-upload.tsx`)
- Drag & drop file upload
- Image preview with crop/resize
- Progress indicator
- Error handling
- File validation (type, size)

### 2. LocationMap Component (`/src/components/ui/location-map.tsx`)
- Interactive Leaflet map
- Click/drag to set location
- Current location detection
- Coordinate display
- Fallback for map loading errors

### 3. Business Profile Page (`/src/app/register/business/profile/page.tsx`)
- Multi-step registration flow
- Form validation
- Real-time error feedback
- Progress indicator
- Navigation between steps

## 📡 API Endpoints

### File Upload
```typescript
POST /api/upload
Content-Type: multipart/form-data
Body: { file: File }
Response: { url: string, filename: string, size: number }
```

### Business Profile
```typescript
PUT /api/auth/register/business/profile
Authorization: Bearer <token>
Body: {
  business_name: string
  business_category: string
  description?: string
  contact_phone: string
  address: string
  logo_url?: string
  location?: { type: 'Point', coordinates: [lng, lat] }
}
```

```typescript
GET /api/auth/register/business/profile
Authorization: Bearer <token>
Response: { business: BusinessProfile }
```

## 🔧 Features

### ✅ Implemented
- Logo upload with preview
- Interactive map location selection
- Address input with validation
- Business category selection
- Contact information forms
- Progress tracking UI
- Error handling & validation
- Responsive design
- File security measures

### 🔄 Form Validation
- Required field validation
- Phone number format validation
- File type/size validation
- Real-time error feedback
- Submit button state management

### 🗺️ Map Features
- Click to set location
- Drag marker to adjust
- "Use Current Location" button
- Coordinate display
- Default location (Zimbabwe)
- Error handling for geolocation

### 📸 Upload Features
- Drag & drop interface
- File type validation (images only)
- Size limit (5MB)
- Progress indication
- Preview with remove option
- Secure file storage

## 🚀 Usage

1. **Navigate to**: `/register/business/profile`
2. **Fill out form**: Business name, category, description, contact info
3. **Upload logo**: Drag & drop or click to select image
4. **Set location**: Click on map or use current location
5. **Submit**: Profile saved to database
6. **Redirect**: To loyalty setup page

## 🔐 Security

- File type validation (images only)
- File size limits (5MB max)
- Path traversal protection
- Secure file serving
- JWT authentication required
- Input sanitization

## 📱 Responsive Design

- Mobile-optimized forms
- Touch-friendly map controls
- Responsive image upload
- Adaptive layout
- Progress indicators

## 🔮 Future Enhancements

### PostGIS Integration
When PostGIS is available:
1. Enable PostGIS extension
2. Add geometry column to Business table
3. Update API to use spatial queries
4. Add spatial indexing for performance

### Additional Features
- Image cropping/editing
- Multiple image uploads
- Address autocomplete
- Bulk business import
- Location radius settings
- Map style customization

## 🧪 Testing

To test the complete flow:
1. Create business account at `/register/business`
2. Navigate to `/register/business/profile`
3. Fill out all required fields
4. Upload a business logo
5. Set location on map
6. Submit and verify data in database

## 🔍 Troubleshooting

### Map Not Loading
- Check internet connection (requires OpenStreetMap tiles)
- Verify Leaflet CSS is loaded
- Check browser console for errors

### File Upload Issues
- Verify uploads folder exists and is writable
- Check file size and type restrictions
- Ensure proper Content-Type headers

### Location Detection
- Requires HTTPS in production
- User must grant location permission
- Fallback to manual selection available
