### Job & Networking Portal

This is a full-stack, Web3, and AI-powered job and networking portal inspired by platforms like LinkedIn, Upwork, and AngelList. The application is built to showcase modern development skills and product thinking by integrating key features across the MERN stack with advanced functionality.

## Features

### Core Functionality & APIs
* **User Authentication**: Secure user registration and login using JSON Web Tokens (JWT).
* **Profile Management**: Users can create, view, and edit their profiles with details like name, bio, and a LinkedIn URL.
* **Job & Social Feed**: A dynamic feed where users can browse job listings and view posts from other users.
* **Post Creation**: Users can create posts with text and upload multiple files, including images, videos, audio, and professional documents (PDF, DOCX, PPTX, XLSX).
* **Interactive Features**: Users can clap, comment, and uniquely share posts with a copy-to-clipboard link.
* **Application Tracking**: The platform provides a full-featured application management system where recruiters can view, accept, or decline applications. Job seekers can track the status of their applications.

### Web3 Integration
* **Wallet Connection**: Seamless integration with MetaMask to connect a user's wallet.
* **On-Chain Payments**: A smart contract on the Polygon Amoy testnet handles a platform fee for job postings, ensuring a verifiable and transparent transaction.
* **Application Tracking**: The platform provides a full-featured application management system where recruiters can view, accept, or decline applications.

### AI/ML Features
* **Job-Applicant Matching**: A case-insensitive NLP algorithm calculates and displays a "match score" between a job's required skills and an applicant's profile skills.
* **Resume Skill Extraction**: An AI-powered feature that parses skills directly from a user's resume (PDF), reducing manual data entry.
* **Smart Suggestions**: The platform recommends jobs to users based on their profile skills, showing a powerful demonstration of product-centric AI.

## Tech Stack

This project is built on the MERN stack with the following technologies:
* **Frontend**: React.js, Vite, Tailwind CSS
* **Backend**: Node.js, Express.js
* **Database**: MongoDB Atlas
* **Blockchain**: Solidity Smart Contract on Polygon Amoy testnet
* **Wallet Integration**: Ethers.js, MetaMask
* **File Storage**: Cloudinary (for storing and serving media files and resumes)
* **AI/NLP**: `keyword-extractor`, `pdf-parse`

## Setup & Local Development

### Prerequisites
* Node.js (v18 or higher)
* MongoDB Atlas account with a connection string
* Cloudinary account with API credentials
* MetaMask browser extension configured for the Polygon Amoy testnet

### Installation
1.  **Clone the repository:**
    ```bash
    git clone [https://github.com/p-v-srinag/rizeos-portal.git](https://github.com/p-v-srinag/rizeos-portal.git)
    cd rizeos-portal
    ```
2.  **Install server dependencies:**
    ```bash
    cd server
    npm install
    ```
3.  **Install client dependencies:**
    ```bash
    cd ../client
    npm install
    ```
4.  **Configure environment variables:**
    * In the `server` directory, create a `.env` file with your credentials:
        ```
        MONGO_URI="YOUR_MONGODB_ATLAS_CONNECTION_STRING"
        JWT_SECRET="YOUR_RANDOM_JWT_SECRET"
        CLOUDINARY_CLOUD_NAME="YOUR_CLOUDINARY_CLOUD_NAME"
        CLOUDINARY_API_KEY="YOUR_CLOUDINARY_API_KEY"
        CLOUDINARY_API_SECRET="YOUR_CLOUDINARY_API_SECRET"
        ```

### Running the Project
1.  **Start the backend server:**
    ```bash
    cd server
    npm start
    ```
2.  **Start the frontend development server:**
    ```bash
    cd ../client
    npm run dev
    ```
3.  The application will be available at `http://localhost:5173`.

## Deployment

This project is configured for seamless deployment to Vercel. Ensure you have the Vercel CLI installed and your repository is linked to your Vercel account.

1.  **Log in to Vercel:** `vercel login`
2.  **Deploy from the root directory:** `vercel`
3.  During deployment, provide your environment variables when prompted.
