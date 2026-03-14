# GitSolve - How to Run

To start the GitSolve application manually in the future, you need to run both the backend API and the frontend application in separate terminal windows.

## 1. Start the Backend API Server
Open a new terminal and run the following commands:
```powershell
cd "c:\Users\Rahul SP\Gitsolve\backend\server"
npm run dev
```
*(This starts the Express server on http://localhost:3001)*

## 2. Start the Frontend Application
Open a second terminal and run the following commands:
```powershell
cd "c:\Users\Rahul SP\Gitsolve\frontend"
npm run dev
```
*(This starts the Vite React application on http://localhost:5173)*

## 3. Access the Application
Once both servers are running, open your browser and navigate to:
**http://localhost:5173**
