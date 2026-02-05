import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { Gamepad2, Globe } from 'lucide-react';
import api from '../../lib/axios';

export default function GameProviderForm() {
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm();

  const onSubmit = async (data) => {
    try {
      await api.post('/game-providers', data);
      toast.success(`Provider "${data.provider_name}" registered!`);
      reset();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to register provider');
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <header className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Gamepad2 className="text-purple-600" />
          Register Game Provider
        </h1>
        <p className="text-gray-500 mt-2">Onboard a new game provider to the platform.</p>
      </header>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Provider Name</label>
            <input
              {...register('provider_name', { required: 'Name is required' })}
              className="block w-full rounded-lg border-gray-300 border p-2.5 focus:ring-purple-500 focus:border-purple-500"
              placeholder="e.g. Evolution Gaming"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Website</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Globe className="h-5 w-5 text-gray-400" />
              </div>
              <input
                {...register('website')}
                className="pl-10 block w-full rounded-lg border-gray-300 border p-2.5 focus:ring-purple-500"
                placeholder="https://evolution.com"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Contact Email</label>
            <input
              {...register('email', { required: 'Email is required' })}
              type="email"
              className="block w-full rounded-lg border-gray-300 border p-2.5 focus:ring-purple-500"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Password</label>
            <input
              {...register('password', { required: true, minLength: 8 })}
              type="password"
              className="block w-full rounded-lg border-gray-300 border p-2.5 focus:ring-purple-500"
            />
            {errors.password && <p className="text-red-500 text-xs mt-1">Min 8 characters required</p>}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-purple-600 text-white py-2.5 rounded-lg hover:bg-purple-700 font-medium disabled:opacity-50"
          >
            {isSubmitting ? 'Registering...' : 'Register Provider'}
          </button>
        </form>
      </div>
    </div>
  );
}