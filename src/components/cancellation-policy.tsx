"use client";

interface CancellationPolicyProps {
  onAccept: () => void;
  onCancel: () => void;
  rideDateTime: string;
}

export function CancellationPolicy({ onAccept, onCancel, rideDateTime }: CancellationPolicyProps) {
  const rideDate = new Date(rideDateTime);
  const now = new Date();
  const hoursUntilRide = Math.floor((rideDate.getTime() - now.getTime()) / (1000 * 60 * 60));

  return (
    <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center">
          <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h3 className="font-semibold text-gray-900">Cancellation Policy</h3>
      </div>

      <div className="space-y-3 mb-6">
        <p className="text-sm text-gray-600">
          If you need to cancel your booking, the driver will receive a portion of your payment based on how much notice you give:
        </p>
        
        <div className="bg-gray-50 rounded-xl p-4 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-700">72+ hours before ride:</span>
            <span className="text-sm font-semibold text-gray-900">Driver receives 10%</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-700">48-72 hours before ride:</span>
            <span className="text-sm font-semibold text-gray-900">Driver receives 25%</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-700">24-48 hours before ride:</span>
            <span className="text-sm font-semibold text-gray-900">Driver receives 50%</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-700">Less than 24 hours:</span>
            <span className="text-sm font-semibold text-gray-900">Driver receives 100%</span>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-xl p-3">
          <p className="text-xs text-blue-700">
            <span className="font-medium">Note:</span> The driver can choose to waive the cancellation fee if you have a valid reason. 
            Contact them through the ride chat to discuss.
          </p>
        </div>
      </div>

      <div className="flex gap-3">
        <button
          onClick={onCancel}
          className="flex-1 px-4 py-3 border border-gray-200 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors cursor-pointer"
        >
          Cancel
        </button>
        <button
          onClick={onAccept}
          className="flex-1 px-4 py-3 bg-purple-600 text-white font-medium rounded-xl hover:bg-purple-700 transition-colors cursor-pointer"
        >
          I Understand, Continue
        </button>
      </div>
    </div>
  );
}




