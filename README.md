
# **Menu Management Server**

## **Overview**

The **Menu Management Server** is a project developed as part of the Guestara Internship assignment.

It is built with  **Node.js/Express** for the backend, with  **MongoDB** as the database to store and manage data efficiently. 

- 🌐 **Hosted Server URL:** [Menu Management Server](https://menu-management-rouge.vercel.app/)  
- 📄 **API Documentation:** [Postman Documentation](https://documenter.getpostman.com/view/36686366/2sAYQgh8Ng)  

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

## **Answer to the questions asked**

1. **Which database you have chosen and why?**

I chose MongoDB due to its:

- Simple hosting and setup.
- JSON-like document storage, which aligns well with the data structure of menus and categories.
- Ability to maintain separate collections while connecting them using IDs.
- Powerful features like field population, which allows fetching related data efficiently when needed.

2. **3 things that you learned from this assignment?**

- How to create a search API 
- Developing a comprehensive Postman documentation for better API usability.
- Implementing regex operations for case-insensitive searching, enhancing flexibility in query handling.

3. **What was the most difficult part of the assignment?**

The most challenging aspect was implementing the tax applicability feature.

It required managing the inheritance of tax values from category to subcategory and eventually to food items, especially when fields were missing during the creation of subcategories or items.

4. **What you would have done differently given more time?**
With additional time, I would have:

- Integrated Multer and Supabase for efficient image storage.
- Developed a frontend panel for easier interaction and management of the system.
- Fully integrated the frontend with the backend to make the solution complete and user-friendly