# Backend for a Social Media Platform  

This project is the backend implementation of a social media platform, handling user authentication, video and tweet management, subscriptions, playlists, likes, comments, and dashboard analytics. The backend is built using Node.js, Express.js, and MongoDB, with authentication and file handling mechanisms integrated.  

## Features  

### 1. User Authentication & Authorization  
- Implements authentication using JWT with access and refresh tokens.  
- Passwords are securely hashed using bcrypt before storing them in the database.  
- Role-based access control ensures that only authorized users can perform specific actions.  

### 2. Video Management  
- Allows users to upload, update, delete, and search for videos.  
- Searching supports filters based on query parameters, sorting, and pagination.  
- Videos are stored using Cloudinary, enabling efficient media management.  

### 3. Tweet Management  
- Users can create, update, and delete tweets.  
- A dedicated API fetches all tweets posted by a user.  

### 4. Subscription System  
- Users can subscribe to or unsubscribe from channels.  
- APIs retrieve the list of subscribers for a channel and the channels a user is subscribed to.  

### 5. Like System  
- Users can like or unlike tweets, videos, and comments.  
- The like status is stored efficiently, allowing quick retrieval.  

### 6. Playlist Management  
- Users can create, update, and delete playlists.  
- Videos can be added or removed from playlists.  
- A user’s playlists can be fetched through an API.  

### 7. Comment System  
- Users can add, edit, and delete comments on videos.  
- Comments can be retrieved with pagination support.  

### 8. Channel Profile & Statistics  
- APIs fetch a channel’s profile, including subscriber count, subscriptions, and whether a viewer is subscribed.  
- Channel statistics include total uploaded videos, total likes, and total subscribers.  

### 9. File Upload & Storage  
- Cloudinary is used for uploading and managing media files (videos, images).  
- Multer is integrated to handle file uploads in API requests.  

### 10. Error Handling & Standardized Responses  
- A global error handler is implemented using a custom `ApiError` class to return structured error messages.  
- Responses follow a consistent format using an `ApiResponse` utility.  
- The `asyncHandler` utility wraps all controllers to handle errors properly.  

### 11. Middleware  
- **Authentication Middleware**: Verifies JWT tokens before allowing access to protected routes.  
- **Multer Middleware**: Handles file uploads and ensures uploaded files are accessible via `req.file(s)`.  

### 12. Database Queries & Aggregation Pipelines  
- Uses MongoDB aggregation pipelines to fetch structured data such as watch history, channel statistics, and subscription details.  
- Optimized queries ensure efficient data retrieval even with deeply nested relationships.  

### 13. API Testing with Postman  
- All APIs have been tested using Postman under different scenarios.  
- Test cases include authentication flows, file uploads, and complex query handling to validate API behavior.  
- There might still be some bugs, which will be fixed as they are identified.  

---

## Future Plans  
- **Integrating this with frontend**  
