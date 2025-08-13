import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { salaryCodeSchema, SalaryCodeFormSchema } from '@/lib/validations/salary-code';
import { STATES, RANKS } from '@/types/salary-code';
import { salaryCodesService } from '@/lib/salary-codes-service';
// import { testBackendConnection, addTestButton } from '@/utils/test-backend';

const SalaryCodeForm: React.FC = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState<{ type: 'success' | 'error', message: string } | null>(null);

  // Add test button for debugging
  // useEffect(() => {
  //   addTestButton();
  // }, []);

  const { register, handleSubmit, formState: { errors }, reset } = useForm<SalaryCodeFormSchema>({
    resolver: zodResolver(salaryCodeSchema),
    defaultValues: {
      siteName: '',
      rank: '',
      stateName: '',
      wages: 0
    }
  });

  const onSubmit = async (data: SalaryCodeFormSchema) => {
    setIsSubmitting(true);
    setSubmitMessage(null);

    try {
      // console.log('🚀 Submitting salary code data:', data);

      // First test backend connection
      // console.log('🧪 Testing backend connection before submission...');
      // const connectionTest = await testBackendConnection();

      // if (!connectionTest) {
      //   throw new Error('Backend connection test failed. Please make sure the backend server is running on http://localhost:5000');
      // }

      // Transform data to match backend API
      const salaryCodeData = {
        site_name: data.siteName,
        rank: data.rank,
        state: data.stateName,
        base_wage: data.wages,
        created_by: 'admin' // Default value, could be from auth context
      };

      // console.log('📤 Sending data to backend:', salaryCodeData);

      // Try direct fetch first to see if it works
      // console.log('🧪 Testing direct fetch...');
      // try {
      //   const directResponse = await fetch('http://localhost:5000/api/salary-codes', {
      //     method: 'POST',
      //     headers: {
      //       'Content-Type': 'application/json',
      //     },
      //     body: JSON.stringify(salaryCodeData)
      //   });
      //   console.log('Direct fetch status:', directResponse.status);
      //   if (directResponse.ok) {
      //     const directData = await directResponse.json();
      //     console.log('Direct fetch success:', directData);
      //
      //     setSubmitMessage({
      //       type: 'success',
      //       message: `Salary code created successfully! Code: ${directData.data.salary_code}`
      //     });
      //     reset();
      //     return;
      //   } else {
      //     const errorText = await directResponse.text();
      //     console.log('Direct fetch error:', errorText);
      //   }
      // } catch (directError) {
      //   console.error('Direct fetch failed:', directError);
      // }

      // Create salary code using service
      const result = await salaryCodesService.createSalaryCode(salaryCodeData);
      // console.log('✅ Backend response:', result);

      setSubmitMessage({
        type: 'success',
        message: `Salary code created successfully! Code: ${result.salary_code}`
      });

      reset(); // Reset form after successful submission

    } catch (error: any) {
      // console.error('❌ Error creating salary code:', error);

      let errorMessage = 'Failed to create salary code';

      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message?.includes('Network Error')) {
        errorMessage = 'Network Error: Please make sure the backend server is running on http://localhost:5000';
      } else if (error.message) {
        errorMessage = error.message;
      }

      setSubmitMessage({
        type: 'error',
        message: errorMessage
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white shadow-lg rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-800">Generate Salary Code</h2>
          <p className="text-gray-600 mt-1">Create a new salary code based on site, rank, and state</p>
        </div>

        {submitMessage && (
          <div className={`mx-6 mt-4 p-4 rounded-md ${
            submitMessage.type === 'success' 
              ? 'bg-green-50 border border-green-200 text-green-800' 
              : 'bg-red-50 border border-red-200 text-red-800'
          }`}>
            {submitMessage.message}
          </div>
        )}
        
        <form onSubmit={handleSubmit(onSubmit)} className="p-6">
          <div className="bg-gray-50 p-6 rounded-lg">
            <h3 className="text-xl font-semibold text-gray-700 mb-4">Salary Code Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Site Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Site Name *
                </label>
                <input
                  {...register('siteName')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter site name"
                />
                {errors.siteName && (
                  <p className="text-red-500 text-xs mt-1">{errors.siteName.message}</p>
                )}
              </div>

              {/* Rank */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Rank *
                </label>
                <select
                  {...register('rank')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Rank</option>
                  {RANKS.map(rank => (
                    <option key={rank} value={rank}>{rank}</option>
                  ))}
                </select>
                {errors.rank && (
                  <p className="text-red-500 text-xs mt-1">{errors.rank.message}</p>
                )}
              </div>

              {/* State Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  State Name *
                </label>
                <select
                  {...register('stateName')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select State</option>
                  {STATES.map(state => (
                    <option key={state} value={state}>{state}</option>
                  ))}
                </select>
                {errors.stateName && (
                  <p className="text-red-500 text-xs mt-1">{errors.stateName.message}</p>
                )}
              </div>

              {/* Wages */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Wages (₹) *
                </label>
                <input
                  {...register('wages', { valueAsNumber: true })}
                  type="number"
                  min="1"
                  step="0.01"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter wages amount"
                />
                {errors.wages && (
                  <p className="text-red-500 text-xs mt-1">{errors.wages.message}</p>
                )}
              </div>

            </div>
          </div>

          {/* Submit Button */}
          <div className="mt-8 flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => {
                reset();
                setSubmitMessage(null);
              }}
              className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isSubmitting}
            >
              Reset
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Creating...' : 'Create Salary Code'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SalaryCodeForm;
