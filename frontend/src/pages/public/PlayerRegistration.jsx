import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { useNavigate, Link } from 'react-router-dom';
import { MapPin, Building, ChevronRight } from 'lucide-react';
import api from '../../lib/axios';

// Mock list of supported countries (You can fetch this from API if available)
const COUNTRIES = [
  { code: 'US', name: 'United States' },
  { code: 'GB', name: 'United Kingdom' },
  { code: 'IN', name: 'India' },
  { code: 'DE', name: 'Germany' },
];

export default function PlayerRegistration() {
  const [step, setStep] = useState(1); // 1: Country, 2: Tenant, 3: Details
  const [selectedCountry, setSelectedCountry] = useState('');
  const [availableTenants, setAvailableTenants] = useState([]);
  const [selectedTenant, setSelectedTenant] = useState(null);
  
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm();

  // Step 1 -> 2: Fetch Tenants
  const handleCountrySelect = async (countryCode) => {
    setSelectedCountry(countryCode);
    try {
      // Endpoint from your tenants.py: router.get("/by-country/{country_code}")
      const response = await api.get(`/tenants/by-country/${countryCode}`);
      setAvailableTenants(response.data);
      if (response.data.length === 0) {
        toast.error("No casinos operate in this country yet.");
      } else {
        setStep(2);
      }
    } catch (error) {
      toast.error("Failed to load casinos.");
    }
  };

  // Step 2 -> 3: Select Tenant
  const handleTenantSelect = (tenant) => {
    setSelectedTenant(tenant);
    setStep(3);
  };

  // Step 3: Final Submit
  const onSubmit = async (data) => {
    const payload = {
      tenant_id: selectedTenant.tenant_id,
      country_code: selectedCountry,
      email: data.email,
      password: data.password
    };

    try {
      // --- FIX IS HERE: Added '/register' to match your backend ---
      await api.post('/players/register', payload); 
      
      toast.success('Registration successful! Please login.');
      navigate('/login');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Registration failed');
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-600 to-teal-600 p-6 text-center text-white">
          <h1 className="text-2xl font-bold uppercase tracking-wider">Join The Action</h1>
          <p className="opacity-90 text-sm mt-1">Player Registration • Step {step} of 3</p>
        </div>

        <div className="p-6">
          {/* STEP 1: Select Country */}
          {step === 1 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                <MapPin className="mr-2 text-emerald-600" /> Select your location
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {COUNTRIES.map((c) => (
                  <button
                    key={c.code}
                    onClick={() => handleCountrySelect(c.code)}
                    className="p-3 border rounded-lg hover:border-emerald-500 hover:bg-emerald-50 transition-all text-left"
                  >
                    <span className="font-bold block text-gray-700">{c.code}</span>
                    <span className="text-sm text-gray-500">{c.name}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* STEP 2: Select Tenant */}
          {step === 2 && (
            <div className="space-y-4">
              <button onClick={() => setStep(1)} className="text-sm text-gray-500 hover:underline mb-2">
                &larr; Back to Country
              </button>
              <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                <Building className="mr-2 text-emerald-600" /> Select a Casino
              </h3>
              <div className="space-y-2">
                {availableTenants.map((t) => (
                  <button
                    key={t.tenant_id}
                    onClick={() => handleTenantSelect(t)}
                    className="w-full flex items-center justify-between p-4 border rounded-lg hover:border-emerald-500 hover:shadow-md transition-all group"
                  >
                    <div className="text-left">
                      <span className="font-bold text-gray-800 block">{t.tenant_name}</span>
                      <span className="text-xs text-gray-500">{t.domain}</span>
                    </div>
                    <ChevronRight className="text-gray-300 group-hover:text-emerald-500" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* STEP 3: Form */}
          {step === 3 && (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <button onClick={() => setStep(2)} type="button" className="text-sm text-gray-500 hover:underline">
                &larr; Back to Casinos
              </button>
              
              <div className="bg-gray-50 p-3 rounded-lg border border-gray-200 text-sm">
                <p><strong>Casino:</strong> {selectedTenant.tenant_name}</p>
                <p><strong>Country:</strong> {selectedCountry}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  {...register('email', { 
                    required: 'Email is required',
                    validate: value => value.endsWith(selectedTenant.domain) || `Email must end with @${selectedTenant.domain}`
                  })}
                  type="email"
                  className="block w-full rounded-lg border-gray-300 border p-2.5 focus:ring-emerald-500 focus:border-emerald-500"
                  placeholder={`user@${selectedTenant.domain}`}
                />
                {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <input
                  {...register('password', { required: 'Password is required', minLength: { value: 8, message: 'Min 8 chars' } })}
                  type="password"
                  className="block w-full rounded-lg border-gray-300 border p-2.5 focus:ring-emerald-500 focus:border-emerald-500"
                />
                {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex items-center justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-50"
              >
                {isSubmitting ? 'Creating Account...' : 'Register'}
              </button>
            </form>
          )}
        </div>
        
        <div className="bg-gray-50 p-4 text-center border-t border-gray-100">
          <p className="text-sm text-gray-600">
            Already have an account? <Link to="/login" className="text-emerald-600 font-medium hover:underline">Log in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}