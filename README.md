[![Live Demo](https://img.shields.io/badge/Live%20Demo-Visit%20Site-blue?style=for-the-badge)](https://document-vcs.onrender.com/)
> Note: the site is hosted on a free tier it might take upto 10-15 seconds to load (build & load).

# Docu-Vault

A collaborative document management system with Git-like version control and granular access management. Docu-Vault allows users to create, edit, and share documents with role-based permissions while maintaining a complete version history. Every edit creates a new version, enabling users to track changes over time and rollback to any previous state seamlessly.
Built with a focus on robust backend architecture, featuring custom authentication, OAuth integration, database transactions, and a complete version control system implementation.


##  Key Features

### 1. User Authentication & Authorization
- Email/password registration and login
- Google OAuth 2.0 integration
- Secure session management with Express-session
- Password hashing with bcrypt

### 2. User Profile Management
- Unique username creation and updates
- Profile viewing with document statistics
- Profile picture from Google OAuth (placeholder for email/password users)
- Profile completion workflow

### 3. Document Management
- Create and edit documents with rich text editor
- Search and filter personal documents (owned vs shared)
- Delete documents with cascade deletion of all versions and permissions
- Document ownership and metadata tracking

### 4. Git-Like Version Control
- Every edit creates a new version with commit message
- Complete version history tracking
- Rollback to any previous version (creates new version from old state)
- Version history accessible to owners and editors
- Version comparison and diff viewing

### 5. Granular Access Control
- Share documents with users by username or email
- Role-based permissions (Owner, Editor, Viewer)
- Manage and revoke access at any time
- Only owners can share documents
- Access audit trail

### 6. Dashboard & Organization
- Landing page with all user documents
- Search functionality across documents
- Filter by owned documents or shared documents
- Profile statistics (documents created, documents shared with you)
- Document activity timeline

## 🛠️ Tech Stack

- **Frontend:** EJS, CSS, JavaScript, jQuery
- **Backend:** Node.js, Express.js
- **Database:** PostgreSQL with UUID support
- **Authentication:** Passport.js (Email/Password & Google OAuth 2.0)
- **Session Management:** Express-session
- **Testing:** Jest, Supertest
- **Additional Libraries:** dotenv, uuid, Resend (email service), bcrypt
- **Deployment:** Docker, Render

##  Architecture

```
docu-vault/
├── src/
│   ├── config/
│   │   ├── db.js                 # PostgreSQL connection
│   │   └── passport.js           # Authentication strategies
│   │ 
│   ├── controllers/
│   │   ├── accessController.js   # Document sharing & permissions
│   │   ├── documentController.js # Document CRUD operations
│   │   ├── authController.js     # Authentication logic
│   │   ├── renderController.js   # View rendering
│   │   └── profileController.js  # User profile management
│   │
│   ├── middleware/
│   │   ├── auth.js               # Authentication middleware
│   │   └── profile.js            # Profile completion middleware
│   ├── routes/
│   │   ├── accessRoutes.js       # /access/* routes
│   │   ├── authRoutes.js         # /auth/* routes
│   │   ├── documentRoutes.js     # /document/* routes
│   │   ├── profileRoutes.js      # /set-username/* routes
│   │   └── viewRoutes.js         # View rendering routes
│   │
│   └── app.js                    # Express application setup
│
├── public/
│   ├── css/                      # Frontend styles
│   ├── js/                       # Frontend JavaScript
│   └── assets/                   # Images and static assets
│
├── database/
│   ├── migrations/               # Database schema migrations
│   ├── seeds/                    # Development data seeds
│   └── schema.sql                # Complete database schema
│
├── tests/                        # Jest test suites
├── views/                        # EJS templates
├── Dockerfile                    # Docker containerization
├── docker-compose.yml            # Local development setup
├── .env.example                  # Environment variables template
├── package.json                  # Dependencies and scripts
└── README.md                     # This file
```

##  Database Schema

The application uses PostgreSQL with the following key tables:

- **users**: User accounts with authentication data
- **documents**: Document metadata and ownership
- **versions**: Complete version history for all documents
- **access**: Granular permission management

##  Security Features

- Password hashing with bcrypt
- Secure session management
- CSRF protection through sessions
- Input validation and sanitization
- Role-based access control
- Database transaction safety



##  Deployment

### Local Development

1. **Clone and Setup:**
   ```bash
   git clone <repository-url>
   cd docu-vault
   npm install
   ```

2. **Environment Configuration:**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Database Setup:**
   ```bash
   # Using docker-compose
   docker-compose up -d db
   
   # Or setup PostgreSQL locally and run migrations
   psql -f database/schema.sql
   ```

4. **Start Development Server:**
   ```bash
   npm run dev
   ```


##  Development Decisions

### Why This Project Exists
Many beginner projects stop at CRUD operations, which does not reflect the complexity of real production systems. This project was built to bridge that gap by incorporating real-world backend patterns such as:
- Secure authentication and authorization
- Database transaction management
- Version control system implementation
- Granular access control
- Production-ready deployment setup

### Key Architectural Choices
- **Multi-stage Docker builds** for optimized production images
- **PostgreSQL with UUIDs** for robust data integrity
- **Express-session** for secure session management
- **Passport.js** for flexible authentication strategies
- **Jest testing** for comprehensive test coverage

##  Future Improvements

- [ ] Real-time collaboration with WebSockets
- [ ] Document templates and presets
- [ ] Advanced search with full-text indexing
- [ ] Mobile-responsive design improvements
- [ ] Document export functionality (PDF, DOCX)
- [ ] Team workspaces and organization management
- [ ] Advanced permission levels and groups
- [ ] Activity notifications and email alerts
- [ ] Document commenting and discussion threads
- [ ] Integration with cloud storage services



## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Author

**Prasad1-S** - [GitHub Profile](https://github.com/Prasad1-S)

## 🙏 Acknowledgments

- Express.js and Node.js communities
- PostgreSQL for reliable database management
- Passport.js for authentication flexibility
- The open-source community for incredible tools and libraries

---

**Built with ❤️ for learning and collaboration**
