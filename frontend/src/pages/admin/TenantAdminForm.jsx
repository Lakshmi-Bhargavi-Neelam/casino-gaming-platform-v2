import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { UserCog, Building, Loader2 } from 'lucide-react';
import api from '../../lib/axios';

export default function TenantAdminForm() {
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm();
  const [tenants, setTenants] = useState([]);
  const [fetchingTenants, setFetchingTenants] = useState(true);

  // Fetch tenants on component load
  useEffect(() => {
    const fetchTenants = async () => {
      try {
        const response = await api.get('/tenants'); // Adjust path to your tenants endpoint
        setTenants(response.data);
      } catch (error) {
        toast.error("Failed to load tenants list");
      } finally {
        setFetchingTenants(false);
      }
    };
    fetchTenants();
  }, []);

  const onSubmit = async (data) => {
    try {
      await api.post('/tenant-admins', data);
      toast.success(`Admin "${data.admin_username}" created successfully!`);
      reset();
    } catch (error) {
      const detail = error.response?.data?.detail;
      if (Array.isArray(detail)) {
        toast.error(detail[0]?.msg || 'Validation error');
      } else {
        toast.error(detail || 'Failed to create tenant admin');
      }
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <header className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <UserCog className="text-indigo-600" />
          Register Tenant Admin
        </h1>
        <p className="text-gray-500 mt-2">Assign an administrator to an existing Tenant.</p>
      </header>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          
          {/* Tenant Selection Dropdown */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Select Tenant</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Building className="h-5 w-5 text-gray-400" />
              </div>
              <select
                {...register('tenant_id', { required: 'Please select a tenant' })}
                disabled={fetchingTenants}
                className="pl-10 block w-full rounded-lg border-gray-300 border p-2.5 focus:ring-indigo-500 focus:border-indigo-500 bg-white appearance-none"
              >
                <option value="">{fetchingTenants ? "Loading tenants..." : "--- Choose a Tenant ---"}</option>
                {tenants.map((tenant) => (
                  <option key={tenant.tenant_id} value={tenant.tenant_id}>
                    {tenant.name} ({tenant.domain})
                  </option>
                ))}
              </select>
              {fetchingTenants && (
                <div className="absolute inset-y-0 right-0 pr-8 flex items-center pointer-events-none">
                  <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
                </div>
              )}
            </div>
            {errors.tenant_id && <p className="text-red-500 text-xs mt-1">{errors.tenant_id.message}</p>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">First Name</label>
              <input
                {...register('first_name', { required: 'First name is required' })}
                className="block w-full rounded-lg border-gray-300 border p-2.5 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Last Name</label>
              <input
                {...register('last_name', { required: 'Last name is required' })}
                className="block w-full rounded-lg border-gray-300 border p-2.5 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Admin Username</label>
            <input
              {...register('admin_username', { required: 'Username is required' })}
              type="text"
              className="block w-full rounded-lg border-gray-300 border p-2.5 focus:ring-indigo-500"
              placeholder="e.g. jdoe_admin"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Password</label>
            <input
              {...register('password', { 
                required: 'Password is required', 
                minLength: { value: 8, message: 'Min 8 characters required' } 
              })}
              type="password"
              className="block w-full rounded-lg border-gray-300 border p-2.5 focus:ring-indigo-500"
            />
            {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
          </div>

          <button
            type="submit"
            disabled={isSubmitting || fetchingTenants}
            className="w-full bg-indigo-600 text-white py-2.5 rounded-lg hover:bg-indigo-700 font-medium disabled:opacity-50 flex justify-center items-center gap-2"
          >
            {isSubmitting && <Loader2 className="h-5 w-5 animate-spin" />}
            {isSubmitting ? 'Creating Admin...' : 'Create Tenant Admin'}
          </button>
        </form>
      </div>
    </div>
  );
}