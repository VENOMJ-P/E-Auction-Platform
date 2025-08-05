# E-Auction Platform

Welcome to the **E-Auction Platform**, a real-time online auction system built with React, Vite, Node.js, Express, Socket.IO, and MongoDB. This platform allows users to create auctions, place bids in real-time, and manage auctions with a focus on core auction logic and seamless updates.

## 🎯 Objective

Build a fully functional live e-auction platform where:

- A bid creator (seller) can create an auction for an item.
- Multiple registered bidders can place real-time bids.
- Supports both **highest-bid-wins** and **lowest-bid-wins** auctions.
- Features a timer for auctions during which bids must be placed.
- Provides live, real-time bid updates across all users.
- Emphasizes core auction logic, real-time functionality, and production-level code quality.

## 🧩 Key Features

### 👤 User Authentication & Roles

- **JWT-based Authentication**: Simple login and registration using email and password.
- **User Roles**:
  - **Bid Creator**: Can create and manage auctions.
  - **Bidder**: Can view, join auctions, and place bids.
- Registration is streamlined with email and password fields.

### 📦 Auction Management

- **Bid Creator Capabilities**:
  - Create auctions with details: item name, description, base price, bid type (highest/lowest), start time, and end time.
  - View real-time bidding activity.
  - End auctions manually or allow automatic expiration.
- Auctions transition from **PENDING** to **LIVE** to **ENDED** based on timers.

### 💸 Bidding Interface (Live)

- **Bidder Capabilities**:
  - View live auctions and join them.
  - Place bids with real-time updates.
  - See their own position (rank and status) but not others' bids.
- **Bidding Logic**:
  - Enforces better bids (higher for highest-wins, lower for lowest-wins).
  - Allows users to update their bids during an ongoing auction.
  - Prevents bidding after the auction end time.

### 📊 Auction Summary

- **Auction Detail Page**:
  - Displays all user-submitted bids in real-time.
  - Shows the current leading bid.
  - Includes a countdown timer.
  - Announces the winner once the auction ends.

## 🚀 Getting Started

### Prerequisites

- Node.js (v18.x or later)
- MongoDB (local or remote instance)
- npm or yarn

### Environment Variables

Create a `.env` file in the `server` directory with the following:

```
PORT=5000
MONGODB_URL=your_mongodb_connection_string
JWT_SECRET=your_secure_jwt_secret
NODE_ENV=development
```

### Installation

1. **Clone the Repository**

   ```bash
   git clone https://github.com/VENOMJ-P/E-Auction-Platform.git
   cd venomj-p-e-auction-platform
   ```

2. **Install Server Dependencies**

   ```bash
   cd server
   npm install
   ```

3. **Install Client Dependencies**

   ```bash
   cd ../client
   npm install
   ```

4. **Set Up MongoDB**
   - Ensure MongoDB is running locally or update `MONGODB_URL` in the `.env` file to point to your remote MongoDB instance.

### Running the Application

1. **Start the Server**

   ```bash
   cd server
   npm start
   ```

   The server will run on `http://localhost:5000`.

2. **Start the Client**
   ```bash
   cd ../client
   npm run dev
   ```
   The client will be available at `http://localhost:5173`.

## 🎮 How to Use

### 1. User Registration & Login

- Navigate to `http://localhost:5173/signup` to create an account with your email and password.
- Log in at `http://localhost:5173/login` to access the platform.

### 2. Create an Auction (Bid Creator)

- After logging in, click "Create Auction" from the homepage.
- Fill in the form with item details, base price, bid type (highest/lowest), and time range.
- Submit to start a **PENDING** auction that goes live at the scheduled start time.

### 3. Place Bids (Bidder)

- View live auctions on the homepage.
- Click "Join Auction" on an auction card to access the bidding interface.
- Enter a bid amount (higher for highest-wins, lower for lowest-wins) and submit.
- Track your position and update your bid as needed during the live auction.
- Bidding stops when the timer ends or the creator ends the auction manually.

### 4. Monitor Auction Progress

- The auction detail page shows real-time bid updates, the current leader, and a countdown timer.
- Once ended, the winner is announced.

## 🛠️ Project Structure

```
venomj-p-e-auction-platform/
├── client/              # React frontend with Vite
│   ├── src/             # React components, pages, and stores
│   ├── index.html       # Main HTML file
│   ├── package.json     # Client dependencies
│   └── vite.config.js   # Vite configuration
├── server/              # Node.js backend with Express
│   ├── src/             # Routes, controllers, models, and utils
│   ├── package.json     # Server dependencies
│   └── .env             # Environment variables
```

## 📝 Technologies Used

- **Frontend**: React, Vite, Tailwind CSS, Socket.IO Client, Zustand
- **Backend**: Node.js, Express, Socket.IO, MongoDB, Mongoose
- **Authentication**: JWT
- **Real-Time**: Socket.IO for live bid updates
- **Styling**: Tailwind CSS
