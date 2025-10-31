'use client';

interface IDCardPreviewProps {
  data: {
    name: string;
    designation: string;
    employee_id: string;
    blood_group: string | null;
    site?: string;
  };
  showSite?: boolean;
}

export default function IDCardPreview({ data, showSite = false }: IDCardPreviewProps) {
  return (
    <div className="w-full px-2 sm:px-4">
      {showSite && data.site && (
        <div className="mb-2 text-xs sm:text-sm text-gray-600 text-center">
          Site: {data.site}
        </div>
      )}

      {/* Card container with CR80 aspect ratio (85.6:53.98 ≈ 1.585:1) */}
      <div
        className="relative bg-white border-[3px] sm:border-4 border-blue-700 rounded-sm overflow-hidden mx-auto shadow-lg"
        style={{
          aspectRatio: '1.585',
          maxWidth: '100%',
          width: '100%',
        }}
      >
        {/* Red Header - 28% of card height */}
        <div className="absolute top-0 left-0 right-0 bg-red-600 flex items-center justify-center"
             style={{ height: '28%' }}>

          {/* Logo - top-left */}
          <div className="absolute left-1 sm:left-2 top-1 sm:top-2 w-8 h-8 sm:w-10 sm:h-10 bg-white rounded overflow-hidden flex items-center justify-center">
            <img
              src="/assets/SSPL.png"
              alt="SSPL Logo"
              className="w-full h-full object-contain"
              onError={(e) => {
                // Fallback to text if image fails to load
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
                const parent = target.parentElement;
                if (parent) {
                  parent.innerHTML = '<span class="text-[8px] sm:text-xs font-bold text-red-600">SSPL</span>';
                }
              }}
            />
          </div>

          {/* Company name - centered */}
          <div className="text-white text-center px-12">
            <div className="font-bold text-[10px] sm:text-xs md:text-sm lg:text-base leading-tight">
              SECURITECH SEVEN PVT LTD
            </div>
          </div>
        </div>

        {/* Main Content Area - starts after header (28%) */}
        <div className="absolute left-0 right-0 flex px-2 sm:px-3"
             style={{ top: '28%', height: '50%' }}>

          {/* Photo Box - LEFT side, 30% of width */}
          <div className="flex-shrink-0" style={{ width: '30%' }}>
            <div className="bg-gray-100 border border-gray-300 h-full flex items-center justify-center">
              <span className="text-gray-500 text-[8px] sm:text-xs font-semibold">PHOTO</span>
            </div>
          </div>

          {/* Employee Details - RIGHT side, 70% of width */}
          <div className="flex-1 ml-2 sm:ml-3 md:ml-4 flex flex-col justify-center space-y-1 sm:space-y-1.5">
            <div className="text-[8px] sm:text-[10px] md:text-xs">
              <span className="font-semibold">Name:</span>
              <span className="ml-1 break-words">{data.name}</span>
            </div>
            <div className="text-[8px] sm:text-[10px] md:text-xs">
              <span className="font-semibold">Rank:</span>
              <span className="ml-1 break-words">{data.designation}</span>
            </div>
            <div className="text-[8px] sm:text-[10px] md:text-xs">
              <span className="font-semibold">ID No:</span>
              <span className="ml-1">{data.employee_id}</span>
            </div>
            <div className="text-[8px] sm:text-[10px] md:text-xs">
              <span className="font-semibold">Blood Group:</span>
              <span className="ml-1">{data.blood_group || '____'}</span>
            </div>
          </div>
        </div>

        {/* Horizontal Separator Line - positioned 2mm below photo box (matches PDF) */}
        <div className="absolute left-0 right-0 border-t border-gray-300"
             style={{ top: 'calc(28% + 50% - 2%)' }}></div>

        {/* Bottom Section - starts below separator line, height is remaining space */}
        <div className="absolute left-0 right-0 bottom-0 flex"
             style={{ top: 'calc(28% + 50% - 2% + 1px)', height: 'calc(22% + 2%)' }}>

          {/* Left Column - 50% width */}
          <div className="w-1/2 border-r border-gray-300 px-1 sm:px-2 py-1 flex flex-col justify-between text-[7px] sm:text-[8px] md:text-[9px]">
            <div className="space-y-0.5">
              <div className="flex items-center">
                <span className="whitespace-nowrap">Date of Issue:</span>
                <span className="flex-1 border-b border-gray-400 ml-1 min-w-[20px]"></span>
              </div>
              <div className="text-[6px] sm:text-[7px]">Signature of the Cardholder:</div>
              <div className="border-b border-gray-400 w-full"></div>
            </div>
            <div className="flex items-center mt-auto">
              <span className="whitespace-nowrap">Valid upto:</span>
              <span className="flex-1 border-b border-gray-400 ml-1 min-w-[20px]"></span>
            </div>
          </div>

          {/* Right Column - 50% width */}
          <div className="w-1/2 px-1 sm:px-2 py-1 flex flex-col justify-between text-[7px] sm:text-[8px] md:text-[9px]">
            <div className="space-y-0.5">
              <div>ID No: {data.employee_id}</div>
              <div className="text-[6px] sm:text-[7px]">Signature of Issuing Authority</div>
              <div className="border-b border-gray-400 w-full"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
