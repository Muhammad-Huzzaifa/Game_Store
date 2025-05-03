## Online Game E-commerce Platform (Django + SQL Server)

![Game-Store](https://github.com/user-attachments/assets/f2bc1dc1-9f63-480c-bcd6-e1942cd198af)

## Overview

Game Store is a full-featured e-commerce web application built with Django and Microsoft SQL Server. The application allows users to browse games, add them to cart, place orders, and track their order status. It also includes an admin interface for inventory management and order processing.

## Features

- **User Authentication**: Login/signup system with role-based access (customers and admins)
- **Product Browsing**: View and filter games by category, price, and platform
- **Shopping Cart**: Add games to cart, adjust quantities, and calculate totals
- **Order Processing**: Place orders with automatic inventory updates
- **Payment System**: Simulated payment processing with different methods
- **Admin Dashboard**: Manage inventory, process orders, and view sales reports
- **Responsive Design**: Works on desktop and mobile devices

## Database Schema

The application uses a normalized database schema with the following tables:

- **Games**: Stores game information including title, description, price, etc.
- **Inventory**: Tracks stock quantities for each game
- **Carts & Cart Items**: Manages user shopping carts
- **Orders & Order Items**: Tracks order history and details
- **Payments**: Records payment information
- **Discount Codes**: Manages promotional discounts

## Prerequisites

- Python 3.8+
- Microsoft SQL Server
- ODBC Driver for SQL Server

## Setup Instructions

### 1. Install Required Packages

```bash
pip install -r requirements.txt
```

### 2. Database Configuration

The application connects to an Azure SQL Database. You need to install the ODBC Driver:

1. Download and install the ODBC Driver for SQL Server from:
   https://learn.microsoft.com/en-us/sql/connect/odbc/download-odbc-driver-for-sql-server

2. Database connection parameters (configured in settings.py):
   ```py
   DATABASES = {
        'default': {
            'ENGINE': 'mssql',
            'NAME': '', # Your Database Name
            'USER': '', # Your Database Username
            'PASSWORD': '', # Your Database Password
            'HOST': '', # Your Database Server
            'PORT': '', # Leave Empty
            'OPTIONS': {
                'driver': 'ODBC Driver 18 for SQL Server', # You can change version according to your installation
                'extra_params': 'Encrypt=yes;TrustServerCertificate=yes;', # TrustServerCertificate=yes in development and TrustServerCertificate=no in production
            },
        }
    }
    ```

### 3. Run Migrations

```bash
cd Game_Store
python manage.py migrate
```

### 4. Create Superuser

```bash
python manage.py createsuperuser
```
Default superuser credentials:
- Username: admin
- Password: admin

### 5. Run Development Server

```bash
python manage.py runserver
```

The application will be available at http://127.0.0.1:8000/

## Project Structure

- **models.py**: Database models for the store application
- **views.py**: View functions for handling HTTP requests
- **urls.py**: URL routing configuration
- **admin.py**: Admin interface configuration
- **settings.py**: Django application settings
- **mssql.sql**: SQL Server schema creation script

## User Roles

1. **Customers** can:
   - Browse and search games
   - Add games to cart
   - Place orders
   - Track order status
   - Apply discount codes

2. **Admins** can:
   - Manage game inventory
   - Update order statuses
   - View sales reports
   - Create discount codes
   - Manage user accounts

## Technology Stack

- **Backend**: Django
- **Database**: Microsoft SQL Server on Azure
- **Authentication**: Django's built-in authentication system
- **Frontend**: HTML, CSS, JavaScript (Django templates)
- **Database Connection**: pyodbc, mssql-django
