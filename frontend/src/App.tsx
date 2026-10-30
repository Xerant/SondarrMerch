import { Route, Routes } from 'react-router-dom';
import { ShopLayout } from './pages/shop/ShopLayout';
import { ShopPage } from './pages/shop/ShopPage';
import { CollectionsPage } from './pages/shop/CollectionsPage';
import { CollectionPage } from './pages/shop/CollectionPage';
import { ProductPage } from './pages/shop/ProductPage';
import { CartPage } from './pages/shop/CartPage';
import { SellApp } from './pages/sell/SellApp';
import { NotFoundPage } from './pages/NotFoundPage';
import { LoginPage } from './pages/LoginPage';

function App() {
  return (
    <Routes>
      <Route element={<ShopLayout />}>
        <Route path="/" element={<ShopPage />} />
        <Route path="/collections" element={<CollectionsPage />} />
        <Route path="/collections/:id" element={<CollectionPage />} />
        <Route path="/products/:id" element={<ProductPage />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/login" element={<LoginPage />} />
      </Route>
      <Route path="/sell/*" element={<SellApp />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

export default App;
