import React, { useState } from 'react';
import { useAuth } from '../App';
import { LogOut, ChevronDown, ChevronRight, ShoppingCart, List, PlusCircle, CheckCircle2, User, Menu } from 'lucide-react';

export default function Dashboard() {
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [orderMenuOpen, setOrderMenuOpen] = useState(true);
  const [activeView, setActiveView] = useState<'find' | 'one-step' | 'two-step'>('find');

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#090d16] text-slate-100 font-sans font-sans">
      <div className={`flex flex-col border-r border-slate-800 bg-[#0b1329] transition-all duration-300 ${sidebarOpen ? 'w-64' : 'w-16'}`}>
        <div className="flex h-16 items-center justify-between border-b border-slate-800 px-4">
          {sidebarOpen ? (
            <span className="text-lg font-bold tracking-wider text-blue-400 uppercase">Q3 Portal</span>
          ) : (
            <span className="text-lg font-bold tracking-wider text-blue-400 mx-auto">Q3</span>
          )}
        </div>

        <div className="flex-1 py-4 overflow-y-auto">
          <div className="space-y-1 px-2">
            <button
              onClick={() => sidebarOpen && setOrderMenuOpen(!orderMenuOpen)}
              className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm font-medium text-slate-300 hover:bg-slate-800/50 hover:text-white"
            >
              <div className="flex items-center space-x-2">
                <ShoppingCart size={18} className="text-blue-400" />
                {sidebarOpen && <span>Order Entry</span>}
              </div>
              {sidebarOpen && (orderMenuOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />)}
            </button>

            {orderMenuOpen && sidebarOpen && (
              <div className="pl-6 space-y-1">
                <button
                  onClick={() => setActiveView('find')}
                  className={`flex w-full items-center space-x-2 rounded-lg px-3 py-1.5 text-xs font-medium ${activeView === 'find' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-800/30 hover:text-white'}`}
                >
                  <List size={14} />
                  <span>Find orders</span>
                </button>
                <button
                  onClick={() => setActiveView('one-step')}
                  className={`flex w-full items-center space-x-2 rounded-lg px-3 py-1.5 text-xs font-medium ${activeView === 'one-step' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-800/30 hover:text-white'}`}
                >
                  <PlusCircle size={14} />
                  <span>Create 1 Step Order</span>
                </button>
                <button
                  onClick={() => setActiveView('two-step')}
                  className={`flex w-full items-center space-x-2 rounded-lg px-3 py-1.5 text-xs font-medium ${activeView === 'two-step' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-800/30 hover:text-white'}`}
                >
                  <PlusCircle size={14} />
                  <span>Create 2 Step Order</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {sidebarOpen && (
          <div className="border-t border-slate-800 bg-[#090d1f] p-4 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-500/20 text-blue-400">
                <User size={18} />
              </div>
              <div className="overflow-hidden">
                <p className="text-sm font-semibold truncate text-white">{user?.first_name} {user?.last_name}</p>
                <p className="text-xs truncate text-slate-400 capitalize">{user?.role}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="flex h-16 items-center justify-between border-b border-slate-800 bg-[#0b1329] px-6">
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="text-slate-400 hover:text-white">
            <Menu size={20} />
          </button>

          <button
            onClick={logout}
            className="flex items-center space-x-2 text-sm font-medium text-red-400 hover:text-red-300 transition"
          >
            <LogOut size={16} />
            <span>Sign Out</span>
          </button>
        </header>

        <main className="flex-1 overflow-auto bg-[#090d16] p-6">
          {activeView === 'find' && <FindOrdersView />}
          {activeView === 'one-step' && <CreateOneStepView />}
          {activeView === 'two-step' && <CreateTwoStepView />}
        </main>
      </div>
    </div>
  );
}

function FindOrdersView() {
  const [search, setSearch] = useState('');
  const [orders, setOrders] = useState([
    { id: 'ORD-8942', customer: 'Acme Corporation', date: '2026-06-28', total: '$1,240.00', status: 'Shipped', items: 12 },
    { id: 'ORD-8941', customer: 'Global Industries', date: '2026-06-28', total: '$450.50', status: 'Pending', items: 3 },
    { id: 'ORD-8940', customer: 'Stark Enterprises', date: '2026-06-27', total: '$8,900.00', status: 'Processing', items: 25 },
    { id: 'ORD-8939', customer: 'Wayne Enterprises', date: '2026-06-26', total: '$3,120.00', status: 'Completed', items: 8 },
  ]);

  const filteredOrders = orders.filter(
    (order) =>
      order.id.toLowerCase().includes(search.toLowerCase()) ||
      order.customer.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-bold text-white">Find Orders</h1>
        <p className="text-xs text-slate-400 mt-1">Search and manage existing customer orders</p>
      </div>

      <div className="rounded-xl border border-slate-800 bg-[#0f172a]/50 p-4">
        <div className="mb-4">
          <input
            type="text"
            placeholder="Search by Order ID or Customer name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full max-w-sm rounded-lg border border-slate-700 bg-slate-900/50 px-3 py-2 text-sm text-white placeholder-slate-500 outline-none focus:border-blue-500"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-medium">
                <th className="py-3 px-4">Order ID</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4 text-center">Items</th>
                <th className="py-3 px-4">Total</th>
                <th className="py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {filteredOrders.map((order) => (
                <tr key={order.id} className="hover:bg-slate-800/20 text-slate-300">
                  <td className="py-3 px-4 font-mono text-blue-400">{order.id}</td>
                  <td className="py-3 px-4 font-medium text-white">{order.customer}</td>
                  <td className="py-3 px-4">{order.date}</td>
                  <td className="py-3 px-4 text-center">{order.items}</td>
                  <td className="py-3 px-4 font-semibold">{order.total}</td>
                  <td className="py-3 px-4">
                    <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${
                      order.status === 'Shipped' || order.status === 'Completed'
                        ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                        : order.status === 'Pending'
                        ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'
                        : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                    }`}>
                      {order.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function CreateOneStepView() {
  const [customer, setCustomer] = useState('');
  const [sku, setSku] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [success, setSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess(true);
    setTimeout(() => {
      setSuccess(false);
      setCustomer('');
      setSku('');
      setQuantity(1);
    }, 2000);
  };

  return (
    <div className="space-y-4 max-w-lg">
      <div>
        <h1 className="text-xl font-bold text-white">Create 1 Step Order</h1>
        <p className="text-xs text-slate-400 mt-1">Instantly dispatch a purchase order in a single submission</p>
      </div>

      <div className="rounded-xl border border-slate-800 bg-[#0f172a]/50 p-6">
        {success ? (
          <div className="flex flex-col items-center justify-center py-6 text-center">
            <CheckCircle2 size={48} className="text-green-500 mb-3" />
            <h3 className="text-lg font-bold text-white">Order Placed Successfully</h3>
            <p className="text-xs text-slate-400 mt-1">The system has recorded and scheduled the order</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Customer Name</label>
              <input
                type="text"
                required
                value={customer}
                onChange={(e) => setCustomer(e.target.value)}
                placeholder="Acme Corporation"
                className="w-full rounded-lg border border-slate-700 bg-slate-900/50 px-3 py-2 text-sm text-white placeholder-slate-500 outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">SKU / Item ID</label>
              <input
                type="text"
                required
                value={sku}
                onChange={(e) => setSku(e.target.value)}
                placeholder="SKU-8942-X"
                className="w-full rounded-lg border border-slate-700 bg-slate-900/50 px-3 py-2 text-sm text-white placeholder-slate-500 outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Quantity</label>
              <input
                type="number"
                required
                min={1}
                value={quantity}
                onChange={(e) => setQuantity(parseInt(e.target.value))}
                className="w-full rounded-lg border border-slate-700 bg-slate-900/50 px-3 py-2 text-sm text-white outline-none focus:border-blue-500"
              />
            </div>
            <button type="submit" className="w-full rounded-lg bg-blue-600 py-2.5 text-sm font-semibold text-white shadow-lg hover:bg-blue-500 transition">
              Place Order
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

function CreateTwoStepView() {
  const [step, setStep] = useState(1);
  const [customer, setCustomer] = useState('');
  const [address, setAddress] = useState('');
  const [sku, setSku] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [success, setSuccess] = useState(false);

  const handleNext = () => {
    if (step === 1 && customer && address) setStep(2);
  };

  const handleSubmit = () => {
    setSuccess(true);
    setTimeout(() => {
      setSuccess(false);
      setStep(1);
      setCustomer('');
      setAddress('');
      setSku('');
      setQuantity(1);
    }, 2000);
  };

  return (
    <div className="space-y-4 max-w-lg">
      <div>
        <h1 className="text-xl font-bold text-white">Create 2 Step Order</h1>
        <p className="text-xs text-slate-400 mt-1">Multi-step routing wizard to review and approve orders</p>
      </div>

      <div className="flex items-center space-x-4 mb-4 text-xs font-semibold uppercase tracking-wider font-sans">
        <span className={`${step === 1 ? 'text-blue-400' : 'text-slate-500'}`}>1. Customer Details</span>
        <span className="text-slate-700">/</span>
        <span className={`${step === 2 ? 'text-blue-400' : 'text-slate-500'}`}>2. Items & Confirmation</span>
      </div>

      <div className="rounded-xl border border-slate-800 bg-[#0f172a]/50 p-6">
        {success ? (
          <div className="flex flex-col items-center justify-center py-6 text-center">
            <CheckCircle2 size={48} className="text-green-500 mb-3" />
            <h3 className="text-lg font-bold text-white">Order Approved & Created</h3>
            <p className="text-xs text-slate-400 mt-1">Multi-step validation checks succeeded</p>
          </div>
        ) : (
          <div className="space-y-4">
            {step === 1 && (
              <>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Customer Name</label>
                  <input
                    type="text"
                    required
                    value={customer}
                    onChange={(e) => setCustomer(e.target.value)}
                    placeholder="Global Industries"
                    className="w-full rounded-lg border border-slate-700 bg-slate-900/50 px-3 py-2 text-sm text-white placeholder-slate-500 outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Shipping Address</label>
                  <input
                    type="text"
                    required
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="123 Industrial Way, Sector 4"
                    className="w-full rounded-lg border border-slate-700 bg-slate-900/50 px-3 py-2 text-sm text-white placeholder-slate-500 outline-none focus:border-blue-500"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleNext}
                  disabled={!customer || !address}
                  className="w-full rounded-lg bg-blue-600 py-2.5 text-sm font-semibold text-white disabled:opacity-50 hover:bg-blue-500 transition"
                >
                  Continue to Step 2
                </button>
              </>
            )}

            {step === 2 && (
              <>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">SKU / Item ID</label>
                  <input
                    type="text"
                    required
                    value={sku}
                    onChange={(e) => setSku(e.target.value)}
                    placeholder="SKU-9912-A"
                    className="w-full rounded-lg border border-slate-700 bg-slate-900/50 px-3 py-2 text-sm text-white placeholder-slate-500 outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Quantity</label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={quantity}
                    onChange={(e) => setQuantity(parseInt(e.target.value))}
                    className="w-full rounded-lg border border-slate-700 bg-slate-900/50 px-3 py-2 text-sm text-white outline-none focus:border-blue-500"
                  />
                </div>

                <div className="flex space-x-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="flex-1 rounded-lg border border-slate-750 py-2 text-sm font-semibold text-slate-300 hover:bg-slate-800"
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={!sku}
                    className="flex-1 rounded-lg bg-blue-600 py-2 text-sm font-semibold text-white disabled:opacity-50 hover:bg-blue-500"
                  >
                    Submit Order
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
