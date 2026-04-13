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
import BudgetPlanner from "./Pages/BudgetPlanner.jsx";
import PredictionPage from "./Pages/PredictionPage.jsx";
import MainLayout from "./Components/Layout/MainLayout.jsx";

function Layout() {
  const user = localStorage.getItem("userInfo");

  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/dashboard" /> : <Login />} />
      <Route path="/signup" element={user ? <Navigate to="/dashboard" /> : <Signup />} />
      <Route path="/" element={<LandingPage />} />
      <Route path="/mock-bank" element={<MockBank />} />

      {/* Protected Layout Area */}
      <Route element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/add-expense" element={<AddExpense />} />
        <Route path="/history" element={<Expenses />} />
        <Route path="/budget" element={<BudgetPlanner />} />
        <Route path="/prediction" element={<PredictionPage />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/store" element={<Store />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/wallet" element={<WalletPage />} />
      </Route>

      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
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