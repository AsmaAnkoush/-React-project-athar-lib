import React, { useEffect, useMemo, useState } from "react";
import { X, Star } from "lucide-react";

// Local Storage Keys
const LS_DONE_KEY = "eleclib_feedback_done";
const LS_TRIGGER_KEY = "eleclib_feedback_trigger";

// Google Apps Script Endpoint
const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzN94t29s-wrWvREt03ZiNNU1tXb-XdjiaZoxos_nQccqEq1xiP0Ct0GpXPEb1gW2A9/exec";

export default function FeedbackPrompt() {
  const [open, setOpen] = useState(false);
  const [stars, setStars] = useState(0);
  const [note, setNote] = useState("");
  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  // Open modal based on localStorage or event trigger
  useEffect(() => {
    const tryOpen = () => {
      if (localStorage.getItem(LS_DONE_KEY) === "1") return;
      if (localStorage.getItem(LS_TRIGGER_KEY) === "1") setOpen(true);
    };
    tryOpen();
    window.addEventListener("eleclib:feedback", tryOpen);
    return () => window.removeEventListener("eleclib:feedback", tryOpen);
  }, []);

  // Dynamic message and image based on stars
 const verdict = useMemo(() => {
  switch (stars) {
    case 1:
      return { img: "/feedback/66.png", msg: "بما أنها مش معجبتك لهدرجة 😬 احكيلنا شو نضيف حتى تصير مكتبتك المفضلة؟" };
    case 2:
      return { img: "/feedback/33.png", msg: "شكلك انحولت من الحركة بالموقع 😅" };
    case 3:
return { img: "/feedback/44.png", msg: "تمام… احكيلنا شو نضيف حتى تصير مكتبتك المفضلة 👌" };
    case 4:
      return { img: "/feedback/22.png", msg: "يعني في أمل… قربنا إنها تعجبك 5/5 😅" };
    case 5:
      return { img: "/feedback/5555.png", msg:"حلووووووووووو إنها أعجبتك ,, شكراً كثيراً ❤️❤️❤️" };
    default:
      return { img: "/feedback/9.png", msg: "قيّم تجربتك للموقع معنا" };
  }
}, [stars]);


  async function handleSubmit(e) {
    e?.preventDefault?.();
    setError("");

    if (!stars) { setError("Please select a star rating."); return; }

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!email || !emailRegex.test(email)) { 
      setError("A valid email is required."); 
      return; 
    }

    setSending(true);
    try {
      const url = new URL(SCRIPT_URL);
      url.searchParams.set("email", email);
      url.searchParams.set("stars", String(stars));
      url.searchParams.set("note", note || "");
      await fetch(url.toString(), { method: "GET", mode: "no-cors" });

      localStorage.setItem(LS_DONE_KEY, "1");
      setSent(true);
      setTimeout(() => setOpen(false), 1500);
    } catch (err) {
      console.error(err);
      setError("Something went wrong. Please try again later.");
    } finally {
      setSending(false);
    }
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[1000] grid place-items-center bg-black/50 backdrop-blur-sm px-4">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-neutral-900 p-5 shadow-2xl text-white relative">
        <button
          className="absolute top-3 left-3 p-2 rounded-lg bg-white/10 hover:bg-white/20"
          onClick={() => setOpen(false)}
          title="Close"
        >
          <X size={16} />
        </button>

        <h3 className="text-xl font-extrabold text-center text-orange-400 mb-1">Rate Your Experience</h3>
        <p className="text-center text-slate-300 mb-4">Your feedback helps us improve ElecLib</p>

        <div className="flex items-center justify-center gap-1 mb-3">
          {[1,2,3,4,5].map((n) => (
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
            <label className="block text-sm text-slate-300 mb-1">Your Email (required)</label>
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
            <label className="block text-sm text-slate-300 mb-1">Your Note (optional)</label>
            <textarea
              className="w-full min-h-[80px] rounded-lg bg-white/10 border border-white/10 px-3 py-2 outline-none focus:ring-2 focus:ring-orange-500"
              placeholder="What would you like us to improve?"
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </div>

          {error && <div className="text-red-300 text-sm">{error}</div>}

          {!sent ? (
            <button
              type="submit"
              disabled={sending}
              className="w-full rounded-xl bg-orange-600 hover:bg-orange-700 disabled:opacity-60 px-4 py-2 font-semibold"
            >
              {sending ? "Sending..." : "Submit Feedback"}
            </button>
          ) : (
            <div className="w-full rounded-xl bg-green-600 px-4 py-2 font-semibold text-center">
              Thank you ❤️
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
