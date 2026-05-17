import { ThemeProvider } from './ThemeContext';
import { AuthProvider } from './AuthContext';
import { ToastProvider } from './ToastContext';
import { CartProvider } from './CartContext';
import { WishlistProvider } from './WishlistContext';

/**
 * AppProvider — gộp tất cả context providers thành 1 component duy nhất.
 * Giảm nesting depth, dễ maintain hơn.
 */
export default function AppProvider({ children }) {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ToastProvider>
          <CartProvider>
            <WishlistProvider>
              {children}
            </WishlistProvider>
          </CartProvider>
        </ToastProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
