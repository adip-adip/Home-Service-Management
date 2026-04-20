
# Home Service Provider API Test Cases

This document outlines the test cases for the Home Service Provider API. All endpoints are prefixed with `http://localhost:5000/api/v1`.

---

## Authentication API (`/auth`)

### 1. User Registration

- **URL:** `/auth/register`
- **Method:** `POST`
- **Description:** Registers a new user (customer or employee).
- **Request Body:**
  ```json
  {
    "name": "Test User",
    "email": "test.user@example.com",
    "password": "Password123!",
    "role": "customer"
  }
  ```

### 2. User Login

- **URL:** `/auth/login`
- **Method:** `POST`
- **Description:** Logs in a user and returns authentication tokens.
- **Request Body:**
  ```json
  {
    "email": "test.user@example.com",
    "password": "Password123!"
  }
  ```

### 3. Token Refresh

- **URL:** `/auth/refresh`
- **Method:** `POST`
- **Description:** Refreshes the access token using a valid refresh token.
- **Request Body:**
  ```json
  {
    "refreshToken": "your_refresh_token"
  }
  ```

### 4. User Logout

- **URL:** `/auth/logout`
- **Method:** `POST`
- **Description:** Logs out the user and invalidates the refresh token.
- **Headers:** `Authorization: Bearer your_access_token`

### 5. Email Verification

- **URL:** `/auth/verify-email`
- **Method:** `POST`
- **Description:** Verifies a user's email address with a token.
- **Request Body:**
  ```json
  {
    "token": "your_verification_token"
  }
  ```

### 6. Resend Verification Email

- **URL:** `/auth/resend-verification`
- **Method:** `POST`
- **Description:** Resends the email verification link.
- **Request Body:**
  ```json
  {
    "email": "test.user@example.com"
  }
  ```

---

## User API (`/users`)

### 1. Get User Profile

- **URL:** `/users/profile`
- **Method:** `GET`
- **Description:** Retrieves the profile of the currently authenticated user.
- **Headers:** `Authorization: Bearer your_access_token`

### 2. Update User Profile

- **URL:** `/users/profile`
- **Method:** `PATCH`
- **Description:** Updates the profile of the currently authenticated user.
- **Headers:** `Authorization: Bearer your_access_token`
- **Request Body:**
  ```json
  {
    "name": "Updated Name",
    "phone": "0987654321"
  }
  ```

### 3. Update Employee Profile

- **URL:** `/users/employee-profile`
- **Method:** `PATCH`
- **Description:** Updates the employee-specific profile details.
- **Headers:** `Authorization: Bearer your_access_token`
- **Request Body:**
  ```json
  {
    "skills": ["Gardening", "Painting"],
    "availability": {
      "tuesday": { "isAvailable": true, "start": "10:00", "end": "18:00" }
    }
  }
  ```

### 4. Upload/Update Avatar

- **URL:** `/users/avatar`
- **Method:** `POST`
- **Description:** Uploads or updates the user's avatar.
- **Headers:** `Authorization: Bearer your_access_token`
- **Request Body:** `form-data` with key `avatar` and an image file.

### 5. Delete Avatar

- **URL:** `/users/avatar`
- **Method:** `DELETE`
- **Description:** Deletes the user's avatar.
- **Headers:** `Authorization: Bearer your_access_token`

### 6. Get User Documents

- **URL:** `/users/documents`
- **Method:** `GET`
- **Description:** Retrieves the verification documents of an employee.
- **Headers:** `Authorization: Bearer your_access_token`

---

## Admin API (`/admin`)

### 1. Get Dashboard Statistics

- **URL:** `/admin/dashboard/stats`
- **Method:** `GET`
- **Description:** Retrieves dashboard statistics for the admin panel.
- **Headers:** `Authorization: Bearer your_admin_access_token`

### 2. Get Analytics Data

- **URL:** `/admin/dashboard/analytics`
- **Method:** `GET`
- **Description:** Retrieves analytics data for charts in the admin panel.
- **Headers:** `Authorization: Bearer your_admin_access_token`

### 3. Get Employee Documents

- **URL:** `/admin/employees/{userId}/documents`
- **Method:** `GET`
- **Description:** Retrieves documents of a specific employee for verification.
- **Headers:** `Authorization: Bearer your_admin_access_token`

### 4. Verify Employee Document

- **URL:** `/admin/employees/{userId}/documents/{documentId}/verify`
- **Method:** `PATCH`
- **Description:** Verifies or unverifies an employee's document.
- **Headers:** `Authorization: Bearer your_admin_access_token`

### 5. Get All Users

- **URL:** `/admin/users`
- **Method:** `GET`
- **Description:** Retrieves a paginated list of all users.
- **Headers:** `Authorization: Bearer your_admin_access_token`

### 6. Get User by ID

- **URL:** `/admin/users/{userId}`
- **Method:** `GET`
- **Description:** Retrieves a single user by their ID.
- **Headers:** `Authorization: Bearer your_admin_access_token`

---

## Booking API (`/bookings`)

### 1. Create a New Booking

- **URL:** `/bookings`
- **Method:** `POST`
- **Description:** Creates a new booking for a service.
- **Headers:** `Authorization: Bearer your_access_token`
- **Request Body:**
  ```json
  {
    "serviceId": "your_service_id",
    "employeeId": "your_employee_id",
    "bookingDate": "2024-12-25T10:00:00.000Z",
    "address": "123 Main St, Anytown"
  }
  ```

### 2. Get Customer's Bookings

- **URL:** `/bookings/my-bookings`
- **Method:** `GET`
- **Description:** Retrieves the bookings made by the current customer.
- **Headers:** `Authorization: Bearer your_access_token`

### 3. Get Employee's Jobs

- **URL:** `/bookings/my-jobs`
- **Method:** `GET`
- **Description:** Retrieves the jobs assigned to the current employee.
- **Headers:** `Authorization: Bearer your_access_token`

### 4. Get Available Employees

- **URL:** `/bookings/available-employees/{serviceCategory}`
- **Method:** `GET`
- **Description:** Retrieves available employees for a specific service category.
- **Headers:** `Authorization: Bearer your_access_token`

### 5. Get Booking by ID

- **URL:** `/bookings/{bookingId}`
- **Method:** `GET`
- **Description:** Retrieves a single booking by its ID.
- **Headers:** `Authorization: Bearer your_access_token`

### 6. Accept a Booking

- **URL:** `/bookings/{bookingId}/accept`
- **Method:** `PATCH`
- **Description:** Allows an employee to accept a booking.
- **Headers:** `Authorization: Bearer your_access_token`

### 7. Reject a Booking

- **URL:** `/bookings/{bookingId}/reject`
- **Method:** `PATCH`
- **Description:** Allows an employee to reject a booking.
- **Headers:** `Authorization: Bearer your_access_token`

### 8. Cancel a Booking

- **URL:** `/bookings/{bookingId}/cancel`
- **Method:** `PATCH`
- **Description:** Allows a customer to cancel their booking.
- **Headers:** `Authorization: Bearer your_access_token`

---

## Service API (`/services`)

### 1. Get All Service Categories

- **URL:** `/services/categories`
- **Method:** `GET`
- **Description:** Retrieves all available service categories.

### 2. Get Public Statistics

- **URL:** `/services/public-stats`
- **Method:** `GET`
- **Description:** Retrieves public statistics for the homepage.

---

## Notification API (`/notifications`)

### 1. Get User's Notifications

- **URL:** `/notifications`
- **Method:** `GET`
- **Description:** Retrieves a paginated list of the user's notifications.
- **Headers:** `Authorization: Bearer your_access_token`

### 2. Get Unread Notification Count

- **URL:** `/notifications/unread-count`
- **Method:** `GET`
- **Description:** Retrieves the count of unread notifications.
- **Headers:** `Authorization: Bearer your_access_token`

### 3. Mark All Notifications as Read

- **URL:** `/notifications/read-all`
- **Method:** `PATCH`
- **Description:** Marks all of the user's notifications as read.
- **Headers:** `Authorization: Bearer your_access_token`

### 4. Mark a Notification as Read

- **URL:** `/notifications/{id}/read`
- **Method:** `PATCH`
- **Description:** Marks a single notification as read.
- **Headers:** `Authorization: Bearer your_access_token`

### 5. Delete All Notifications

- **URL:** `/notifications`
- **Method:** `DELETE`
- **Description:** Deletes all of the user's notifications.
- **Headers:** `Authorization: Bearer your_access_token`

### 6. Delete a Notification

- **URL:** `/notifications/{id}`
- **Method:** `DELETE`
- **Description:** Deletes a single notification by its ID.
- **Headers:** `Authorization: Bearer your_access_token`
