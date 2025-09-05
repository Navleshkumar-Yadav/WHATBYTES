# Healthcare Backend API Documentation

## Overview
This is a comprehensive healthcare backend system built with Django and Django REST Framework. It provides secure user authentication and complete CRUD operations for managing patients, doctors, and patient-doctor assignments.

## Base URL
```
http://localhost:8000/api/
```

## Authentication
All endpoints (except registration and login) require JWT authentication. Include the access token in the Authorization header:
```
Authorization: Bearer <your_access_token>
```

## API Endpoints

### 1. Authentication APIs

#### Register User
- **URL**: `POST /api/auth/register/`
- **Description**: Register a new user account
- **Permissions**: Public
- **Request Body**:
```json
{
    "name": "John Doe",
    "email": "john.doe@example.com",
    "password": "securepassword123",
    "password_confirm": "securepassword123"
}
```
- **Response** (201 Created):
```json
{
    "message": "User created successfully",
    "user": {
        "id": 1,
        "name": "John Doe",
        "email": "john.doe@example.com",
        "date_joined": "2024-01-15T10:30:00Z"
    },
    "tokens": {
        "refresh": "eyJ0eXAiOiJKV1Q...",
        "access": "eyJ0eXAiOiJKV1Q..."
    }
}
```

#### Login User
- **URL**: `POST /api/auth/login/`
- **Description**: Login with existing credentials
- **Permissions**: Public
- **Request Body**:
```json
{
    "email": "john.doe@example.com",
    "password": "securepassword123"
}
```
- **Response** (200 OK):
```json
{
    "message": "Login successful",
    "user": {
        "id": 1,
        "name": "John Doe",
        "email": "john.doe@example.com",
        "date_joined": "2024-01-15T10:30:00Z"
    },
    "tokens": {
        "refresh": "eyJ0eXAiOiJKV1Q...",
        "access": "eyJ0eXAiOiJKV1Q..."
    }
}
```

### 2. Patient Management APIs

#### Create Patient
- **URL**: `POST /api/patients/`
- **Description**: Add a new patient (authenticated users only)
- **Permissions**: Authenticated users
- **Request Body**:
```json
{
    "name": "Jane Smith",
    "email": "jane.smith@example.com",
    "phone": "+1234567890",
    "age": 35,
    "gender": "F",
    "address": "123 Main St, City, State 12345",
    "medical_history": "Diabetes, Hypertension",
    "emergency_contact": "John Smith - +1234567891"
}
```

#### Get All Patients
- **URL**: `GET /api/patients/`
- **Description**: Retrieve all patients created by the authenticated user
- **Permissions**: Authenticated users

#### Get Patient Details
- **URL**: `GET /api/patients/<id>/`
- **Description**: Get details of a specific patient
- **Permissions**: Authenticated users (own patients only)

#### Update Patient
- **URL**: `PUT /api/patients/<id>/` or `PATCH /api/patients/<id>/`
- **Description**: Update patient details
- **Permissions**: Authenticated users (own patients only)

#### Delete Patient
- **URL**: `DELETE /api/patients/<id>/`
- **Description**: Delete a patient record
- **Permissions**: Authenticated users (own patients only)

### 3. Doctor Management APIs

#### Create Doctor
- **URL**: `POST /api/doctors/`
- **Description**: Add a new doctor (authenticated users only)
- **Permissions**: Authenticated users
- **Request Body**:
```json
{
    "name": "Dr. Robert Johnson",
    "email": "dr.johnson@hospital.com",
    "phone": "+1234567892",
    "specialization": "CARDIOLOGY",
    "license_number": "MD12345",
    "experience_years": 15,
    "hospital_affiliation": "City General Hospital",
    "consultation_fee": 200.00,
    "available_days": "Monday, Wednesday, Friday"
}
```

#### Get All Doctors
- **URL**: `GET /api/doctors/`
- **Description**: Retrieve all doctors
- **Permissions**: Authenticated users

#### Get Doctor Details
- **URL**: `GET /api/doctors/<id>/`
- **Description**: Get details of a specific doctor
- **Permissions**: Authenticated users

#### Update Doctor
- **URL**: `PUT /api/doctors/<id>/` or `PATCH /api/doctors/<id>/`
- **Description**: Update doctor details
- **Permissions**: Authenticated users

#### Delete Doctor
- **URL**: `DELETE /api/doctors/<id>/`
- **Description**: Delete a doctor record
- **Permissions**: Authenticated users

### 4. Patient-Doctor Mapping APIs

#### Assign Doctor to Patient
- **URL**: `POST /api/mappings/`
- **Description**: Assign a doctor to a patient
- **Permissions**: Authenticated users (own patients only)
- **Request Body**:
```json
{
    "patient": 1,
    "doctor": 1,
    "status": "ACTIVE",
    "notes": "Regular checkup appointment"
}
```

#### Get All Mappings
- **URL**: `GET /api/mappings/`
- **Description**: Retrieve all patient-doctor mappings for authenticated user's patients
- **Permissions**: Authenticated users

#### Get Doctors for Specific Patient
- **URL**: `GET /api/mappings/patient/<patient_id>/`
- **Description**: Get all doctors assigned to a specific patient
- **Permissions**: Authenticated users (own patients only)

#### Update Mapping
- **URL**: `PUT /api/mappings/<id>/` or `PATCH /api/mappings/<id>/`
- **Description**: Update patient-doctor mapping
- **Permissions**: Authenticated users (own patients only)

#### Delete Mapping
- **URL**: `DELETE /api/mappings/<id>/`
- **Description**: Remove a doctor from a patient
- **Permissions**: Authenticated users (own patients only)

## Data Models

### User
- **Fields**: id, name, email, username, date_joined
- **Authentication**: JWT-based authentication

### Patient
- **Fields**: id, name, email, phone, age, gender, address, medical_history, emergency_contact, created_by, created_at, updated_at
- **Gender Choices**: M (Male), F (Female), O (Other)

### Doctor
- **Fields**: id, name, email, phone, specialization, license_number, experience_years, hospital_affiliation, consultation_fee, available_days, created_at, updated_at
- **Specialization Choices**: CARDIOLOGY, DERMATOLOGY, NEUROLOGY, ORTHOPEDICS, PEDIATRICS, PSYCHIATRY, RADIOLOGY, SURGERY, GENERAL, OTHER

### PatientDoctorMapping
- **Fields**: id, patient, doctor, status, notes, assigned_date, created_at, updated_at
- **Status Choices**: ACTIVE, COMPLETED, CANCELLED

## Error Handling

### Common HTTP Status Codes
- **200 OK**: Successful GET, PUT, PATCH requests
- **201 Created**: Successful POST requests
- **204 No Content**: Successful DELETE requests
- **400 Bad Request**: Invalid data or validation errors
- **401 Unauthorized**: Missing or invalid authentication
- **403 Forbidden**: Insufficient permissions
- **404 Not Found**: Resource not found

### Error Response Format
```json
{
    "field_name": ["Error message for this field"],
    "non_field_errors": ["General error messages"]
}
```

## Setup Instructions

1. Install dependencies:
```bash
pip install -r requirements.txt
```

2. Set up environment variables in `.env` file:
```
SECRET_KEY=your-secret-key
DEBUG=True
DATABASE_URL=postgresql://username:password@localhost:5432/healthcare_db
ALLOWED_HOSTS=localhost,127.0.0.1
```

3. Run migrations:
```bash
python manage.py makemigrations
python manage.py migrate
```

4. Create superuser (optional):
```bash
python manage.py createsuperuser
```

5. Run the development server:
```bash
python manage.py runserver
```

## Testing with Postman

1. **Register a user** using `/api/auth/register/`
2. **Login** using `/api/auth/login/` to get JWT tokens
3. **Set Authorization header** in Postman: `Bearer <access_token>`
4. **Create doctors** using `/api/doctors/`
5. **Create patients** using `/api/patients/`
6. **Assign doctors to patients** using `/api/mappings/`
7. **Test all CRUD operations** for each endpoint

## Security Features

- JWT-based authentication with access and refresh tokens
- Password validation and hashing
- User isolation (users can only access their own patients)
- Input validation and sanitization
- CORS configuration for frontend integration
- Environment-based configuration for sensitive data