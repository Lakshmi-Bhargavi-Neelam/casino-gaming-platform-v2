import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { Building2, Globe, CheckCircle } from 'lucide-react';
import api from '../lib/axios';

export default function TenantRegistration() {
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm();

  const onSubmit = async (data) => {
    // Transform comma-separated string to array for API
    const payload = {
      tenant_name: data.tenant_name,
      domain: data.domain,
      allowed_countries: data.allowed_countries
        .split(',')
        .map((code) => code.trim().toUpperCase())
        .filter((code) => code.length > 0)
    };

    try {
      // Matches: POST /api/v1/tenants
      await api.post('/tenants', payload);
      toast.success(`Tenant "${data.tenant_name}" created successfully!`);
      reset(); // Clear form
    } catch (error) {
      const msg = error.response?.data?.detail || 'Failed to register tenant';
      toast.error(msg);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Tenant Registration</h1>
        <p className="text-gray-500 mt-2">Onboard a new operator to the platform.</p>
      </header>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 md:p-8">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Tenant Name */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Tenant Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Building2 className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  {...register('tenant_name', { 
                    required: 'Tenant name is required',
                    minLength: { value: 3, message: 'Minimum 3 characters' }
                  })}
                  type="text"
                  className="pl-10 block w-full rounded-lg border-gray-300 border p-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="e.g. Royal Casino"
                />
              </div>
              {errors.tenant_name && <p className="text-red-500 text-sm mt-1">{errors.tenant_name.message}</p>}
            </div>

            {/* Domain */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Domain URL
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Globe className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  {...register('domain')}
                  type="text"
                  className="pl-10 block w-full rounded-lg border-gray-300 border p-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="e.g. royal-casino.com"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">Optional. Do not include https://</p>
            </div>
          </div>

          {/* Allowed Countries */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Allowed Countries (ISO-2 Codes)
            </label>
            <input
              {...register('allowed_countries', { required: 'At least one country is required' })}
              type="text"
              className="block w-full rounded-lg border-gray-300 border p-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="US, GB, IN, DE"
            />
            <p className="text-xs text-gray-500 mt-1">
              Enter 2-letter country codes separated by commas.
            </p>
            {errors.allowed_countries && <p className="text-red-500 text-sm mt-1">{errors.allowed_countries.message}</p>}
          </div>

          <div className="pt-4 border-t border-gray-100 flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center justify-center px-6 py-2.5 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {isSubmitting ? (
                'Registering...'
              ) : (
                <>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Register Tenant
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}