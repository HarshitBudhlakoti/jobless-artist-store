import { lazy, Suspense } from 'react';
import { Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';
import Loader from './components/common/Loader';
import ScrollToTop from './components/common/ScrollToTop';
import useAuth from './hooks/useAuth';

// Lazy-loaded pages
const Home = lazy(() => import('./pages/Home'));
const Shop = lazy(() => import('./pages/Shop'));
const ProductPage = lazy(() => import('./pages/ProductPage'));
const CustomOrder = lazy(() => import('./pages/CustomOrder'));
const Cart = lazy(() => import('./pages/Cart'));
const Checkout = lazy(() => import('./pages/Checkout'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const Profile = lazy(() => import('./pages/Profile'));
const About = lazy(() => import('./pages/About'));
const Contact = lazy(() => import('./pages/Contact'));
const OrderDetail = lazy(() => import('./pages/OrderDetail'));
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'));
const GoogleCallback = lazy(() => import('./pages/GoogleCallback'));
const ShippingPolicy = lazy(() => import('./pages/ShippingPolicy'));
const RefundPolicy = lazy(() => import('./pages/RefundPolicy'));
const TermsAndConditions = lazy(() => import('./pages/TermsAndConditions'));
const PrivacyPolicy = lazy(() => import('./pages/PrivacyPolicy'));
const NotFound = lazy(() => import('./pages/NotFound'));
const AdminLogin = lazy(() => import('./pages/admin/AdminLogin'));
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const AdminDashboardIndex = lazy(() =>
  import('./pages/admin/AdminDashboard').then((m) => ({ default: m.Dashboard }))
);
const AdminProducts = lazy(() =>
  import('./pages/admin/AdminDashboard').then((m) => ({ default: m.ProductManager }))
);
const AdminCategories = lazy(() =>
  import('./pages/admin/AdminDashboard').then((m) => ({ default: m.CategoryManager }))
);
const AdminOrders = lazy(() =>
  import('./pages/admin/AdminDashboard').then((m) => ({ default: m.OrderManager }))
);
const AdminCustomOrders = lazy(() =>
  import('./pages/admin/AdminDashboard').then((m) => ({ default: m.CustomOrderManager }))
);
const AdminCrafts = lazy(() =>
  import('./pages/admin/AdminDashboard').then((m) => ({ default: m.CraftCatalogManager }))
);
const AdminUsers = lazy(() =>
  import('./pages/admin/AdminDashboard').then((m) => ({ default: m.AdminUserManager }))
);
const AdminSiteSettings = lazy(() =>
  import('./pages/admin/AdminDashboard').then((m) => ({ default: m.SiteSettingsManager }))
);
const AdminPageContent = lazy(() =>
  import('./pages/admin/AdminDashboard').then((m) => ({ default: m.PageContentManager }))
);
const AdminTestimonials = lazy(() =>
  import('./pages/admin/AdminDashboard').then((m) => ({ default: m.TestimonialsManager }))
);

/** Route guard: requires the user to be authenticated. */
function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return <Loader />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return children;
}

/** Route guard: requires the user to be an admin. */
function AdminRoute({ children }) {
  const { user, isAuthenticated, loading } = useAuth();
  if (loading) return <Loader />;
  if (!isAuthenticated) return <Navigate to="/control-panel/login" replace />;
  if (user?.role !== 'admin') return <Navigate to="/" replace />;
  return children;
}

/** Determines whether to show Navbar/Footer (hidden on admin pages). */
function isAdminPath(pathname) {
  return pathname.startsWith('/control-panel');
}

function AppRoutes() {
  const location = useLocation();
  const isAdmin = isAdminPath(location.pathname);
  const showChrome = !isAdmin;

  return (
    <>
      <ScrollToTop />
      {showChrome && <Navbar />}

      <main className={showChrome ? 'min-h-screen pt-16 lg:pt-20' : 'min-h-screen'}>
        <Suspense fallback={<Loader />}>
          {isAdmin ? (
            /* Admin routes — flat child routes, no descendant <Routes> needed */
            <Routes>
              <Route path="/control-panel/login" element={<AdminLogin />} />
              <Route
                path="/control-panel"
                element={
                  <AdminRoute>
                    <AdminDashboard />
                  </AdminRoute>
                }
              >
                <Route index element={<AdminDashboardIndex />} />
                <Route path="products" element={<AdminProducts />} />
                <Route path="categories" element={<AdminCategories />} />
                <Route path="orders" element={<AdminOrders />} />
                <Route path="custom-orders" element={<AdminCustomOrders />} />
                <Route path="crafts" element={<AdminCrafts />} />
                <Route path="users" element={<AdminUsers />} />
                <Route path="site-settings" element={<AdminSiteSettings />} />
                <Route path="content" element={<AdminPageContent />} />
                <Route path="testimonials" element={<AdminTestimonials />} />
                <Route path="*" element={<Navigate to="/control-panel" replace />} />
              </Route>
            </Routes>
          ) : (
            /* Public routes — wrapped in AnimatePresence for page transitions */
            <AnimatePresence mode="wait">
              <Routes location={location} key={location.pathname}>
                <Route path="/" element={<Home />} />
                <Route path="/shop" element={<Shop />} />
                <Route path="/product/:id" element={<ProductPage />} />
                <Route path="/custom-order" element={<CustomOrder />} />
                <Route path="/cart" element={<Cart />} />
                <Route path="/about" element={<About />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/shipping-policy" element={<ShippingPolicy />} />
                <Route path="/refund-policy" element={<RefundPolicy />} />
                <Route path="/terms-and-conditions" element={<TermsAndConditions />} />
                <Route path="/privacy-policy" element={<PrivacyPolicy />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/auth/google/callback" element={<GoogleCallback />} />

                {/* Protected routes */}
                <Route
                  path="/checkout"
                  element={
                    <ProtectedRoute>
                      <Checkout />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/orders/:id"
                  element={
                    <ProtectedRoute>
                      <OrderDetail />
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

                {/* 404 */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </AnimatePresence>
          )}
        </Suspense>
      </main>

      {showChrome && <Footer />}
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <AppRoutes />
      </CartProvider>
    </AuthProvider>
  );
}
