import { useState, useRef, useEffect } from 'react';

const CustomSelect = ({ value, onChange, options, placeHolder='请选择' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);


  return (
    <div className="relative" ref={dropdownRef}>
      <div
        className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors bg-white cursor-pointer flex items-center justify-between"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className={value ? 'text-gray-900' : 'text-gray-500'}>
          {value?value : placeHolder}
        </span>
        <svg
          className={`h-4 w-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>

      {isOpen && (
      <div className="absolute z-[99] w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden">
          <div className="max-h-80 overflow-y-auto">
            {options.map((option) => (
              <div
                key={option.value}
                className={`h-[30px] px-4 py-1 cursor-pointer transition-colors ${
                  value === option.value
                    ? 'bg-blue-50 text-blue-700'
                    : 'hover:bg-gray-50 text-gray-900'
                }`}
                onClick={() => {
                  onChange(option.value);
                  setIsOpen(false);
                }}
              >
                <div className="flex items-center">
                  <div className={`w-2 h-2 rounded-full mr-3 flex-shrink-0 ${
                    option.value === options[0].value ? 'bg-green-400' :
                    option.value === options[1].value ? 'bg-yellow-400' :
                    'bg-red-400'
                  }`}></div>
                  <span className="truncate">{option.value}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomSelect;