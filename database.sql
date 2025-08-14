-- Admin Login Codes Table
CREATE TABLE IF NOT EXISTS login_codes (
    email VARCHAR(100) PRIMARY KEY,
    code INT,
    expires_at DATETIME
);
-- Portfolio Database Schema
CREATE DATABASE IF NOT EXISTS portfolio_db;
USE portfolio_db;

-- Profile Table
CREATE TABLE IF NOT EXISTS profile (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100),
    bio TEXT,
    avatar VARCHAR(255),
    contact_email VARCHAR(100),
    phone VARCHAR(15)
);

-- Projects Table
CREATE TABLE IF NOT EXISTS projects (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(100),
    description TEXT,
    image VARCHAR(255),
    url VARCHAR(255)
);

-- Certificates Table
CREATE TABLE IF NOT EXISTS certificates (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(100),
    provider VARCHAR(100),
    image VARCHAR(255),
    ProvidedDate DATE,
    url VARCHAR(255)
);

-- Contact Table
CREATE TABLE IF NOT EXISTS contact (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100),
    email VARCHAR(100),
    message TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
