import { Link } from "react-router-dom";
import { useState } from "react";

export default function Hero() {
  const [showModal, setShowModal] = useState(false);
  const [activeGroup, setActiveGroup] = useState("");
  const [showPoster, setShowPoster] = useState(false);

  const handleOpenModal = (group) => {
    setActiveGroup(group);
    setShowModal(true);
  };

  const groupInfo = {
    needs: {
      title: "أصدقاء ذوي الاحتياجات الخاصة",
      description:
        "مجموعة بتدعم الطلاب ذوي الاحتياجات الخاصة بأي مساعدة بيحتاجوها، سواء أكاديميًا أو بأي جانب ثاني. إذا بتحب تكون سبب خير وتدعم زملاءك، مكانك معنا 💙",
      link: "https://chat.whatsapp.com/K8r8ewZQkuR2DzKEYFvsoU?mode=r_t",
      buttonText: "الانضمام إلى المجموعة",
    },
    goodness: {
      title: "من هم للخير ساعون",
      description:
        "مجموعة تطوعية هدفها نشر الخير والمساعدة داخل الجامعة، من خلال دعم الزملاء وتقديم المبادرات الخيرية. وجودك معنا هو خطوة لبصمة جميلة 🌟",
      link: "https://www.facebook.com/groups/2352165261734115/",
      buttonText: "كن جزءًا من الخير",
    },
    lahn: {
      title: "مجموعة لحن",
      description:
        "مجموعة شبابية تطوعية تهدف لإسعاد الآخرين ورسم البسمة على وجوههم، وأن تكون عونًا بإذن الله للأطفال الأيتام والمحرومين.",
      link: "https://www.facebook.com/profile.php?id=100070275111033",
      buttonText: "كن جزءًا من الخير",
    },
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center px-4" dir="rtl">
      {/* خلفية فيديو */}
      <video
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        className="fixed inset-0 z-0 w-full h-full object-cover"
        aria-hidden="true"
      >
        <source src={process.env.PUBLIC_URL + "/videos/elec-bg.mp4"} type="video/mp4" />
      </video>

      {/* طبقة فوق الفيديو (خفيفة جدًا حالياً) */}
      <div className="fixed inset-0 z-[1] bg-transparent backdrop-blur-none" />

      {/* المحتوى */}
      <div className="relative z-10 w-full max-w-3xl">
        {/* كرت أسود فاتح + برتقالي غامق */}
        <div className="bg-gradient-to-br from-neutral-800 to-neutral-900 text-white rounded-2xl shadow-2xl w-full px-10 py-14 space-y-8 text-center border border-white/10 backdrop-blur-lg">
          
          {/* عنوان بارز أول سطر */}
          <h1 className="text-4xl md:text-4xl font-extrabold leading-tight tracking-tight drop-shadow">
            <span className="text-orange-400">ElecLib</span>
<span
  className="
    relative
    text-transparent bg-clip-text
    bg-gradient-to-r from-white via-white to-orange-200
    font-extrabold
    drop-shadow-[0_4px_14px_rgba(251,146,60,0.35)]
    after:content-[''] after:absolute after:inset-x-0 after:-bottom-1.5 after:h-[3px]
    after:bg-gradient-to-r after:from-orange-400/0 after:via-orange-400/70 after:to-orange-400/0
    after:rounded-full
  "
>
  – مكتبة الهندسة الكهربائية
</span>
          </h1>

          {/* وصف */}
          <p className="text-lg md:text-xl text-slate-200/90 leading-relaxed">
            مكتبة إلكترونية لطلاب الهندسة الكهربائية، تم إعدادها بواسطة طلاب وخريجي التخصص.
          </p>
          <p className="text-lg md:text-xl text-slate-200/90 leading-relaxed">
            تضم فورمات، تلاخيص، محاضرات، وبروجكتات سابقة لمواد التخصص، مع العمل المستمر على إضافة باقي المواد تدريجيًا.
          </p>

          {/* روابط رئيسية */}
          <div className="flex flex-col sm:flex-row justify-center gap-3">
           <Link
  to="/subjects"
  className="inline-block bg-orange-400 hover:bg-orange-500 text-white font-semibold py-2.5 px-8 rounded-full shadow-lg text-base transition-transform duration-150 hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-orange-400/70 focus:ring-offset-2 focus:ring-offset-neutral-900"
>
  Courses
</Link>

<Link
  to="/labs"
  className="inline-block bg-orange-400 hover:bg-orange-500 text-white font-semibold py-2.5 px-8 rounded-full shadow-lg text-base transition-transform duration-150 hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-orange-400/70 focus:ring-offset-2 focus:ring-offset-neutral-900"
>
  Labs
</Link>

          </div>

          {/* مجموعات الخير — كل زر بدرجة مختلفة من البرتقالي */}
          <div className="relative z-10 mt-12">
            <h2 className="text-lg font-bold text-white mb-4 text-center border-b border-white/10 pb-2 w-fit mx-auto">
              مجموعات الخير
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 px-2 sm:px-0">
              {/* needs — orange-400 */}
              <button
                onClick={() => handleOpenModal("needs")}
                className="bg-[#fb923c] hover:bg-[#f97316] text-white text-center rounded-md py-2 px-3 shadow-sm border border-orange-300/50 transition text-xs"
              >
                أصدقاء ذوي الاحتياجات الخاصة
              </button>

              {/* lahn — orange-300 (أفتح) */}
              <button
                onClick={() => handleOpenModal("lahn")}
                className="bg-[#fdba74] hover:bg-[#fb923c] text-slate-900 text-center rounded-md py-2 px-3 shadow-sm border border-orange-300/60 transition text-xs"
              >
                مجموعة لحن
              </button>

              {/* goodness — orange-500 (أغمق) */}
              <button
                onClick={() => handleOpenModal("goodness")}
                className="bg-[#f97316] hover:bg-[#ea580c] text-white text-center rounded-md py-2 px-3 shadow-sm border border-orange-400/40 transition text-xs"
              >
                من هم للخير ساعون
              </button>
            </div>
          </div>

          {/* الدعاء — تحت وبالأبيض */}
          <div className="mt-10">
            <p
  className="
    relative mx-auto max-w-2xl
    text-center text-lg md:text-xl font-semibold leading-relaxed
    text-transparent bg-clip-text bg-gradient-to-r from-white via-white to-orange-200
    drop-shadow-[0_4px_14px_rgba(251,146,60,0.35)]
    after:content-[''] after:absolute after:inset-x-0 after:-bottom-2 after:h-[3px]
    after:bg-gradient-to-r after:from-orange-400/0 after:via-orange-400/70 after:to-orange-400/0
    after:rounded-full
  "
>
  اللهم انفعنا بما علَّمتنا، وعلِّمنا ما ينفعنا، وزدنا علمًا.
</p>

          </div>

          {/* الفوتر */}
          <p className="text-xs text-slate-400">© 2025 - ElecLib</p>
        </div>
      </div>

      {/* مودال المجموعة — برتقالي فاتح جدًا */}
      {showModal && activeGroup && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 px-4">
          <div className="bg-orange-50 text-slate-900 rounded-xl shadow-xl p-6 pt-8 relative max-w-sm w-full border border-orange-200">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-2 left-2 text-orange-500 hover:text-orange-600 text-xl font-bold"
              aria-label="إغلاق"
            >
              ✖
            </button>

            <h2 className="text-lg font-extrabold text-orange-600 mb-2">
              {groupInfo[activeGroup].title}
            </h2>
            <p className="text-slate-700">{groupInfo[activeGroup].description}</p>

            <div className="flex flex-col items-center gap-3 mt-5">
              {activeGroup === "needs" && (
                <button
                  onClick={() => setShowPoster(true)}
                  className="w-full bg-orange-100 hover:bg-orange-200 text-orange-800 px-3 py-2 rounded-full transition text-sm border border-orange-200"
                >
                  البوست التعريفي
                </button>
              )}
              <a
                href={groupInfo[activeGroup].link}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full text-white px-3 py-2 rounded-full transition text-center text-sm"
                style={{ backgroundColor: "#fb923c" }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#f97316")}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#fb923c")}
              >
                {groupInfo[activeGroup].buttonText}
              </a>
            </div>
          </div>
        </div>
      )}

      {/* مودال الصورة (بدّلتها؟ لا، أبقيتها داكنة كما هي) */}
      {showPoster && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
          <div className="bg-neutral-900 rounded-xl shadow-2xl overflow-hidden relative max-w-md w-full border border-white/10">
            <button
              onClick={() => setShowPoster(false)}
              className="absolute top-2 left-2 text-white/80 text-xl font-bold hover:text-red-400"
              aria-label="إغلاق"
            >
              ✖
            </button>
            <img
              src="/poster.jpg"
              alt="البوست التعريفي"
              className="w-full h-auto object-cover"
            />
          </div>
        </div>
      )}
    </div>
  );
}
