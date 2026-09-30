import { Outlet } from 'react-router-dom';
import { ShopHeader } from '../../components/ShopHeader';
import { ShopFooter } from '../../components/ShopFooter';
import { CartProvider } from '../../context/CartContext';

export function ShopLayout() {
  return (
    <CartProvider>
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <ShopHeader />
        <div style={{ flex: 1 }}>
          <Outlet />
        </div>
        <ShopFooter />
      </div>
    </CartProvider>
  );
}
