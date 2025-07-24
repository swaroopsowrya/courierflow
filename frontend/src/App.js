import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast, Toaster } from 'react-hot-toast';
import { 
  Package, 
  Truck, 
  MapPin, 
  Clock, 
  Shield, 
  Star, 
  User, 
  LogOut, 
  Menu, 
  X,
  Search,
  Plus,
  Eye,
  Settings,
  BarChart3,
  Users
} from 'lucide-react';
import './App.css';

const App = () => {
  const [currentPage, setCurrentPage] = useState('home');
  const [user, setUser] = useState(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [authMode, setAuthMode] = useState('login');
  const [isLoading, setIsLoading] = useState(false);

  const API_BASE_URL = process.env.REACT_APP_BACKEND_URL;

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    if (token && userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  // Authentication Functions
  const handleAuth = async (formData, isLogin = true) => {
    setIsLoading(true);
    try {
      const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      
      if (response.ok) {
        localStorage.setItem('token', data.access_token);
        localStorage.setItem('user', JSON.stringify(data.user));
        setUser(data.user);
        setCurrentPage('dashboard');
        toast.success(isLogin ? 'Login successful!' : 'Registration successful!');
      } else {
        toast.error(data.detail || 'Authentication failed');
      }
    } catch (error) {
      toast.error('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setCurrentPage('home');
    toast.success('Logged out successfully');
  };

  // Page Components
  const HomePage = () => (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Navigation */}
      <nav className="bg-white shadow-lg fixed w-full z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <motion.div 
                className="flex-shrink-0 flex items-center"
                whileHover={{ scale: 1.05 }}
              >
                <Package className="h-8 w-8 text-blue-600 mr-2" />
                <span className="text-xl font-bold text-gray-900">CourierFlow</span>
              </motion.div>
            </div>
            
            <div className="hidden md:flex items-center space-x-8">
              <button onClick={() => setCurrentPage('home')} className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium">Home</button>
              <button onClick={() => setCurrentPage('tracking')} className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium">Track Package</button>
              <button onClick={() => setCurrentPage('pricing')} className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium">Pricing</button>
              
              {user ? (
                <div className="flex items-center space-x-4">
                  <span className="text-gray-700">Hi, {user.name}</span>
                  <button 
                    onClick={() => setCurrentPage('dashboard')}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
                  >
                    Dashboard
                  </button>
                  <button onClick={handleLogout} className="text-gray-700 hover:text-red-600">
                    <LogOut className="h-5 w-5" />
                  </button>
                </div>
              ) : (
                <button 
                  onClick={() => setCurrentPage('auth')}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  Login / Register
                </button>
              )}
            </div>

            <div className="md:hidden flex items-center">
              <button onClick={() => setIsMenuOpen(!isMenuOpen)}>
                {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden bg-white border-t"
            >
              <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
                <button onClick={() => { setCurrentPage('home'); setIsMenuOpen(false); }} className="block px-3 py-2 text-gray-700">Home</button>
                <button onClick={() => { setCurrentPage('tracking'); setIsMenuOpen(false); }} className="block px-3 py-2 text-gray-700">Track Package</button>
                <button onClick={() => { setCurrentPage('pricing'); setIsMenuOpen(false); }} className="block px-3 py-2 text-gray-700">Pricing</button>
                {user ? (
                  <>
                    <button onClick={() => { setCurrentPage('dashboard'); setIsMenuOpen(false); }} className="block px-3 py-2 text-blue-600">Dashboard</button>
                    <button onClick={handleLogout} className="block px-3 py-2 text-red-600">Logout</button>
                  </>
                ) : (
                  <button onClick={() => { setCurrentPage('auth'); setIsMenuOpen(false); }} className="block px-3 py-2 text-blue-600">Login / Register</button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Hero Section */}
      <section className="pt-20 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-4xl md:text-6xl font-bold text-gray-900 mb-6"
            >
              Fast & Reliable
              <span className="text-blue-600"> Courier Delivery</span>
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto"
            >
              Send packages anywhere in India with real-time tracking, competitive pricing, and guaranteed delivery times. Your trusted logistics partner.
            </motion.p>
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <button 
                onClick={() => setCurrentPage(user ? 'send-package' : 'auth')}
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg text-lg font-semibold transition-colors shadow-lg hover:shadow-xl"
              >
                Send a Package
              </button>
              <button 
                onClick={() => setCurrentPage('tracking')}
                className="bg-white hover:bg-gray-50 text-blue-600 border-2 border-blue-600 px-8 py-3 rounded-lg text-lg font-semibold transition-colors"
              >
                Track Package
              </button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Choose CourierFlow?</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">Experience the best in courier services with our advanced features and customer-first approach.</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: Truck, title: "Fast Delivery", desc: "Express delivery options with same-day and next-day delivery available." },
              { icon: MapPin, title: "Real-time Tracking", desc: "Track your package every step of the way with live updates and GPS tracking." },
              { icon: Shield, title: "Secure & Safe", desc: "Your packages are insured and handled with utmost care and security." },
              { icon: Clock, title: "On-time Guarantee", desc: "We guarantee delivery within the promised timeframe or your money back." },
              { icon: Star, title: "5-Star Service", desc: "Rated highly by thousands of customers for our exceptional service quality." },
              { icon: Package, title: "Easy Booking", desc: "Simple online booking process that takes less than 5 minutes to complete." }
            ].map((feature, index) => (
              <motion.div 
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="text-center p-6 rounded-lg hover:shadow-lg transition-shadow"
              >
                <feature.icon className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">How It Works</h2>
            <p className="text-gray-600">Simple steps to send your package anywhere</p>
          </div>
          
          <div className="grid md:grid-cols-4 gap-8">
            {[
              { step: "1", title: "Book Online", desc: "Fill in sender and receiver details with package information." },
              { step: "2", title: "Schedule Pickup", desc: "Choose a convenient pickup time and location." },
              { step: "3", title: "Track Progress", desc: "Monitor your package in real-time with our tracking system." },
              { step: "4", title: "Delivered", desc: "Your package reaches its destination safely and on time." }
            ].map((step, index) => (
              <motion.div 
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.2 }}
                className="text-center"
              >
                <div className="bg-blue-600 text-white w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                  {step.step}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{step.title}</h3>
                <p className="text-gray-600">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );

  const AuthPage = () => {
    const [formData, setFormData] = useState({
      name: '',
      email: '',
      password: '',
      role: 'customer'
    });

    const handleSubmit = (e) => {
      e.preventDefault();
      if (authMode === 'login') {
        handleAuth({ email: formData.email, password: formData.password }, true);
      } else {
        handleAuth(formData, false);
      }
    };

    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-lg"
        >
          <div>
            <div className="flex justify-center">
              <Package className="h-12 w-12 text-blue-600" />
            </div>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
              {authMode === 'login' ? 'Sign in to your account' : 'Create your account'}
            </h2>
          </div>
          
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            {authMode === 'register' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter your full name"
                />
              </div>
            )}
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter your email"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input
                type="password"
                required
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter your password"
              />
            </div>

            {authMode === 'register' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({...formData, role: e.target.value})}
                  className="appearance-none relative block w-full px-3 py-2 border border-gray-300 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="customer">Customer</option>
                  <option value="delivery_agent">Delivery Agent</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
            )}

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Processing...' : (authMode === 'login' ? 'Sign In' : 'Register')}
              </button>
            </div>

            <div className="text-center">
              <button
                type="button"
                onClick={() => setAuthMode(authMode === 'login' ? 'register' : 'login')}
                className="text-blue-600 hover:text-blue-500"
              >
                {authMode === 'login' ? "Don't have an account? Register" : "Already have an account? Sign In"}
              </button>
            </div>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => setCurrentPage('home')}
              className="text-gray-600 hover:text-gray-500"
            >
              ← Back to Home
            </button>
          </div>
        </motion.div>
      </div>
    );
  };

  const SendPackagePage = () => {
    const [step, setStep] = useState(1);
    const [packageData, setPackageData] = useState({
      sender: {
        name: '',
        phone: '',
        address: '',
        city: '',
        state: '',
        postal_code: '',
        country: 'India'
      },
      receiver: {
        name: '',
        phone: '',
        address: '',
        city: '',
        state: '',
        postal_code: '',
        country: 'India'
      },
      package_details: {
        type: 'parcel',
        weight: 1,
        length: 10,
        width: 10,
        height: 10,
        description: ''
      },
      service_type: 'standard',
      pickup_date: new Date().toISOString().split('T')[0]
    });
    const [priceEstimate, setPriceEstimate] = useState(null);

    const calculatePrice = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_BASE_URL}/api/packages/calculate-price`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            sender_city: packageData.sender.city,
            receiver_city: packageData.receiver.city,
            weight: packageData.package_details.weight,
            service_type: packageData.service_type
          })
        });
        
        const data = await response.json();
        if (response.ok) {
          setPriceEstimate(data);
        }
      } catch (error) {
        toast.error('Failed to calculate price');
      }
    };

    const createPackage = async () => {
      setIsLoading(true);
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_BASE_URL}/api/packages/create`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(packageData)
        });
        
        const data = await response.json();
        if (response.ok) {
          toast.success(`Package created! Tracking ID: ${data.tracking_id}`);
          setCurrentPage('dashboard');
        } else {
          toast.error(data.detail || 'Failed to create package');
        }
      } catch (error) {
        toast.error('Network error. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    const nextStep = () => {
      if (step === 2) calculatePrice();
      setStep(step + 1);
    };

    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-lg shadow-lg p-8"
          >
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-4">Send a Package</h1>
              <div className="flex items-center space-x-4">
                {[1, 2, 3, 4].map((stepNum) => (
                  <div key={stepNum} className={`flex items-center ${stepNum < 4 ? 'flex-1' : ''}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      step >= stepNum ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
                    }`}>
                      {stepNum}
                    </div>
                    {stepNum < 4 && <div className={`flex-1 h-1 mx-2 ${step > stepNum ? 'bg-blue-600' : 'bg-gray-200'}`} />}
                  </div>
                ))}
              </div>
              <div className="mt-2 text-sm text-gray-600">
                {step === 1 && "Sender Details"}
                {step === 2 && "Receiver Details"}
                {step === 3 && "Package Details"}
                {step === 4 && "Review & Pay"}
              </div>
            </div>

            {step === 1 && (
              <div className="space-y-4">
                <h3 className="text-xl font-semibold mb-4">Sender Information</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="Full Name"
                    value={packageData.sender.name}
                    onChange={(e) => setPackageData({
                      ...packageData,
                      sender: {...packageData.sender, name: e.target.value}
                    })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <input
                    type="tel"
                    placeholder="Phone Number"
                    value={packageData.sender.phone}
                    onChange={(e) => setPackageData({
                      ...packageData,
                      sender: {...packageData.sender, phone: e.target.value}
                    })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <textarea
                  placeholder="Complete Address"
                  value={packageData.sender.address}
                  onChange={(e) => setPackageData({
                    ...packageData,
                    sender: {...packageData.sender, address: e.target.value}
                  })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  rows="3"
                />
                <div className="grid md:grid-cols-3 gap-4">
                  <input
                    type="text"
                    placeholder="City"
                    value={packageData.sender.city}
                    onChange={(e) => setPackageData({
                      ...packageData,
                      sender: {...packageData.sender, city: e.target.value}
                    })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <input
                    type="text"
                    placeholder="State"
                    value={packageData.sender.state}
                    onChange={(e) => setPackageData({
                      ...packageData,
                      sender: {...packageData.sender, state: e.target.value}
                    })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <input
                    type="text"
                    placeholder="Postal Code"
                    value={packageData.sender.postal_code}
                    onChange={(e) => setPackageData({
                      ...packageData,
                      sender: {...packageData.sender, postal_code: e.target.value}
                    })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4">
                <h3 className="text-xl font-semibold mb-4">Receiver Information</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="Full Name"
                    value={packageData.receiver.name}
                    onChange={(e) => setPackageData({
                      ...packageData,
                      receiver: {...packageData.receiver, name: e.target.value}
                    })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <input
                    type="tel"
                    placeholder="Phone Number"
                    value={packageData.receiver.phone}
                    onChange={(e) => setPackageData({
                      ...packageData,
                      receiver: {...packageData.receiver, phone: e.target.value}
                    })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <textarea
                  placeholder="Complete Address"
                  value={packageData.receiver.address}
                  onChange={(e) => setPackageData({
                    ...packageData,
                    receiver: {...packageData.receiver, address: e.target.value}
                  })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  rows="3"
                />
                <div className="grid md:grid-cols-3 gap-4">
                  <input
                    type="text"
                    placeholder="City"
                    value={packageData.receiver.city}
                    onChange={(e) => setPackageData({
                      ...packageData,
                      receiver: {...packageData.receiver, city: e.target.value}
                    })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <input
                    type="text"
                    placeholder="State"
                    value={packageData.receiver.state}
                    onChange={(e) => setPackageData({
                      ...packageData,
                      receiver: {...packageData.receiver, state: e.target.value}
                    })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <input
                    type="text"
                    placeholder="Postal Code"
                    value={packageData.receiver.postal_code}
                    onChange={(e) => setPackageData({
                      ...packageData,
                      receiver: {...packageData.receiver, postal_code: e.target.value}
                    })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-4">
                <h3 className="text-xl font-semibold mb-4">Package Details</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Package Type</label>
                    <select
                      value={packageData.package_details.type}
                      onChange={(e) => setPackageData({
                        ...packageData,
                        package_details: {...packageData.package_details, type: e.target.value}
                      })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="document">Document</option>
                      <option value="parcel">Parcel</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Weight (kg)</label>
                    <input
                      type="number"
                      min="0.1"
                      step="0.1"
                      value={packageData.package_details.weight}
                      onChange={(e) => setPackageData({
                        ...packageData,
                        package_details: {...packageData.package_details, weight: parseFloat(e.target.value)}
                      })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
                
                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Length (cm)</label>
                    <input
                      type="number"
                      min="1"
                      value={packageData.package_details.length}
                      onChange={(e) => setPackageData({
                        ...packageData,
                        package_details: {...packageData.package_details, length: parseFloat(e.target.value)}
                      })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Width (cm)</label>
                    <input
                      type="number"
                      min="1"
                      value={packageData.package_details.width}
                      onChange={(e) => setPackageData({
                        ...packageData,
                        package_details: {...packageData.package_details, width: parseFloat(e.target.value)}
                      })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Height (cm)</label>
                    <input
                      type="number"
                      min="1"
                      value={packageData.package_details.height}
                      onChange={(e) => setPackageData({
                        ...packageData,
                        package_details: {...packageData.package_details, height: parseFloat(e.target.value)}
                      })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>

                <textarea
                  placeholder="Package Description"
                  value={packageData.package_details.description}
                  onChange={(e) => setPackageData({
                    ...packageData,
                    package_details: {...packageData.package_details, description: e.target.value}
                  })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  rows="3"
                />

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Service Type</label>
                    <select
                      value={packageData.service_type}
                      onChange={(e) => setPackageData({...packageData, service_type: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="standard">Standard (3-5 days)</option>
                      <option value="express">Express (1-2 days)</option>
                      <option value="international">International (7-14 days)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Pickup Date</label>
                    <input
                      type="date"
                      value={packageData.pickup_date}
                      onChange={(e) => setPackageData({...packageData, pickup_date: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>
            )}

            {step === 4 && (
              <div className="space-y-6">
                <h3 className="text-xl font-semibold mb-4">Review & Payment</h3>
                
                {priceEstimate && (
                  <div className="bg-blue-50 p-6 rounded-lg">
                    <h4 className="font-semibold text-lg mb-4">Price Estimate</h4>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-gray-600">Distance: <span className="font-semibold">{priceEstimate.distance_km} km</span></p>
                        <p className="text-gray-600">Weight: <span className="font-semibold">{priceEstimate.weight_kg} kg</span></p>
                        <p className="text-gray-600">Service: <span className="font-semibold capitalize">{priceEstimate.service_type}</span></p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-blue-600">₹{priceEstimate.estimated_price}</p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="bg-gray-50 p-6 rounded-lg">
                  <h4 className="font-semibold text-lg mb-4">Package Summary</h4>
                  <div className="space-y-2 text-sm">
                    <p><span className="font-medium">From:</span> {packageData.sender.name}, {packageData.sender.city}</p>
                    <p><span className="font-medium">To:</span> {packageData.receiver.name}, {packageData.receiver.city}</p>
                    <p><span className="font-medium">Package:</span> {packageData.package_details.type} ({packageData.package_details.weight}kg)</p>
                    <p><span className="font-medium">Service:</span> {packageData.service_type}</p>
                    <p><span className="font-medium">Pickup:</span> {packageData.pickup_date}</p>
                  </div>
                </div>

                <button
                  onClick={createPackage}
                  disabled={isLoading}
                  className="w-full bg-green-600 hover:bg-green-700 text-white py-3 px-6 rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Processing...' : 'Proceed to Payment (Mock)'}
                </button>
              </div>
            )}

            <div className="flex justify-between mt-8">
              <button
                onClick={() => step > 1 ? setStep(step - 1) : setCurrentPage('dashboard')}
                className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                {step === 1 ? 'Cancel' : 'Previous'}
              </button>
              
              {step < 4 && (
                <button
                  onClick={nextStep}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Next
                </button>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    );
  };

  const TrackingPage = () => {
    const [trackingId, setTrackingId] = useState('');
    const [trackingData, setTrackingData] = useState(null);
    const [isTracking, setIsTracking] = useState(false);

    const trackPackage = async () => {
      if (!trackingId) {
        toast.error('Please enter a tracking ID');
        return;
      }

      setIsTracking(true);
      try {
        const response = await fetch(`${API_BASE_URL}/api/packages/track/${trackingId}`);
        const data = await response.json();
        
        if (response.ok) {
          setTrackingData(data);
        } else {
          toast.error(data.detail || 'Package not found');
          setTrackingData(null);
        }
      } catch (error) {
        toast.error('Network error. Please try again.');
      } finally {
        setIsTracking(false);
      }
    };

    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-lg shadow-lg p-8"
          >
            <h1 className="text-3xl font-bold text-gray-900 mb-8">Track Your Package</h1>
            
            <div className="flex flex-col sm:flex-row gap-4 mb-8">
              <input
                type="text"
                placeholder="Enter Tracking ID (e.g., CD123456)"
                value={trackingId}
                onChange={(e) => setTrackingId(e.target.value)}
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <button
                onClick={trackPackage}
                disabled={isTracking}
                className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isTracking ? 'Tracking...' : 'Track Package'}
              </button>
            </div>

            {trackingData && (
              <div className="space-y-6">
                <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-green-800 mb-2">Package Found!</h3>
                  <div className="grid md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <p><span className="font-medium">Tracking ID:</span> {trackingData.package.tracking_id}</p>
                      <p><span className="font-medium">Status:</span> <span className="capitalize">{trackingData.package.status.replace('_', ' ')}</span></p>
                    </div>
                    <div>
                      <p><span className="font-medium">Service:</span> <span className="capitalize">{trackingData.package.service_type}</span></p>
                      <p><span className="font-medium">Price:</span> ₹{trackingData.package.price}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-6">
                  <h4 className="font-semibold text-lg mb-4">Package Details</h4>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h5 className="font-medium text-gray-700 mb-2">From</h5>
                      <p className="text-sm text-gray-600">
                        {trackingData.package.sender.name}<br/>
                        {trackingData.package.sender.address}<br/>
                        {trackingData.package.sender.city}, {trackingData.package.sender.state} {trackingData.package.sender.postal_code}
                      </p>
                    </div>
                    <div>
                      <h5 className="font-medium text-gray-700 mb-2">To</h5>
                      <p className="text-sm text-gray-600">
                        {trackingData.package.receiver.name}<br/>
                        {trackingData.package.receiver.address}<br/>
                        {trackingData.package.receiver.city}, {trackingData.package.receiver.state} {trackingData.package.receiver.postal_code}
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-lg mb-4">Tracking History</h4>
                  <div className="space-y-4">
                    {trackingData.tracking_history.map((event, index) => (
                      <div key={index} className="flex items-start space-x-4">
                        <div className="w-3 h-3 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                        <div className="flex-1">
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                            <div>
                              <p className="font-medium capitalize">{event.status.replace('_', ' ')}</p>
                              <p className="text-sm text-gray-600">{event.location}</p>
                              {event.notes && <p className="text-sm text-gray-500 mt-1">{event.notes}</p>}
                            </div>
                            <p className="text-sm text-gray-500 mt-1 sm:mt-0">
                              {new Date(event.timestamp).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            <div className="mt-8 text-center">
              <button
                onClick={() => setCurrentPage('home')}
                className="text-blue-600 hover:text-blue-500"
              >
                ← Back to Home
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    );
  };

  const DashboardPage = () => {
    const [activeTab, setActiveTab] = useState('packages');
    const [packages, setPackages] = useState([]);
    const [stats, setStats] = useState(null);

    useEffect(() => {
      fetchUserPackages();
      if (user && user.role === 'admin') {
        fetchStats();
      }
    }, [user]);

    const fetchUserPackages = async () => {
      try {
        const token = localStorage.getItem('token');
        const endpoint = user.role === 'admin' ? '/api/admin/packages' : '/api/packages/my-packages';
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        const data = await response.json();
        if (response.ok) {
          setPackages(data.packages);
        }
      } catch (error) {
        toast.error('Failed to fetch packages');
      }
    };

    const fetchStats = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_BASE_URL}/api/admin/stats`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        const data = await response.json();
        if (response.ok) {
          setStats(data);
        }
      } catch (error) {
        console.error('Failed to fetch stats');
      }
    };

    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">
              {user.role === 'admin' ? 'Admin Dashboard' : 
               user.role === 'delivery_agent' ? 'Delivery Dashboard' : 
               'My Dashboard'}
            </h1>
            <p className="text-gray-600 mt-2">Welcome back, {user.name}!</p>
          </div>

          {user.role === 'admin' && stats && (
            <div className="grid md:grid-cols-4 gap-6 mb-8">
              <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex items-center">
                  <Package className="h-8 w-8 text-blue-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Packages</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.total_packages}</p>
                  </div>
                </div>
              </div>
              <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex items-center">
                  <Truck className="h-8 w-8 text-green-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Delivered</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.delivered_packages}</p>
                  </div>
                </div>
              </div>
              <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex items-center">
                  <Clock className="h-8 w-8 text-yellow-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Pending</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.pending_packages}</p>
                  </div>
                </div>
              </div>
              <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex items-center">
                  <Users className="h-8 w-8 text-purple-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Users</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.total_users}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="bg-white rounded-lg shadow">
            <div className="border-b border-gray-200">
              <nav className="flex space-x-8 px-6">
                <button
                  onClick={() => setActiveTab('packages')}
                  className={`py-4 border-b-2 font-medium text-sm ${
                    activeTab === 'packages' 
                      ? 'border-blue-500 text-blue-600' 
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {user.role === 'customer' ? 'My Packages' : 'All Packages'}
                </button>
                {user.role === 'customer' && (
                  <button
                    onClick={() => setCurrentPage('send-package')}
                    className="py-4 text-sm font-medium text-blue-600 hover:text-blue-700 flex items-center"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Send New Package
                  </button>
                )}
              </nav>
            </div>

            <div className="p-6">
              {packages.length === 0 ? (
                <div className="text-center py-12">
                  <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No packages found</p>
                  {user.role === 'customer' && (
                    <button
                      onClick={() => setCurrentPage('send-package')}
                      className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg"
                    >
                      Send Your First Package
                    </button>
                  )}
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Tracking ID
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          From → To
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Service
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Price
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {packages.map((pkg) => (
                        <tr key={pkg.package_id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {pkg.tracking_id}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {pkg.sender.city} → {pkg.receiver.city}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              pkg.status === 'delivered' ? 'bg-green-100 text-green-800' :
                              pkg.status === 'in_transit' ? 'bg-blue-100 text-blue-800' :
                              pkg.status === 'picked_up' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {pkg.status.replace('_', ' ').charAt(0).toUpperCase() + pkg.status.replace('_', ' ').slice(1)}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">
                            {pkg.service_type}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            ₹{pkg.price}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <button 
                              onClick={() => {
                                setCurrentPage('tracking');
                                // You could also pass the tracking ID to auto-fill
                              }}
                              className="text-blue-600 hover:text-blue-900 mr-4"
                            >
                              <Eye className="h-4 w-4 inline mr-1" />
                              Track
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          <div className="mt-8 text-center">
            <button
              onClick={() => setCurrentPage('home')}
              className="text-blue-600 hover:text-blue-500"
            >
              ← Back to Home
            </button>
          </div>
        </div>
      </div>
    );
  };

  const PricingPage = () => (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Transparent Pricing</h1>
          <p className="text-xl text-gray-600">Simple, fair pricing with no hidden fees</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-12">
          {[
            {
              name: "Standard",
              price: "₹100",
              duration: "3-5 Business Days",
              features: ["Door-to-door pickup", "Basic tracking", "Insurance up to ₹5,000", "Email notifications"]
            },
            {
              name: "Express",
              price: "₹150",
              duration: "1-2 Business Days",
              features: ["Priority handling", "Real-time tracking", "Insurance up to ₹10,000", "SMS + Email alerts", "Express lanes"],
              popular: true
            },
            {
              name: "International",
              price: "₹250",
              duration: "7-14 Business Days",
              features: ["Global delivery", "Customs handling", "Full tracking", "Insurance up to ₹25,000", "Priority support"]
            }
          ].map((plan, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`bg-white rounded-lg shadow-lg p-8 relative ${
                plan.popular ? 'ring-2 ring-blue-500' : ''
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-blue-500 text-white px-4 py-1 rounded-full text-sm font-medium">
                    Most Popular
                  </span>
                </div>
              )}
              
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                <div className="text-4xl font-bold text-blue-600 mb-2">{plan.price}</div>
                <p className="text-gray-600">Base price + weight & distance</p>
                <p className="text-sm text-gray-500 mt-2">{plan.duration}</p>
              </div>
              
              <ul className="space-y-3 mb-8">
                {plan.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-center">
                    <Package className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                    <span className="text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>
              
              <button
                onClick={() => setCurrentPage(user ? 'send-package' : 'auth')}
                className={`w-full py-3 px-4 rounded-lg font-semibold transition-colors ${
                  plan.popular
                    ? 'bg-blue-600 hover:bg-blue-700 text-white'
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-800'
                }`}
              >
                Choose {plan.name}
              </button>
            </motion.div>
          ))}
        </div>

        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-6">Pricing Calculator</h3>
          <div className="text-gray-600 space-y-2">
            <p><strong>Base Price:</strong> Starts from the service tier you choose</p>
            <p><strong>Weight:</strong> ₹20 per kg (minimum 0.5kg)</p>
            <p><strong>Distance:</strong> ₹2 per km</p>
            <p><strong>Service Multiplier:</strong> Standard (1x), Express (1.5x), International (2.5x)</p>
          </div>
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <p className="text-blue-800 font-medium">
              Example: 2kg package from Mumbai to Delhi (1400km) via Express = 
              (₹150 + ₹40 + ₹2800) × 1.5 = ₹4,485
            </p>
          </div>
        </div>

        <div className="text-center">
          <button
            onClick={() => setCurrentPage('home')}
            className="text-blue-600 hover:text-blue-500"
          >
            ← Back to Home
          </button>
        </div>
      </div>
    </div>
  );

  // Main render logic
  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <HomePage />;
      case 'auth':
        return <AuthPage />;
      case 'send-package':
        return user ? <SendPackagePage /> : <AuthPage />;
      case 'tracking':
        return <TrackingPage />;
      case 'dashboard':
        return user ? <DashboardPage /> : <AuthPage />;
      case 'pricing':
        return <PricingPage />;
      default:
        return <HomePage />;
    }
  };

  return (
    <div className="App">
      <Toaster position="top-right" />
      {renderPage()}
    </div>
  );
};

export default App;