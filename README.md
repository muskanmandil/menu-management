
# **Menu Management Server**

## **Project Overview**

The **Menu Management Server** is an assignment for Guestara Internship.

The project is built with  **Node.js/Express** for the backend, and it integrates with a **MongoDB** database for storing data.


---

## **Project Setup**

To set this project locally, follow these steps:

1. **Clone the repository:**

   ```bash
   git clone https://github.com/muskanmandil/menu-management.git
   cd menu-management
   ```

2. **Install the dependencies:**

   ```bash
   npm install
   ```

3. **Add the `.env` file:**

   Create a `.env` file and set the `MONGO_URI` environment variable:

   ```env
   MONGO_URI="mongodb+srv://muskanmandil:KomC5RciMtDlvVT1@cluster0.38pt8.mongodb.net/main"
   ```

4. **Start the server:**

   ```bash
   node index.js
   ```

   This will start the server at `http://localhost:4000`.

---