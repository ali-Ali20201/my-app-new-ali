/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { CurrencyProvider } from "./context/CurrencyContext";
import { NotificationProvider } from "./context/NotificationContext";
import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";
import MobileAppHandler from "./components/MobileAppHandler";
import InstallPWA from "./components/InstallPWA";
import LandingPage from "./components/LandingPage";
import AdminLogin from "./pages/AdminLogin";
import Home from "./pages/Home";
import Recharge from "./pages/Recharge";
import Orders from "./pages/Orders";
import Instructions from "./pages/Instructions";
import PromoCodes from "./pages/PromoCodes";
import Dashboard from "./pages/admin/Dashboard";
import Products from "./pages/admin/Products";
import Categories from "./pages/admin/Categories";
import Recharges from "./pages/admin/Recharges";
import AdminOrders from "./pages/admin/Orders";
import Settings from "./pages/admin/Settings";
import AdminPromoCodes from "./pages/admin/PromoCodes";
import ContactUs from "./pages/ContactUs";
import Mail from "./pages/Mail";
import Messages from "./pages/admin/Messages";
import Balance from "./pages/admin/Balance";
import Users from "./pages/admin/Users";

export default function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <CurrencyProvider>
          <BrowserRouter>
            <MobileAppHandler />
            <InstallPWA />
            <Routes>
              <Route path="/adminali20112024" element={<AdminLogin />} />
              <Route path="/" element={<Layout />}>
                {/* User Routes */}
                <Route index element={<Home />} />
                <Route path="recharge" element={<Recharge />} />
                <Route path="orders" element={<Orders />} />
                <Route path="instructions" element={<Instructions />} />
                <Route path="promo-codes" element={<PromoCodes />} />
                <Route path="contact-us" element={<ContactUs />} />
                <Route path="mail" element={<Mail />} />

                {/* Admin Routes */}
                <Route path="admin" element={<ProtectedRoute adminOnly><Dashboard /></ProtectedRoute>} />
                <Route path="admin/products" element={<ProtectedRoute adminOnly><Products /></ProtectedRoute>} />
                <Route path="admin/categories" element={<ProtectedRoute adminOnly><Categories /></ProtectedRoute>} />
                <Route path="admin/recharges" element={<ProtectedRoute adminOnly><Recharges /></ProtectedRoute>} />
                <Route path="admin/orders" element={<ProtectedRoute adminOnly><AdminOrders /></ProtectedRoute>} />
                <Route path="admin/promo-codes" element={<ProtectedRoute adminOnly><AdminPromoCodes /></ProtectedRoute>} />
                <Route path="admin/settings" element={<ProtectedRoute adminOnly><Settings /></ProtectedRoute>} />
                <Route path="admin/messages" element={<ProtectedRoute adminOnly><Messages /></ProtectedRoute>} />
                <Route path="admin/balance" element={<ProtectedRoute adminOnly><Balance /></ProtectedRoute>} />
                <Route path="admin/users" element={<ProtectedRoute adminOnly><Users /></ProtectedRoute>} />
              </Route>
            </Routes>
          </BrowserRouter>
        </CurrencyProvider>
      </NotificationProvider>
    </AuthProvider>
  );
}
