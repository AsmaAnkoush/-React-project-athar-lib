import { Link } from "react-router-dom";
import { useState } from "react";

export default function Hero() {
    const [showModal, setShowModal] = useState(false);

    return (
        <div
            className="relative min-h-screen bg-cover bg-center flex items-center justify-center px-4"
            style={{ backgroundImage: "url('/images.jpeg')" }}
            dir="rtl"
        >
            {/* طبقة خلفية داكنة */}
            <div className="absolute inset-0 bg-[#0f172a]/80 backdrop-blur-sm"></div>

            {/* محتوى البوكس */}
            <div className="relative z-10 bg-gradient-to-br from-[#1e293b] to-[#0f172a] text-white rounded-2xl shadow-2xl w-full max-w-3xl px-10 py-14 space-y-8 text-center border border-white/10 backdrop-blur-lg">

                {/* الدعاء */}
                <p className="text-xl font-semibold text-yellow-400 drop-shadow-sm">
                    اللهم انفعنا بما علَّمتنا، وعلِّمنا ما ينفعنا، وزدنا علمًا.
                </p>

                {/* اسم المكتبة */}
                <h1 className="text-3xl md:text-4.5xl font-extrabold flex justify-center items-center gap-2 text-sky-400">
                    ElecLib - مكتبة الهندسة الكهربائية
                </h1>

                {/* وصف المكتبة */}
                <p className="text-lg md:text-xl text-slate-200 leading-relaxed">
                    مكتبة إلكترونية لطلاب الهندسة الكهربائية، تم إعدادها بواسطة طلاب وخريجي التخصص.
                </p>
                <p className="text-lg md:text-xl text-slate-200 leading-relaxed">
                    تضم فورمات، تلاخيص، محاضرات، وبروجكتات سابقة لمواد التخصص، مع العمل المستمر على إضافة باقي المواد تدريجيًا.
                </p>

                {/* أزرار المواد */}
                <div className="flex flex-col sm:flex-row justify-center gap-4">
                    <Link
                        to="/labs"
                        className="inline-block bg-sky-500 hover:bg-sky-600 text-white font-bold py-3 px-10 rounded-full shadow-lg text-lg transition transform hover:scale-105"
                    >
                        Labs
                    </Link>
                    <Link
                        to="/subjects"
                        className="inline-block bg-sky-500 hover:bg-sky-600 text-white font-bold py-3 px-10 rounded-full shadow-lg text-lg transition transform hover:scale-105"
                    >
                        Cources
                    </Link>
                </div>

                {/* مجموعات الخير */}
                <div className="relative z-10 mt-20">
                    <h2 className="text-xl font-bold text-white mb-6 text-center border-b border-white/10 pb-2 w-fit mx-auto">
                        مجموعات الخير
                    </h2>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 px-4 sm:px-0">
                        {/* أصدقاء ذوي الاحتياجات الخاصة */}
                        <button
                            onClick={() => setShowModal(true)}
                            className="bg-blue-900/60 hover:bg-blue-900/80 text-white text-center rounded-lg py-4 px-3 shadow-sm border border-blue-200/10 transition hover:shadow-md text-sm"
                        >
                            أصدقاء ذوي الاحتياجات الخاصة
                        </button>

                        {/* مجموعة لحن */}
                        <a
                            href="https://www.facebook.com/profile.php?id=100070275111033"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-sky-800/60 hover:bg-sky-800/80 text-white text-center rounded-lg py-4 px-3 shadow-sm border border-sky-200/10 transition hover:shadow-md text-sm"
                        >
                            مجموعة لحن
                        </a>

                        {/* من هم للخير ساعون */}
                        <a
                            href="https://www.facebook.com/groups/2352165261734115/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-indigo-900/60 hover:bg-indigo-900/80 text-white text-center rounded-lg py-4 px-3 shadow-sm border border-indigo-200/10 transition hover:shadow-md text-sm"
                        >
                            من هم للخير ساعون
                        </a>
                    </div>
                </div>

                {/* فوتر */}
                <p className="text-xs text-gray-500 mt-6">© 2025 - ElecLib</p>
            </div>

            {/* البوكس المنبثق */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl shadow-lg p-6 max-w-sm w-full text-center text-gray-800 space-y-4">
                        <h2 className="text-lg font-bold text-blue-800">أصدقاء ذوي الاحتياجات الخاصة</h2>
                        <p>
                            مجموعة بتدعم الطلاب ذوي الاحتياجات الخاصة بأي مساعدة بيحتاجوها، سواء أكاديميًا أو بأي جانب ثاني.
                            إذا بتحب تكون سبب خير وتدعم زملاءك، مكانك معنا.


                            💙                        </p>
                        <a
                            href="https://chat.whatsapp.com/K8r8ewZQkuR2DzKEYFvsoU?mode=r_t"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-block mt-2 bg-blue-600 text-white px-4 py-2 rounded-full hover:bg-blue-700 transition animate-pulse"
                        >
                            الانضمام إلى المجموعة
                        </a>

                        <button
                            onClick={() => setShowModal(false)}
                            className="block mx-auto text-sm text-red-600 hover:underline mt-2"
                        >
                            إغلاق
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
