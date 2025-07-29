import React, { useState } from 'react';
const labs = [
    { code: "ENEE3112", name: "Electronics Lab", link: "https://drive.google.com/drive/u/0/folders/1WC4yrdqRAJhZjvNQFlL4C8ft-qAPMmtZ" },
    { code: "ENEE2102", name: "Circuits Lab", link: "https://drive.google.com/drive/u/0/folders/1EfB28OjAevjdrm_9E7JcKPh4n8DmHXqX" },
    { code: "ENEE4202", name: "Electrical Installation Lab (تمديدات)", link: "https://drive.google.com/drive/u/0/folders/1ttluHpiHqLjj6N42Kw40XhwQrSA-MfXm" },
    { code: "ENEE4113", name: "Communications Lab", link: "https://drive.google.com/drive/u/0/folders/11-SZXLAw23wfQrkp62yWq_C3vyaTtIfA" },
    { code: "ENEE3101", name: "Machine Lab", link: "https://drive.google.com/drive/u/0/folders/1PRTBJHQ2j0b7J-76JSzdCpcExhOn1To-" },
    { code: "ENCS2110", name: "Digital Lab", link: "https://drive.google.com/drive/u/0/folders/1Zgkuzsgf95CvNTNJSD6viqCpA5_3zcj_" },
];


export default function LabsPage() {
    const [search, setSearch] = useState("");

    const filteredLabs = labs.filter(lab =>
        lab.code.toLowerCase().includes(search.toLowerCase()) ||
        lab.name.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <main
            className="min-h-screen bg-[#0f172a] bg-cover bg-center px-4 py-10 flex items-start justify-center relative"
            style={{ backgroundImage: "url('/images.jpeg')" }}
        >
            <div className="absolute inset-0 bg-[#0f172a]/85 backdrop-blur-sm z-0" />

            <div className="relative z-10 w-full max-w-6xl">
                <h2 className="text-3xl md:text-4xl font-extrabold text-center text-yellow-400 mb-10 drop-shadow">
                    Electrical Engineering Labs
                </h2>

                <div className="mb-6 flex justify-center">
                    <input
                        type="text"
                        placeholder="Search by code or name..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="w-full max-w-md px-5 py-3 rounded-full text-sm bg-white/10 placeholder-white text-white border border-white/20 focus:outline-none focus:ring-2 focus:ring-sky-500 shadow-lg"
                    />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
                    {filteredLabs.map(lab => (
                        <a
                            key={lab.code + lab.name}
                            href={lab.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block"
                        >
                            <div className="bg-gradient-to-br from-[#1e293b] to-[#0f172a] text-white rounded-2xl p-4 shadow-lg border border-white/10 backdrop-blur-md transition-transform duration-200 hover:scale-105 hover:border-sky-500">
                                <h4 className="font-bold text-sky-400 text-sm mb-1">{lab.code}</h4>
                                <p className="text-slate-200 text-sm">{lab.name}</p>
                            </div>
                        </a>
                    ))}

                    {filteredLabs.length === 0 && (
                        <p className="text-center col-span-full text-slate-400 text-sm mt-4">
                            No labs found.
                        </p>
                    )}
                </div>

                <p className="text-center text-xs text-slate-500 mt-10">© 2025 - ElecLib</p>
            </div>
        </main>
    );
}
