"use client";
import { useState, useEffect } from 'react';
import droneData from './drone_data.json';

interface DroneSession {
    id: string;
    unloaded: { temp: number; vibe: number; battery: number; status: string; };
    loaded: { temp: number; vibe: number; payload: number; eff_drop: number; status: string; };
    autonomous: { gps_dev: number; route_success: boolean; sensor_anomaly_rate: number; status: string; };
    health_score: number;
    overall_status: string;
    root_cause: string;
    diagnosis: string;
    confidence: number;
}

export default function DroneDashboard() {
    const [sessions, setSessions] = useState<DroneSession[]>([]);
    const [selected, setSelected] = useState<DroneSession | null>(null);

    useEffect(() => {
        setSessions(droneData as DroneSession[]);
    }, []);

    const getStatusColor = (status: string) => {
        if (status === 'OK') return 'bg-[#002200] text-[#00FF00] border-[#00FF00] shadow-none';
        if (status === 'WARNING') return 'bg-[#222200] text-[#FFFF00] border-[#FFFF00] shadow-none';
        return 'bg-[#330000] text-[#FF3333] border-[#FF3333] shadow-none';
    };

    return (
        <div className="flex h-screen bg-black font-sans text-white">

            {/* SOL PANEL - Liste */}
            <div className="w-1/4 min-w-[320px] max-w-[400px] bg-neutral-950 border-r-4 border-neutral-800 flex flex-col h-full overflow-hidden z-10">
                <div className="p-5 border-b-4 border-neutral-800 bg-black text-white">
                    <h1 className="text-xl font-black tracking-wide text-white">EDGE DIAGNOSTICS</h1>
                    <p className="text-sm text-neutral-400 font-bold mt-1">Field Interface</p>
                </div>
                <div className="overflow-y-auto p-3">
                    {sessions.map((session) => (
                        <button
                            key={session.id}
                            onClick={() => setSelected(session)}
                            className={`w-full text-left p-4 mb-3 rounded-none border-2 flex justify-between items-center ${selected?.id === session.id
                                ? 'bg-neutral-800 border-white text-white'
                                : 'bg-black border-neutral-800 text-neutral-400 hover:border-neutral-600 hover:text-neutral-200'
                                }`}
                        >
                            <span className="font-black text-lg">{session.id}</span>
                            <span className={`text-xs font-black px-3 py-1 rounded-none border-2 ${session.overall_status === 'OK' ? 'bg-[#002200] text-[#00FF00] border-[#00FF00]' :
                                session.overall_status === 'WARNING' ? 'bg-[#222200] text-[#FFFF00] border-[#FFFF00]' :
                                    'bg-[#330000] text-[#FF3333] border-[#FF3333]'
                                }`}>
                                {session.overall_status}
                            </span>
                        </button>
                    ))}
                </div>
            </div>

            {/* SAĞ PANEL - Detay */}
            <div className="flex-1 px-12 py-8 overflow-y-auto bg-black">
                {selected ? (
                    <div className="max-w-7xl mx-auto space-y-8">

                        {/* Header Alanı */}
                        <div className="flex justify-between items-end border-b-4 border-neutral-800 pb-5">
                            <div>
                                <h2 className="text-[3.5rem] leading-none font-black text-white tracking-tight">{selected.id}</h2>
                                <p className="text-2xl font-bold text-neutral-400 mt-2 uppercase tracking-wider">Full System Analysis</p>
                            </div>
                            <div className="text-right bg-neutral-950 px-7 py-4 rounded-none border-4 border-neutral-800">
                                <div className={`text-6xl font-black tracking-tighter ${selected.health_score < 65 ? 'text-[#FF3333]' :
                                    selected.health_score < 85 ? 'text-[#FFFF00]' : 'text-[#00FF00]'
                                    }`}>
                                    {selected.health_score} <span className="text-3xl text-neutral-600">/ 100</span>
                                </div>
                                <p className="text-lg font-black text-neutral-400 uppercase mt-1">Health Score</p>
                            </div>
                        </div>

                        {/* Teşhis Kartı */}
                        <div className={`p-7 rounded-none border-4 bg-neutral-950 ${selected.overall_status === 'FAIL' ? 'border-[#FF3333]' :
                            selected.overall_status === 'WARNING' ? 'border-[#FFFF00]' : 'border-[#00FF00]'
                            }`}>
                            <div className="flex justify-between items-center mb-5">
                                <h3 className="font-black text-3xl text-white uppercase">
                                    ROOT CAUSE: <span className="text-neutral-300">{selected.root_cause}</span>
                                </h3>
                                <span className="text-xl font-black bg-neutral-800 text-white px-5 py-2 rounded-none border-2 border-neutral-600">
                                    AI CONFIDENCE: {selected.confidence}%
                                </span>
                            </div>
                            <p className="text-white text-2xl font-bold leading-relaxed bg-black border-l-8 border-neutral-600 p-6 rounded-none">
                                "{selected.diagnosis}"
                            </p>
                        </div>

                        {/* Uçuş Modu Detayları */}
                        <h3 className="font-black text-[2rem] text-white pt-3 uppercase tracking-wide">Flight Mode Results</h3>
                        <div className="grid grid-cols-3 gap-8">

                            {/* Unloaded */}
                            <div className={`p-7 rounded-none border-4 ${getStatusColor(selected.unloaded.status)}`}>
                                <h4 className="font-black text-2xl border-b-4 border-current pb-3 mb-5 uppercase tracking-wider">Unloaded</h4>
                                <div className="space-y-3 text-xl font-bold text-white">
                                    <p className="flex justify-between"><span>Temperature:</span> <span>{selected.unloaded.temp}°C</span></p>
                                    <p className="flex justify-between"><span>Vibration:</span> <span>{selected.unloaded.vibe} m/s²</span></p>
                                    <p className="flex justify-between"><span>Battery Drain:</span> <span>{selected.unloaded.battery}%</span></p>
                                </div>
                            </div>

                            {/* Loaded */}
                            <div className={`p-7 rounded-none border-4 ${getStatusColor(selected.loaded.status)}`}>
                                <h4 className="font-black text-2xl border-b-4 border-current pb-3 mb-5 uppercase tracking-wider">
                                    Loaded ({selected.loaded.payload}kg)
                                </h4>
                                <div className="space-y-3 text-xl font-bold text-white">
                                    <p className="flex justify-between"><span>Temperature:</span> <span>{selected.loaded.temp}°C</span></p>
                                    <p className="flex justify-between"><span>Vibration:</span> <span>{selected.loaded.vibe} m/s²</span></p>
                                    <p className="flex justify-between"><span>Effic. Drop:</span> <span>{selected.loaded.eff_drop}%</span></p>
                                </div>
                            </div>

                            {/* Auto */}
                            <div className={`p-7 rounded-none border-4 ${getStatusColor(selected.autonomous.status)}`}>
                                <h4 className="font-black text-2xl border-b-4 border-current pb-3 mb-5 uppercase tracking-wider">Autonomous</h4>
                                <div className="space-y-3 text-xl font-bold text-white">
                                    <p className="flex justify-between"><span>GPS Dev:</span> <span>{selected.autonomous.gps_dev}m</span></p>
                                    <p className="flex justify-between"><span>Route:</span> <span>{selected.autonomous.route_success ? 'SUCCESS' : 'FAILED'}</span></p>
                                    <p className="flex justify-between"><span>Anomalies:</span> <span>{selected.autonomous.sensor_anomaly_rate}</span></p>
                                </div>
                            </div>

                        </div>
                    </div>
                ) : (
                    <div className="h-full flex flex-col items-center justify-center text-neutral-600">
                        <svg className="w-32 h-32 mb-6 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                        </svg>
                        <p className="text-3xl font-black uppercase tracking-widest opacity-80">Select Session</p>
                    </div>
                )}
            </div>
        </div>
    );
}