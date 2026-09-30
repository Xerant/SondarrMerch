import { useRef, useState } from 'react';
import { SellHeader } from './SellHeader';
import { Stepper } from './Stepper';
import { ChooseMethod } from './ChooseMethod';
import { ShopifyForm } from './ShopifyForm';
import { ShopifyConnecting } from './ShopifyConnecting';
import { ShopifySync } from './ShopifySync';
import { ManualForm } from './ManualForm';
import { Dashboard } from './Dashboard';
import { SHOPIFY_MOCK } from './mockData';
import type { ManualProduct, SellMode, ShopifyMockProduct, WizardStep } from './types';

/**
 * Not wired to a backend: SondarrMerch's API is single-tenant (one configured
 * Shopify store) with no artist-onboarding or seller-CRUD endpoints yet, so this
 * wizard/dashboard runs entirely on local component state as a UX reference.
 */
export function SellApp() {
  const [mode, setMode] = useState<SellMode>('wizard');
  const [step, setStep] = useState<WizardStep>('choose');
  const [storeUrl, setStoreUrl] = useState('');
  const [shopify, setShopify] = useState<ShopifyMockProduct[] | null>(null);
  const [manual, setManual] = useState<ManualProduct[]>([]);
  const connectTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const goDashboard = () => {
    if (!shopify && manual.length === 0) {
      setShopify(SHOPIFY_MOCK);
      setManual([{ id: 'seed1', name: 'Wanderlust Tote', price: 22, desc: '', cat: 'Accessories', inv: 40, variants: [] }]);
    }
    setMode('dashboard');
  };

  const connectShopify = (url: string) => {
    const resolved = url || 'yourstore.myshopify.com';
    setStoreUrl(resolved);
    setStep('shopify-connecting');
    connectTimeout.current = setTimeout(() => setStep('shopify-sync'), 1600);
  };

  const finishShopify = (products: ShopifyMockProduct[]) => {
    setShopify(products);
    setMode('dashboard');
  };

  const addManual = (p: ManualProduct) => setManual((m) => [...m, p]);
  const finishManual = () => setMode('dashboard');
  const removeManual = (id: string) => setManual((m) => m.filter((p) => p.id !== id));
  const resync = () => {};
  const disconnect = () => setShopify(null);

  return (
    <div style={{ minHeight: '100vh' }}>
      <SellHeader mode={mode} onPreviewDashboard={goDashboard} />
      <div style={{ maxWidth: 1080, margin: '0 auto', padding: '44px 48px 80px' }}>
        {mode === 'wizard' && (
          <>
            <Stepper step={step} />
            {step === 'choose' && <ChooseMethod onPick={setStep} />}
            {step === 'shopify-form' && <ShopifyForm onConnect={connectShopify} onBack={() => setStep('choose')} />}
            {step === 'shopify-connecting' && <ShopifyConnecting storeUrl={storeUrl} />}
            {step === 'shopify-sync' && (
              <ShopifySync storeUrl={storeUrl} onFinish={finishShopify} onBack={() => setStep('choose')} />
            )}
            {step === 'manual-form' && (
              <ManualForm products={manual} onAdd={addManual} onFinish={finishManual} onBack={() => setStep('choose')} />
            )}
          </>
        )}
        {mode === 'dashboard' && (
          <Dashboard
            shopify={shopify}
            manual={manual}
            onDisconnect={disconnect}
            onResync={resync}
            onAddMore={(target) => {
              setMode('wizard');
              setStep(target);
            }}
            onRemoveManual={removeManual}
          />
        )}
      </div>
    </div>
  );
}
