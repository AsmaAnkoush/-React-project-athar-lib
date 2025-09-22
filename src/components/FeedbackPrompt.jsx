import React, { useEffect, useMemo, useState } from "react";
import { Star } from "lucide-react";

const LS_DONE_KEY = "eleclib_feedback_done";
const LS_TRIGGER_KEY = "eleclib_feedback_trigger";

const SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycbzN94t29s-wrWvREt03ZiNNU1tXb-XdjiaZoxos_nQccqEq1xiP0Ct0GpXPEb1gW2A9/exec";

export default function FeedbackPrompt() {
  const [open, setOpen] = useState(false);
  const [stars, setStars] = useState(0);
  const [note, setNote] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [thanks, setThanks] = useState(false); // ✅ حالة لرسالة الشكر

  useEffect(() => {
    const tryOpen = () => {
      if (localStorage.getItem(LS_DONE_KEY) === "1") return;
      if (localStorage.getItem(LS_TRIGGER_KEY) === "1") setOpen(true);
    };
    tryOpen();
    window.addEventListener("eleclib:feedback", tryOpen);
    return () => window.removeEventListener("eleclib:feedback", tryOpen);
  }, []);

 const asset = (name) => `/feedback/${name}.png`;

const verdict = useMemo(() => {
  switch (stars) {
    case 1: return { img: asset("66"),   msg: "يا ساتر!  نجمة وحدة ؟" };
    case 2: return { img: asset("33"),   msg: "يعني مش أسوأ شي , بس كيف نخليها 5 نجوم؟" };
    case 3: return { img: asset("44"),   msg: "👌 شو ناقص المكتبة عشان يصير تقييمك 4 نجوم؟" };
    case 4: return { img: asset("22"),   msg: "😎 قربنا إنها تعجبك 5/5 " };
    case 5: return { img: asset("5555"), msg: "حلووو إنها أعجبتك ❤️ شكراً كثيراً" };
    default:return { img: asset("9"),    msg: "قيّم تجربتك للموقع معنا" };
  }
}, [stars]);


  function handleSubmit(e) {
    e?.preventDefault?.();
    setError("");

    if (!stars) {
      setError("Please select a star rating.");
      return;
    }

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!email || !emailRegex.test(email)) {
      setError("A valid email is required.");
      return;
    }

    // ✅ Optimistic UI
    localStorage.setItem(LS_DONE_KEY, "1");
    setThanks(true); // عرض رسالة الشكر

    // اغلاق المودال بعد 1.5 ثانية
    setTimeout(() => setOpen(false), 1500);

    // إرسال في الخلفية
    try {
      const url = new URL(SCRIPT_URL);
      url.searchParams.set("email", email);
      url.searchParams.set("stars", String(stars));
      url.searchParams.set("note", note || "");
      fetch(url.toString(), { method: "GET", mode: "no-cors", keepalive: true })
        .catch((err) => console.error("Feedback send failed:", err));
    } catch (err) {
      console.error("Feedback build URL failed:", err);
    }
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[1000] grid place-items-center bg-black/50 backdrop-blur-sm px-4">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-neutral-900 p-5 shadow-2xl text-white relative">
        <h3 className="text-xl font-extrabold text-center text-orange-400 mb-1">
          Rate Your Experience
        </h3>
        <p className="text-center text-slate-300 mb-4">
          Your feedback helps us improve ElecLib
        </p>

        {!thanks ? (
          <>
            <div className="flex items-center justify-center gap-1 mb-3">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setStars(n)}
                  className={`p-1 rounded ${n <= stars ? "text-yellow-400" : "text-slate-500"} hover:text-yellow-300`}
                  aria-label={`${n} stars`}
                >
                  <Star fill={n <= stars ? "currentColor" : "none"} size={26} />
                </button>
              ))}
            </div>

            <div className="flex flex-col items-center gap-2 mb-3">
              <img src={verdict.img} alt="" className="w-24 h-24 object-contain" />
              <div className="text-sm text-slate-200">{verdict.msg}</div>
            </div>

            <form className="space-y-3" onSubmit={handleSubmit}>
              <div>
                <label className="block text-sm text-slate-300 mb-1">
                  Your Email (required)
                </label>
                <input
                  type="email"
                  className="w-full rounded-lg bg-white/10 border border-white/10 px-3 py-2 outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                />
              </div>

              <div>
                <label className="block text-sm text-slate-300 mb-1">
                  Your Note (optional)
                </label>
                <textarea
                  className="w-full min-h-[80px] rounded-lg bg-white/10 border border-white/10 px-3 py-2 outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="What would you like us to improve?"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                />
              </div>

              {error && <div className="text-red-300 text-sm">{error}</div>}

              <button
                type="submit"
                className="w-full rounded-xl bg-orange-600 hover:bg-orange-700 px-4 py-2 font-semibold"
              >
                Submit Feedback
              </button>
            </form>
          </>
        ) : (
          <div className="text-center text-lg text-green-400 font-semibold py-6">
            شكراً على تقييمك ❤️
          </div>
        )}
      </div>
    </div>
  );
}
