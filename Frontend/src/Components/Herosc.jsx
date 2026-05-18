
import { Link } from 'react-router-dom'

const Herosc = () => {
  return (
    <div className="bg-linear-to-tr from-[#0D1B17]  to-[#075843] w-full h-190">
        <div className="flex flex-1"> 
        <div className="pt-36 pr-10">
          <p className="text-[#10B77F] rounded-2xl bg-[#10B77F]/30 pr-3 w-40">منصة موثوقة 100%</p>
          <br />
            <div className="flex gap-5"><h1 className="text-6xl font-bold text-white">معاً من أجل </h1><h1 className="text-6xl font-bold text-[#10B77F]">جزائر</h1></div>
            <br />
            <h1 className="text-5xl text-white" >أكثر تكافلاً وإنسانية</h1>
            <br />
            <p className="text-[#D1D5DB] text-xl w-160">منصتك للأعمال الخيرية في الجزائر. نربط المتبرعين بالجمعيات
            الموثوقة لضمان وصول المساعدات لمستحقيها بكل شفافية وأمان.</p>
            <br />
            <div className="flex flex-wrap gap-4">
              <Link to="/campaigns" className="text-white  text-center transition-transform duration-300 bg-[#10B77F] hover:scale-103 h-11 w-28 pr-1 pt-1 rounded-lg text-lg">ابدأ التبرع</Link>
              <Link to="/assoc_sign_up" className="inline-flex items-center justify-center text-white transition-transform duration-300 bg-white/10 hover:bg-white/15 hover:scale-103 h-11 w-36 rounded-lg text-lg border border-white/10">
                إنشاء جمعية
              </Link>
              <Link to="/about_us" className="text-white text-center transition-transform duration-300 bg-gray-500/50 hover:scale-103 h-11 w-28 pr-1 pt-1 rounded-lg text-lg"> كيف نعمل</Link>
            </div>
        </div>

        <div className="w-110 h-100 border border-white/10 mt-35 mr-79 rounded-3xl shadow-[0_0_40px_rgba(31,185,130,0.05)] bg-[#11231e]/60 backdrop-blur-3xl">
          <h1 className="text-xl text-white pr-2 pb-3 pt-6 border-b border-white/15 mr-10 w-90 ">الأثر المباشر</h1>
            <div></div>
            <div></div>
            <div></div>
        </div>
        </div>
            <div className="flex mt-50 bg-[#102720] h-25 gap-80">
                <div className="pr-18 p-4"><h1 className="text-4xl font-bold text-white ">100%</h1><p className="text-[#9CA3AF]">شفافية مالية</p></div>
                <div className="pt-4"><h1 className="text-4xl font-bold pr-5 text-white ">69</h1><p className="text-[#9CA3AF]">ولاية مغطاة</p></div>
                <div className="pt-4"><h1 className="text-4xl pr-5 font-bold text-white ">24/7</h1><p className="text-[#9CA3AF]">دعم للحالات الطارئة</p></div>
                <div className="pt-4"><h1 className="text-4xl pr-5 font-bold text-white ">0%</h1><p className="text-[#9CA3AF]">عمولة المنصة</p></div>
            </div>
    </div>
  )
}

export default Herosc