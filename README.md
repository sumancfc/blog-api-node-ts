# Blog API - Node, Express, MongoDB & TypeScript

A simple blog API built with Node.js, Express, MongoDB, and TypeScript. The API provides authentication features such as user signup, signin, and signout, along with middleware for authentication and authorization. The app also includes CSRF protection for secure communication.

## Features

- User signup and signin
- JWT-based authentication
- CSRF protection
- MongoDB for storing user data
- Express routing with middleware
- Role-based access control (admin and user)

## Tech Stack

- **Backend**: Node.js, Express
- **Database**: MongoDB (using Mongoose)
- **Authentication**: JWT (JSON Web Tokens)
- **Security**: CSRF protection, Password hashing with salt
- **Validation**: Express-validator
- **TypeScript**: Strongly typed code for better developer experience

## Installation

### Prerequisites

Ensure you have the following installed:

- **Node.js** (v14.x or higher)
- **MongoDB** (local or MongoDB Atlas for cloud)
- **IDE/Code Editor** (WebStorm or Visual Studio Code or Any code editor)

### Setup

1. Clone this repository:

    ```bash
    git clone https://github.com/sumancfc/blog-api-node-ts.git
    cd blog-api-node-ts
    ```

2. Install dependencies:

    ```bash
    npm install
    ```

3. Setup environment variables:

    ```bash
    PORT=8000
    NODE_ENV=development or prodution
    DATABASE_URL=mongodb://your-db-connection-string
    JWT_SECRET=your-jwt-secret
    CLIENT_URL=http://localhost:3000
    COOKIE_EXPIRY_LONG=15
    COOKIE_EXPIRY_SHORT=1
    ```

4. Build the project

    ```bash
    npm run build
    ```

5. Run the project

    ```bash
    npm run dev
    ```
