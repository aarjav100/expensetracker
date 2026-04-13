import "./App.css";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
  Navigate,
} from "react-router-dom";
import { Toaster } from 'react-hot-toast';

import Navbar from "./Components/Navbar";
import ProtectedRoute from "./Components/Protectedroutes";
import Login from "./Pages/Login.jsx";
import Signup from "./Pages/Signup.jsx";
import Home from "./Pages/Home.jsx";
import Dashboard from "./Pages/Dashboard.jsx";
import AddExpense from "./Pages/Addexpense.jsx";
import Expenses from "./Pages/ShowExpense.jsx";
import Profile from "./Pages/Profiles.jsx";
import Store from "./Pages/Store.jsx";
import Reports from "./Pages/Reports.jsx";
import LandingPage from "./Pages/LandingPage.jsx";
import WalletPage from "./Pages/WalletPage.jsx";
import MockBank from "./Pages/MockBank.jsx";
import { WalletProvider } from "./Context/WalletContext.jsx";

function Layout() {
  const location = useLocation();
  const user = localStorage.getItem("userInfo");

  return (
    <>
      {(location.pathname !== "/login" && location.pathname !== "/signup" && location.pathname !== "/") && (
        <Navbar />
      )}

      <Routes>
        <Route
          path="/login"
          element={user ? <Navigate to="/dashboard" /> : <Login />}
        />

        <Route
          path="/signup"
          element={user ? <Navigate to="/dashboard" /> : <Signup />}
        />

        <Route
          path="/"
          element={<LandingPage />}
        />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/add-expense"
          element={
            <ProtectedRoute>
              <AddExpense />
            </ProtectedRoute>
          }
        />

        <Route
          path="/expenses"
          element={
            <ProtectedRoute>
              <Expenses />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/store"
          element={
            <ProtectedRoute>
              <Store />
            </ProtectedRoute>
          }
        />
        <Route
          path="/reports"
          element={
            <ProtectedRoute>
              <Reports />
            </ProtectedRoute>
          }
        />
        <Route
          path="/wallet"
          element={
            <ProtectedRoute>
              <WalletPage />
            </ProtectedRoute>
          }
        />
        <Route path="/mock-bank" element={<MockBank />} />

        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </>
  );
}

function App() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-50 font-sans">
      <WalletProvider>
        <Router>
          <Toaster position="top-center" reverseOrder={false} />
          <Layout />
        </Router>
      </WalletProvider>
    </div>
  );
}

export default App;