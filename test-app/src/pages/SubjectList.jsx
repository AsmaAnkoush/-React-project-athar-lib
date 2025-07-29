import React, { useState } from 'react';

const subjects = [
    { code: "ENEE3308", name: "DYNAMICS", link: "https://drive.google.com/drive/u/0/folders/1606mxMKApRuLaxqPu7ERMH_bBXA3wYNc" },
    { code: "ENEE2313", name: "Elctronics 1", link: "https://drive.google.com/drive/u/0/folders/1vnjBVs_2jSJzTIQkqGoCbUJysMumkT_J" },
    { code: "ENEE3304", name: "Elctronics 2", link: "https://drive.google.com/drive/u/0/folders/1jZhd2gohbrToLkIkoSkBJwrzTOP3eYXd" },
    { code: "ENEE4302", name: "Control System 1", link: " https://drive.google.com/drive/u/0/folders/1HVPDzLhFOOcJyPwdoi2HZey5DtZQ6t8r" },
    { code: "ENEE2340", name: "Digital System", link: " https://drive.google.com/drive/u/0/folders/13jAxHfIIXxkUrw-GpdB16A4WrTA8DHPx" },

    { code: "ENEE2408", name: "Electrical Machines", link: "https://drive.google.com/drive/u/0/folders/1SQYzMLKhx4mgR8vhEojzcePpHZGg0Y6y" },
    { code: "ENEE4403", name: "Power System", link: "https://drive.google.com/drive/u/0/folders/10eRLSROCWBJeQSSjxRlzcHBouZK_DwYg" },
    { code: "ENEE3309", name: "Communication Systems 1", link: "https://drive.google.com/drive/u/0/folders/1dNrZn8bOqgS7E2EA05cIG-Zpb3v7UuCD" },
    { code: "ENEE3401", name: "Communication Systems 2", link: "https://drive.google.com/drive/u/0/folders/1GyFl5GmeMdEPfW_z0XkPO_6wzXt9d5V2" },
    { code: "ENEE5330", name: "Numerical Methods", link: "https://drive.google.com/drive/u/0/folders/1Hzmg4sJhAnL6xw4gWqik5WAAEJ_-E0VK" },
    { code: "ENEE3305", name: "Power Electronics", link: "https://drive.google.com/drive/u/0/folders/1gxdIqVBZQluLjJCAbSeFnT05Xet_JIhO" },
    { code: "ENEE5306", name: "Protection Systems", link: "https://drive.google.com/drive/u/0/folders/10cXakt1CZACqigZAG80_LupdrDVRzGd3" },
    { code: "ENEE4304", name: "Measurement and Instrumentation", link: "https://drive.google.com/drive/u/0/folders/1sTft42F38nIKzQA1nn1S3kcNuF7O4G0Q" },
    { code: "ENEE2312", name: "Signals and Systems", link: "https://drive.google.com/drive/u/0/folders/1AiBSH7Qq7d-vpKq5Rf_9r5gHSXS0qlxP" },
    { code: "ENEE3318", name: "Electromagnetics", link: "https://drive.google.com/drive/u/0/folders/1FmZ7aZIoM4uaeaX4eIfQ4hBTDEuN4xVG" },
    { code: "ENCS4308", name: "Microprocessors", link: "https://drive.google.com/drive/u/0/folders/1wUagiWg4AFe4nC1Ve16R4yVF6QimjBgD" },
    { code: "ENCS2308", name: "Computer Organization", link: "https://drive.google.com/drive/u/0/folders/1MNiulK2C72dYdSB4YgNnXydCKbGuU1Aa" },
    { code: "MATH234", name: "Linear Algebra", link: "https://drive.google.com/drive/u/0/folders/1xC9GDKU31xS8F31dGBVbgUzewpyNrPQl" },
    { code: "MATH1411", name: "Calculus 1", link: "https://drive.google.com/drive/u/0/folders/1pImx9APzpXOhRyC5rlQeSJCTvwIbJ2Dl" },
    { code: "MATH2311", name: "Calculus 3", link: "https://drive.google.com/drive/u/0/folders/1-H0EXSPSHWTX_YtYU1vuW55eoXW1ZNVa" },
    { code: "MATH331", name: "Differential Equations", link: "https://drive.google.com/drive/u/0/folders/1-UipxultNA7nNmLouZPAQlbXCyJ7oWbm" },
    { code: "ENCE232", name: "Statics", link: "https://drive.google.com/drive/u/0/folders/1wXb7GsnaKJRgDDVZF38nTsvU1dR_-YBM" },
    { code: "ENEE2311", name: "Network Analysis 1", link: "https://drive.google.com/drive/u/0/folders/1_CFlBAcIOxtZxInFVGNU9_BdGypEb7_m" },
    { code: "ENEE2315", name: "Network Analysis 2", link: "https://drive.google.com/drive/u/0/folders/1q2N9G90Cfn9NoCrhssjdXvnv1JvStc6S" },
];

export default function AllSubjects() {
    const [search, setSearch] = useState("");

    const filteredSubjects = subjects.filter(subj =>
        subj.code.toLowerCase().includes(search.toLowerCase()) ||
        subj.name.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <main
            className="min-h-screen bg-[#0f172a] bg-cover bg-center px-4 py-10 flex items-start justify-center relative"
            style={{ backgroundImage: "url('/images.jpeg')" }}
        >
            <div className="absolute inset-0 bg-[#0f172a]/85 backdrop-blur-sm z-0" />

            <div className="relative z-10 w-full max-w-6xl">
                <h2 className="text-3xl md:text-4xl font-extrabold text-center text-yellow-400 mb-10 drop-shadow">
                    Electrical Engineering Courses
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
                    {filteredSubjects.map(subj => (
                        <a
                            key={subj.code + subj.name}
                            href={subj.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block"
                        >
                            <div className="bg-gradient-to-br from-[#1e293b] to-[#0f172a] text-white rounded-2xl p-4 shadow-lg border border-white/10 backdrop-blur-md transition-transform duration-200 hover:scale-105 hover:border-sky-500">
                                <h4 className="font-bold text-sky-400 text-sm mb-1">{subj.code}</h4>
                                <p className="text-slate-200 text-sm">{subj.name}</p>
                            </div>
                        </a>
                    ))}

                    {filteredSubjects.length === 0 && (
                        <p className="text-center col-span-full text-slate-400 text-sm mt-4">
                            No subjects found.
                        </p>
                    )}
                </div>

                <p className="text-center text-xs text-slate-500 mt-10">© 2025 - ElecLib</p>
            </div>
        </main>
    );
}
