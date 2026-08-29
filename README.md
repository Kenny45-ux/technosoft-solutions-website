# Technosoft Solutions Website

This repository contains the source code for the Technosoft Solutions website, including the React frontend, PHP API/backend, database schema, and related assets.

## Project Structure

```text
technosoft-solutions-website/
│
├── technosoft store redesign/
│   └── technosoft-store/
│       ├── src/
│       ├── public/
│       ├── package.json
│       ├── package-lock.json
│       ├── vite.config.js
│       └── technosoft_schema.sql
│
├── technosoft-api/
│   ├── products.php
│   ├── orders.php
│   ├── login.php
│   ├── register.php
│   ├── messages.php
│   ├── tickets.php
│   ├── db.php
│   └── admin_*.php
│
└── README.md
```

## Technologies Used

### Frontend

* React
* Vite
* JavaScript
* HTML
* CSS

### Backend

* PHP
* MySQL
* XAMPP / Apache

### Other

* REST API
* PHPMailer
* Git/GitHub

## Requirements

Before running the project, install:

* [Node.js](https://nodejs.org/)
* XAMPP
* Git (optional, only required if cloning through Git)

## Installation

### 1. Clone or download the repository

Clone the repository:

```bash
git clone https://github.com/Kenny45-ux/technosoft-solutions-website.git
```

Or download the repository as a ZIP file from GitHub.

### 2. Set up XAMPP

Copy the following folders into the XAMPP `htdocs` directory:

```text
technosoft store redesign/
technosoft-api/
```

The API should therefore be accessible through Apache, for example:

```text
http://localhost/technosoft-api/
```

Start the following services from XAMPP:

* Apache
* MySQL

## Database Setup

1. Open XAMPP and start MySQL.
2. Open phpMyAdmin.
3. Create the required database.
4. Import the SQL schema provided in the project.

The main database schema is located at:

```text
technosoft store redesign/technosoft-store/technosoft_schema.sql
```

Additional API/database schema files are located in:

```text
technosoft-api/
```

## Configure the API

Check the database configuration in:

```text
technosoft-api/db.php
```

Update the database connection details if the local MySQL configuration is different.

Make sure the database name, username, password, and host match the local XAMPP/MySQL setup.

## Install Frontend Dependencies

Open a terminal and navigate to the React project:

```bash
cd "technosoft store redesign/technosoft-store"
```

Install the required packages:

```bash
npm install
```

## Run the Frontend

Start the Vite development server:

```bash
npm run dev
```

Vite will provide a local address, normally similar to:

```text
http://localhost:5173/
```

Open the address shown in the terminal in a web browser.

## API Connection

The React frontend communicates with the PHP API located in:

```text
technosoft-api/
```

When running locally, make sure Apache is running in XAMPP so that the PHP API is accessible.

If the API URL is configured in the frontend code, update it if the local environment uses a different URL.

## Admin Functions

The project includes administrative functionality for managing areas such as:

* Products
* Product images
* Categories
* Orders
* Statistics
* User authentication

Relevant backend files are located in:

```text
technosoft-api/
```

## Development Workflow

For frontend development:

```bash
cd "technosoft store redesign/technosoft-store"
npm install
npm run dev
```

For the backend:

1. Start Apache and MySQL through XAMPP.
2. Ensure `technosoft-api` is inside the XAMPP `htdocs` directory.
3. Ensure the database has been imported and configured correctly.

## Important Notes

* Do not commit passwords, API keys, or other sensitive credentials to GitHub.
* The project is intended to be run in a local development environment using XAMPP and Node.js.
* `node_modules` should not be uploaded to GitHub. Run `npm install` to recreate the dependencies.
* Database credentials may need to be adjusted depending on the local XAMPP/MySQL configuration.

## Repository

GitHub repository:

https://github.com/Kenny45-ux/technosoft-solutions-website

## Kenny Chitalo

Technosoft Solutions Website Project
