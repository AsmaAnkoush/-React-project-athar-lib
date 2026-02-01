export default function Links() {
  return (
    <div className="min-h-screen bg-[#0b132b] text-white p-6" dir="rtl">

      <h1 className="text-3xl font-bold mb-6 text-sky-300">روابط مساعدة</h1>

      <div className="space-y-4">

        <a
          href="https://translate.google.com/"
          className="block p-4 bg-white/10 rounded-xl hover:bg-white/20"
          target="_blank"
        >
          موقع الترجمة
        </a>

        <a
          href="https://extractpdf.com/"
          className="block p-4 bg-white/10 rounded-xl hover:bg-white/20"
          target="_blank"
        >
          عربي اكستراكت
        </a>

        <a
          href="https://www.ilovepdf.com/ppt_to_word"
          className="block p-4 bg-white/10 rounded-xl hover:bg-white/20"
          target="_blank"
        >
          تحويل بوربوينت → وورد
        </a>

        <a
          href="https://scholar.google.com/"
          className="block p-4 bg-white/10 rounded-xl hover:bg-white/20"
          target="_blank"
        >
          مكتبة
        </a>

      </div>
    </div>
  );
}
