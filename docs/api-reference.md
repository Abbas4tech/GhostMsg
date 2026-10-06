# API Reference

Complete documentation of all REST API endpoints provided in GhostMsg.

---

## Interactive Documentation & OpenAPI Specification
- **Interactive UI (Scalar)**: [`/api/docs`](file:///d:/Projects/GhostMsg/docs/api-reference.md)
- **OpenAPI 3.1 Spec JSON**: `/api/openapi.json`
- **Base URL**: `/api`

---

## 1. Authentication & User Verification

### Check Username Uniqueness
Check whether a prospective username is already taken by a verified user.

- **URL**: `/api/check-username-unique`
- **Method**: `GET`
- **Auth Required**: No
- **Query Parameters**:
  - `username` (string, 2–20 chars, alphanumeric / underscore)
- **Responses**:
  - `200 OK`: `{"success": true, "message": "Username is unique"}`
  - `400 Bad Request`: `{"success": false, "message": "Username must be at least 2 characters"}` or `{"success": false, "message": "Username is already taken"}`
  - `500 Server Error`: `{"success": false, "message": "Error checking username: Internal Server Error"}`

---

### User Sign-Up
Register a new user account with credentials and dispatch a 6-digit verification code email.

- **URL**: `/api/sign-up`
- **Method**: `POST`
- **Auth Required**: No
- **Request Body**:
  ```json
  {
    "username": "johndoe",
    "email": "johndoe@example.com",
    "password": "StrongPassword123!"
  }
  ```
- **Responses**:
  - `201 Created`: `{"success": true, "message": "User registered successfully. Please verify your email"}`
  - `400 Bad Request`: `{"success": false, "message": "Username is already taken"}` or `{"success": false, "message": "User already exist with this email"}`
  - `500 Server Error`: `{"success": false, "message": "Failed to send verification email"}`

---

### Verify Email Code
Validate the 6-digit verification code sent to the user's email.

- **URL**: `/api/verify-code`
- **Method**: `POST`
- **Auth Required**: No
- **Request Body**:
  ```json
  {
    "username": "johndoe",
    "code": "123456"
  }
  ```
- **Responses**:
  - `200 OK`: `{"success": true, "message": "Account Verified Successfully!"}`
  - `200 OK (Invalid)`: `{"success": false, "message": "Verify is code is incorrect"}`
  - `400 Bad Request`: `{"success": false, "message": "Verification code has expired. Please signup again to get a new code"}`
  - `404 Not Found`: `{"success": false, "message": "User not found!!"}`

---

## 2. Anonymous Messaging

### Send Anonymous Message
Send an anonymous message to a recipient's public profile link.

- **URL**: `/api/send-message`
- **Method**: `POST`
- **Auth Required**: No
- **Request Body**:
  ```json
  {
    "username": "johndoe",
    "content": "Hey! Just wanted to say you are doing great work."
  }
  ```
- **Responses**:
  - `200 OK`: `{"success": true, "message": "Message sent successfully!"}`
  - `404 Not Found`: `{"success": false, "message": "Failed to send message - User not found"}` or `{"success": false, "message": "Failed to send message - User is not accepting messages"}`
  - `500 Server Error`: `{"success": false, "message": "Failed to send message - Internal Server Error"}`

---

### Get AI Suggested Prompts
Generate three open-ended message starter prompts using Gemini 2.5 Flash Lite.

- **URL**: `/api/suggest-messages`
- **Method**: `GET`
- **Auth Required**: No
- **Runtime**: Edge
- **Responses**:
  - `200 OK`:
    ```json
    {
      "success": true,
      "messages": "What is a skill you want to learn?||What is your favorite memory from this year?||If you could travel anywhere tomorrow, where would you go?"
    }
    ```
  - `500 Server Error`: `{"success": false, "message": "Failed to get suggested messages - Internal Server Error"}`

---

## 3. Dashboard & Message Management

### Get User Inbox Messages
Fetch all received anonymous messages for the authenticated user, sorted in descending order by timestamp.

- **URL**: `/api/get-messages`
- **Method**: `GET`
- **Auth Required**: Yes (NextAuth Session)
- **Responses**:
  - `200 OK`:
    ```json
    {
      "success": true,
      "messages": [
        {
          "_id": "660c1d2e...",
          "content": "Hey! Loved your recent project.",
          "createdAt": "2026-10-06T12:00:00.000Z"
        }
      ]
    }
    ```
  - `401 Unauthorized`: `{"success": false, "message": "Not authenticated, Please login first!"}`
  - `404 Not Found`: `{"success": false, "message": "User not found"}`

---

### Delete Message
Delete a single anonymous message from the user's inbox by ID.

- **URL**: `/api/delete-message/[messageId]`
- **Method**: `DELETE`
- **Auth Required**: Yes (NextAuth Session)
- **Path Parameters**:
  - `messageId` (string, MongoDB ObjectId)
- **Responses**:
  - `200 OK`: `{"success": true, "message": "Message deleted successfully!"}`
  - `401 Unauthorized`: `{"success": false, "message": "Not authenticated, Please login first!"}`
  - `404 Not Found`: `{"success": false, "message": "Message not found, or Already Deleted!"}`

---

### Get Message Acceptance Status
Retrieve whether the current user is currently accepting messages.

- **URL**: `/api/accept-message`
- **Method**: `GET`
- **Auth Required**: Yes (NextAuth Session)
- **Responses**:
  - `200 OK`: `{"success": true, "isAcceptingMessage": true, "message": "Message acceptance status fetched successfully!"}`
  - `400 Bad Request`: `{"success": false, "message": "Not authenticated, Please login first!"}`
  - `404 Not Found`: `{"success": false, "message": "User not found"}`

---

### Update Message Acceptance Status
Toggle message acceptance on or off for the authenticated user.

- **URL**: `/api/accept-message`
- **Method**: `POST`
- **Auth Required**: Yes (NextAuth Session)
- **Request Body**:
  ```json
  {
    "acceptMessages": false
  }
  ```
- **Responses**:
  - `200 OK`: `{"success": true, "message": "Message acceptance status updated successfully!", "updatedUser": {...}}`
  - `400 Bad Request`: `{"success": false, "message": "Invalid acceptMessages value"}` or `{"success": false, "message": "Not authenticated, Please login first!"}`
