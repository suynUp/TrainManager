import { TrainFront } from "lucide-react"
export default ({ title,onClick }) => {
    return (
      <div 
        className={`flex items-center justify-center h-[35px] pt-1 pb-1 pr-3 pl-1 border border-sky-200 bg-sky-500 border-2 rounded-[15px] m-[5px] text-[15px] text-white
            cursor-pointer shadow-xl
            hover:bg-white hover:text-sky-500 hover:shadow-lg 
            transition:all duration-500
            transform hover:scale-105 active:scale-95`}
        onClick={() => { 
            onClick()
        }}
      >
        <TrainFront className="h-[17px]"></TrainFront>
        {title}
      </div>
    )
  }