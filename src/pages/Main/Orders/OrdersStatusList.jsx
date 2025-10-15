import { ArrowRight } from "lucide-react" 

const OrdersStatuList = ({
    nowStatus,
    status,
    title,
    onclick
}) => {

    const config = {
        all: {
            baseColor: 'from-blue-600 to-blue-400 shadow-blue-300/50 hover:shadow-blue-400/60',
            divColor: 'from-blue-700 to-blue-500',
        },
        PENDING: {
            baseColor: 'from-amber-500 to-yellow-400 shadow-amber-300/50 hover:shadow-amber-400/60',
            divColor: 'from-amber-600 to-yellow-500',
        },
        PAID: {
            baseColor: 'from-emerald-600 to-emerald-400 shadow-emerald-300/50 hover:shadow-emerald-400/60',
            divColor: 'from-emerald-700 to-emerald-500',
        },
        COMPLETED: {
            baseColor: 'from-green-600 to-green-400 shadow-green-300/50 hover:shadow-green-400/60',
            divColor: 'from-green-700 to-green-500',
        },
        CANCELLED: {
            baseColor: 'from-slate-600 to-slate-400 shadow-slate-300/50 hover:shadow-slate-400/60',
            divColor: 'from-slate-700 to-slate-500',
        }
    }

    // 获取配置，如果状态不存在则使用默认配置
    const getConfig = (status) => {
        return config[status] || {
            baseColor: 'from-gray-600 to-gray-400 shadow-gray-300/50 hover:shadow-gray-400/60',
            divColor: 'from-gray-700 to-gray-500',
        };
    }

    const currentConfig = getConfig(status);

    return (
        <button 
            className={`
                ${currentConfig.baseColor}
                ${nowStatus === status ? 'scale-105 translate-x-[20px]' : 'hover:scale-105 active:scale-95'}
                w-[200px]
                m-[5px]
                justify-between
                group flex px-8 py-4 bg-gradient-to-r text-white font-semibold text-lg rounded-2xl shadow-lg hover:shadow-xl transform transition-all duration-300 ease-out`}
            onClick={onclick}
        >
            <span className="relative z-10 min-w-[80px]">{title}</span>
            <ArrowRight className={`${nowStatus === status ? 'translate-x-[20px]' : ''} relative z-20 transition-all duration-500`} />
            <div className={`${currentConfig.divColor} absolute inset-0 bg-gradient-to-r rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-0`}></div>
        </button>
    )
}

export default OrdersStatuList