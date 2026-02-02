import { Link } from "react-router-dom";
import { motion } from "framer-motion";

export default function Hero() {
  return (
    <div
  dir="rtl"
  className="relative min-h-screen flex flex-col items-center justify-center px-6 text-[#111111]
             bg-white overflow-hidden text-center"
>
  {/* ✨ خلفية توهج ناعم */}
  <div className="absolute inset-0 overflow-hidden">
    <div className="absolute w-[600px] h-[600px] bg-[#f2c744]/30 rounded-full blur-3xl -top-40 -right-60 animate-pulse" />
    <div className="absolute w-[400px] h-[400px] bg-[#2f80ff]/20 rounded-full blur-3xl -bottom-60 -left-40 animate-pulse" />
  </div>

  {/* 🌌 خلفية زخرفية */}
  <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(0,0,0,0.03),transparent_60%)]"></div>

  {/* 🟦 العنوان */}
  <motion.h1
    initial={{ opacity: 0, y: 40 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 1 }}
    className="relative z-10 text-6xl sm:text-7xl font-extrabold tracking-wide 
               text-[#111111]"
  >
    مكتبة أثر
  </motion.h1>

  {/* 🌈 خط */}
  <motion.div
    initial={{ opacity: 0, scale: 0.8 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ delay: 0.8, duration: 0.6 }}
    className="relative z-10 w-28 h-[2px] bg-[#111111]/40 my-6"
  ></motion.div>

  {/* 🕊️ عن روح ليث */}
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 1, duration: 0.8 }}
    className="relative z-10 mb-6 space-y-1"
  >
    <p className="text-[#444] text-base">
      هذه المكتبة الإلكترونية البسيطة هي عن روح زميلنا{" "}
      <span className="text-[#2f80ff] font-semibold">ليث حمّاد ... </span>
    </p>
    <p className="text-[#2f80ff] text-sm font-medium">
      الذي علّمنا أن الإرادة تصنع المستحيل 🤍
    </p>
  </motion.div>

  {/* 📝 وصف */}
  <motion.p
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 1.3, duration: 0.8 }}
    className="relative z-10 text-lg sm:text-xl text-[#555] leading-relaxed max-w-3xl mb-10"
  >
    صُمِّمت هذه المكتبة لتسهيل وصولكم إلى موادكم ومراجعكم الدراسية، 
    بأسلوب بسيط ومنظم، وبهدف أن يكون الأثر علمًا يُنتفع به.
  </motion.p>

  {/* 📚 الأزرار */}
  <motion.div
    initial={{ opacity: 0, y: 30 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 1.6, duration: 0.8 }}
    className="relative z-10 flex flex-col sm:flex-row justify-center gap-6"
  >
    <Link
      to="/mandatory"
      className="inline-block font-semibold text-lg px-10 py-3 rounded-full 
                 bg-[#2f80ff] text-white transition-all duration-300 
                 hover:bg-[#1f6fe0] hover:scale-105 shadow-md"
    >
      المواد الإجبارية
    </Link>

    <Link
      to="/others"
      className="inline-block font-semibold text-lg px-10 py-3 rounded-full 
                 border border-[#111] text-[#111] transition-all duration-300 
                 hover:bg-[#111] hover:text-white hover:scale-105 shadow-md"
    >
      مواد أخرى
    </Link>

   
  </motion.div>

  {/* 🪶 العبارة الختامية */}
  <motion.p
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ delay: 2.2, duration: 0.8 }}
    className="relative z-10 text-xs text-[#777] mt-16"
  >
    © 2025 - مكتبة أثر
  </motion.p>
</div>

  );
}
