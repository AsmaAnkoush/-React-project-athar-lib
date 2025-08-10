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
        <div
            className="relative min-h-screen bg-cover bg-center flex items-center justify-center px-4"
            style={{ backgroundImage: "url('/images.jpeg')" }}
            dir="rtl"
        >
            {/* طبقة خلفية داكنة */}
            <div className="absolute inset-0 bg-[#0f172a]/80 backdrop-blur-sm"></div>

            {/* المحتوى */}
            <div className="relative z-10 bg-gradient-to-br from-[#1e293b] to-[#0f172a] text-white rounded-2xl shadow-2xl w-full max-w-3xl px-10 py-14 space-y-8 text-center border border-white/10 backdrop-blur-lg">

                {/* دعاء */}
                <p className="text-xl font-semibold text-yellow-400 drop-shadow-sm">
                    اللهم انفعنا بما علَّمتنا، وعلِّمنا ما ينفعنا، وزدنا علمًا.
                </p>

                {/* اسم المكتبة */}
                <h1 className="text-3xl md:text-4.5xl font-extrabold flex justify-center items-center gap-2 text-sky-400">
                    ElecLib - مكتبة الهندسة الكهربائية
                </h1>

                {/* وصف */}
                <p className="text-lg md:text-xl text-slate-200 leading-relaxed">
                    مكتبة إلكترونية لطلاب الهندسة الكهربائية، تم إعدادها بواسطة طلاب وخريجي التخصص.
                </p>
                <p className="text-lg md:text-xl text-slate-200 leading-relaxed">
                    تضم فورمات، تلاخيص، محاضرات، وبروجكتات سابقة لمواد التخصص، مع العمل المستمر على إضافة باقي المواد تدريجيًا.
                </p>

                {/* روابط */}
                <div className="flex flex-col sm:flex-row justify-center gap-4">

                    <Link
                        to="/subjects"
                        className="inline-block bg-sky-500 hover:bg-sky-600 text-white font-bold py-3 px-10 rounded-full shadow-lg text-lg transition transform hover:scale-105"
                    >
                        Cources
                    </Link>
                    <Link
                        to="/labs"
                        className="inline-block bg-sky-500 hover:bg-sky-600 text-white font-bold py-3 px-10 rounded-full shadow-lg text-lg transition transform hover:scale-105"
                    >
                        Labs
                    </Link>
                </div>

                {/* مجموعات الخير */}
                <div className="relative z-10 mt-20">
                    <h2 className="text-xl font-bold text-white mb-6 text-center border-b border-white/10 pb-2 w-fit mx-auto">
                        مجموعات الخير
                    </h2>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 px-4 sm:px-0">
                        <button
                            onClick={() => handleOpenModal("needs")}
                            className="bg-blue-900/60 hover:bg-blue-900/80 text-white text-center rounded-lg py-4 px-3 shadow-sm border border-blue-200/10 transition hover:shadow-md text-sm animate-pulse"
                        >
                            أصدقاء ذوي الاحتياجات الخاصة
                        </button>
                        <button
                            onClick={() => handleOpenModal("lahn")}
                            className="bg-sky-800/60 hover:bg-sky-800/80 text-white text-center rounded-lg py-4 px-3 shadow-sm border border-sky-200/10 transition hover:shadow-md text-sm animate-pulse"
                        >
                            مجموعة لحن
                        </button>
                        <button
                            onClick={() => handleOpenModal("goodness")}
                            className="bg-indigo-900/60 hover:bg-indigo-900/80 text-white text-center rounded-lg py-4 px-3 shadow-sm border border-indigo-200/10 transition hover:shadow-md text-sm animate-pulse"
                        >
                            من هم للخير ساعون
                        </button>
                    </div>
                </div>

                {/* الفوتر */}
                <p className="text-xs text-gray-500 mt-6">© 2025 - ElecLib</p>
            </div>

            {/* المودال للمجموعة */}
            {showModal && activeGroup && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
                    <div className="bg-white rounded-xl shadow-lg p-6 pt-8 relative max-w-sm w-full text-center text-gray-800 space-y-4">
                        <button
                            onClick={() => setShowModal(false)}
                            className="absolute top-2 left-2 text-gray-500 hover:text-red-600 text-xl font-bold"
                        >
                            ✖
                        </button>

                        <h2 className="text-lg font-bold text-blue-800">
                            {groupInfo[activeGroup].title}
                        </h2>
                        <p>{groupInfo[activeGroup].description}</p>

                        {/* الزرين تحت بعض */}
                        <div className="flex flex-col items-center gap-3">
                            {activeGroup === "needs" && (
                                <button
                                    onClick={() => setShowPoster(true)}
                                    className="w-full bg-blue-600 text-white px-4 py-2 rounded-full hover:bg-blue-700 transition animate-pulse"
                                >
                                    البوست التعريفي
                                </button>
                            )}
                            <a
                                href={groupInfo[activeGroup].link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-full bg-blue-600 text-white px-4 py-2 rounded-full hover:bg-blue-700 transition animate-pulse text-center"
                            >
                                {groupInfo[activeGroup].buttonText}
                            </a>
                        </div>
                    </div>
                </div>
            )}

            {/* المودال للصورة */}
            {showPoster && (
                <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 px-4">
                    <div className="bg-white rounded-xl shadow-xl overflow-hidden relative max-w-md w-full">
                        <button
                            onClick={() => setShowPoster(false)}
                            className="absolute top-2 left-2 text-black text-xl font-bold hover:text-red-600"
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
