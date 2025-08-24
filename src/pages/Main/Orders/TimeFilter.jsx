import { ArrowRight } from "lucide-react";

const TimeFilter = ({
  selectedOption,
  options = [
    { value: 'today', label: '今天' },
    { value: 'week', label: '近一周' },
    { value: 'month', label: '近30天' }
  ],
  onChange
}) => {
  const config = {
    today: {
      baseColor: 'from-blue-600 to-blue-400 shadow-blue-300/50 hover:shadow-blue-400/60',
      divColor: 'from-blue-700 to-blue-500',
    },
    week: {
      baseColor: 'from-purple-600 to-purple-400 shadow-purple-300/50 hover:shadow-purple-400/60',
      divColor: 'from-purple-700 to-purple-500',
    },
    month: {
      baseColor: 'from-emerald-600 to-emerald-400 shadow-emerald-300/50 hover:shadow-emerald-400/60',
      divColor: 'from-emerald-700 to-emerald-500',
    }
  };

  return (
    <div className="ml-[8px] mt-[30px] flex flex-col">
      {options.map((option) => (
        <button
          key={option.value}
          className={`
            ${config[option.value].baseColor}
            ${selectedOption === option.value ? 'scale-105 ring-2 ring-white translate-x-[8px]' : 'hover:scale-105 active:scale-95'}
            w-[200px] mt-[8px] h-[55px] text-[20px]
            justify-center items-center
            group flex px-4 py-3 bg-gradient-to-r text-white font-semibold text-sm rounded-xl shadow-lg hover:shadow-xl transform transition-all duration-300 ease-out`}
          onClick={() => onChange(option.value)}
        >
          <span className="relative z-10">{option.label}</span>
          {selectedOption === option.value && (
            <ArrowRight className="ml-2 h-[30px] w-[30px] relative z-20 transition-all duration-500" />
          )}
          <div className={`${config[option.value].divColor} absolute inset-0 bg-gradient-to-r rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-0`}></div>
        </button>
      ))}
    </div>
  );
};

export default TimeFilter;