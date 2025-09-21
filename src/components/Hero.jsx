import { Link } from "react-router-dom";
import { useEffect, useRef, useState } from "react";

function SecureBgVideo({ src }) {
  const hostRef = useRef(null);
  const attachedRef = useRef(false);

  useEffect(() => {
    const host = hostRef.current;
    if (!host || attachedRef.current) return;

    try {
      if (host.__elecShadowAttached) return;
      const shadow = host.attachShadow({ mode: "closed" });
      host.__elecShadowAttached = true;
      attachedRef.current = true;

      const video = document.createElement("video");
      video.autoplay = true;
      video.muted = true;
      video.loop = true;
      video.playsInline = true;
      video.preload = "auto";
      video.setAttribute("aria-hidden", "true");
      video.style.cssText = `
        position: fixed;
        inset: 0;
        width: 100%;
        height: 100%;
        object-fit: cover;
        z-index: -1;
      `;

      const source = document.createElement("source");
      source.src = src;
      source.type = "video/mp4";
      video.appendChild(source);

      const enforceControlsOff = () => { video.controls = false; };
      const interval = setInterval(enforceControlsOff, 1000);

      shadow.appendChild(video);

      return () => clearInterval(interval);
    } catch (err) {
      console.error("SecureBgVideo attachShadow error:", err);
    }
  }, [src]);

  return <div ref={hostRef} className="fixed inset-0 z-0" />;
}

export default function Hero() {
  const [showModal, setShowModal] = useState(false);
  const [activeGroup, setActiveGroup] = useState("");
  const [showPoster, setShowPoster] = useState(false);

  const handleOpenModal = (group) => {
    setActiveGroup(group);
    setShowModal(true);
  };

  useEffect(() => {
    const suspicious = [
      "eleclib:video:play","eleclib:video:pause","eleclib:video:toggle",
      "eleclib:video:mute","eleclib:video:unmute","eleclib:video:toggleMute",
      "eleclib:video:volume","eleclib:video:seek","eleclib:video:skip","eleclib:video:rate"
    ];
    const block = (e) => e.stopImmediatePropagation();
    suspicious.forEach((evt) => window.addEventListener(evt, block, true));
    return () => suspicious.forEach((evt) => window.removeEventListener(evt, block, true));
  }, []);

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
      <SecureBgVideo src={process.env.PUBLIC_URL + "/videos/elec-bg.mp4"} />
      <div className="fixed inset-0 z-[1] bg-transparent backdrop-blur-none" />

      <div className="relative z-10 w-full flex justify-center">
        {/* ✅ قللنا الـ padding والـ space-y بين العناصر */}
        <div className="bg-black/30 sm:bg-gradient-to-br sm:from-neutral-800 sm:to-neutral-900 backdrop-blur-sm sm:backdrop-blur-lg text-white rounded-2xl shadow-2xl w-full max-w-[92%] sm:max-w-3xl px-4 sm:px-8 py-6 sm:py-10 space-y-4 sm:space-y-6 text-center border border-white/10">
          <h1 className="relative text-4xl sm:text-5xl font-extrabold text-orange-400 mt-2">
            <span className="relative z-10">ElecLib</span>
            <span className="absolute inset-0 z-0 text-orange-300 animate-glitch translate-x-[2px]">ElecLib</span>
            <span className="absolute inset-0 z-0 text-rose-400 animate-glitch -translate-x-[2px]">ElecLib</span>
          </h1>

          <span className="relative text-transparent bg-clip-text bg-gradient-to-r from-white via-white to-orange-200 font-extrabold drop-shadow-[0_4px_14px_rgba(251,146,60,0.35)]
          after:content-[''] after:absolute after:inset-x-0 after:-bottom-1 after:h-[2px] after:bg-gradient-to-r after:from-orange-400/0 after:via-orange-400/70 after:to-orange-400/0 after:rounded-full">
            مكتبة الهندسة الكهربائية
          </span>

          <p className="text-base sm:text-lg text-slate-200/90 leading-relaxed">
            مكتبة إلكترونية لطلاب الهندسة الكهربائية، تم إعدادها بواسطة طلاب وخريجي التخصص.
          </p>
          <p className="text-base sm:text-lg text-slate-200/90 leading-relaxed">
            تضم فورمات، تلاخيص، محاضرات، وبروجكتات سابقة لمواد التخصص، مع العمل المستمر على إضافة باقي المواد تدريجيًا.
          </p>

          <div className="flex flex-col sm:flex-row justify-center gap-2 sm:gap-3">
            <Link to="/subjects" className="inline-block bg-orange-400 hover:bg-orange-500 text-white font-semibold py-2 sm:py-2.5 px-6 sm:px-8 rounded-full shadow-lg text-base transition-transform duration-150 hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-orange-400/70 focus:ring-offset-2 focus:ring-offset-neutral-900">
              Courses
            </Link>

            <Link to="/labs" className="inline-block bg-orange-400 hover:bg-orange-500 text-white font-semibold py-2 sm:py-2.5 px-6 sm:px-8 rounded-full shadow-lg text-base transition-transform duration-150 hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-orange-400/70 focus:ring-offset-2 focus:ring-offset-neutral-900">
              Labs
            </Link>
          </div>

          <div className="relative z-10 mt-6 sm:mt-8">
            <h2 className="text-base sm:text-lg font-bold text-white mb-3 sm:mb-4 text-center border-b border-white/10 pb-1 sm:pb-2 w-fit mx-auto">
              مجموعات الخير
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3 px-2 sm:px-0">
              <button onClick={() => handleOpenModal("needs")} className="bg-[#fb923c] hover:bg-[#f97316] text-white text-center rounded-md py-2 px-3 shadow-sm border border-orange-300/50 transition text-xs">
                أصدقاء ذوي الاحتياجات الخاصة
              </button>
              <button onClick={() => handleOpenModal("lahn")} className="bg-[#fdba74] hover:bg-[#fb923c] text-slate-900 text-center rounded-md py-2 px-3 shadow-sm border border-orange-300/60 transition text-xs">
                مجموعة لحن
              </button>
              <button onClick={() => handleOpenModal("goodness")} className="bg-[#f97316] hover:bg-[#ea580c] text-white text-center rounded-md py-2 px-3 shadow-sm border border-orange-400/40 transition text-xs">
                من هم للخير ساعون
              </button>
            </div>
          </div>

          <div className="mt-4 sm:mt-6">
            <p className="relative mx-auto max-w-2xl text-center text-base sm:text-lg font-semibold leading-relaxed text-transparent bg-clip-text bg-gradient-to-r from-white via-white to-orange-200 drop-shadow-[0_4px_14px_rgba(251,146,60,0.35)] after:content-[''] after:absolute after:inset-x-0 after:-bottom-2 after:h-[3px] after:bg-gradient-to-r after:from-orange-400/0 after:via-orange-400/70 after:to-orange-400/0 after:rounded-full">
              اللهم انفعنا بما علَّمتنا، وعلِّمنا ما ينفعنا، وزدنا علمًا.
            </p>
          </div>

          <p className="text-xs text-slate-400">© 2025 - ElecLib</p>
        </div>
      </div>

      {showModal && activeGroup && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 px-4">
          <div className="bg-orange-50 text-slate-900 rounded-xl shadow-xl p-6 pt-8 relative max-w-sm w-full border border-orange-200">
            <button onClick={() => setShowModal(false)} className="absolute top-2 left-2 text-orange-500 hover:text-orange-600 text-xl font-bold" aria-label="إغلاق">
              ✖
            </button>
            <h2 className="text-lg font-extrabold text-orange-600 mb-2 text-center">
              {groupInfo[activeGroup].title}
            </h2>
            <p className="text-slate-700 text-center">{groupInfo[activeGroup].description}</p>

            <div className="flex flex-col items-center gap-3 mt-5">
              {activeGroup === "needs" && (
                <button onClick={() => setShowPoster(true)} className="w-full bg-orange-100 hover:bg-orange-200 text-orange-800 px-3 py-2 rounded-full transition text-sm border border-orange-200">
                  البوست التعريفي
                </button>
              )}
              <a href={groupInfo[activeGroup].link} target="_blank" rel="noopener noreferrer" className="w-full text-white px-3 py-2 rounded-full transition text-center text-sm" style={{ backgroundColor: "#fb923c" }} onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#f97316")} onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#fb923c")}>{groupInfo[activeGroup].buttonText}</a>
            </div>
          </div>
        </div>
      )}

      {showPoster && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
          <div className="bg-neutral-900 rounded-xl shadow-2xl overflow-hidden relative w-full max-w-xs border border-white/10">
            <button
              onClick={() => setShowPoster(false)}
              className="absolute top-3 left-3 text-white text-2xl font-bold hover:text-red-500 z-10"
              aria-label="إغلاق"
            >
              ✖
            </button>
            <img src="/poster.jpg" alt="البوست التعريفي" className="w-full h-auto object-cover" />
          </div>
        </div>
      )}
    </div>
  );
}
