# Docu-Vault
A collaborative document management system with Git-like version control and granular access management. Docu-Vault allows users to create, edit, and share documents with role-based permissions while maintaining a complete version history. Every edit creates a new version, enabling users to track changes over time and rollback to any previous state seamlessly.
Built with a focus on robust backend architecture, featuring custom authentication, OAuth integration, database transactions, and a complete version control system implementation.

## Key Features
### 1. User Authentication & Authorization

- Email/password registration and login
- Google OAuth 2.0 integration
- Secure session management


### 3. User Profile Management

- Unique username creation and updates
- Profile viewing with document statistics
- Profile picture from Google OAuth (placeholder for email/password users)


### 4. Document Management

- Create and edit documents
- Search and filter personal documents (owned vs shared)
- Delete documents with cascade deletion of all versions and permissions


### 5. Git-Like Version Control

- Every edit creates a new version
- Complete version history tracking
- Rollback to any previous version (creates new version from old state)
- Version history accessible to owners and editors


### 6. Granular Access Control

- Share documents with users by username or email
- Role-based permissions (Owner, Editor, Viewer)
- Manage and revoke access at any time
- Only owners can share documents


### 7. Dashboard & Organization

- Landing page with all user documents
- Search functionality
- Filter by owned documents or shared documents
- Profile statistics (documents created, documents shared with you)

## Tech Stack
- **Frontend:** EJS, CSS, JavaScript, jQuery
- **Backend:** Node.js, Express.js
- **Database:** PostgreSQL
- **Authentication:** Passport.js (Email/Password & Google OAuth 2.0)
- **Session Management:** Express-session
- **Testing:** Jest, Supertest
- **Additional Libraries:** dotenv, uuid, Resend (email service)

## Architecture

## Project Structure

## Core Features

## Authentication & Authorization Flow

## Profile Completion Logic

## Access Control & Middleware

## Data Layer

## Error Handling Strategy

## Testing

## Development Decisions

## Known Limitations

## Why This Project Exists
Many beginner projects stop at CRUD operations, which does not reflect the complexity of real production systems.
This project was built to bridge that gap by incorporating real-world backend patterns such as secure authentication, authorization layers, access management, and maintainable code structure.


## Future Improvements

## Setup & Local Development

## Author
