import { useEffect, useState } from "react";
import { getEventList, getEventPinnedList } from "../../api/eventApi";
import Button from "../common/Button";

const EventBannerSearchComponent = ({ onSelect, onClose }) => {
    const [events, setEvents] = useState([]);
    const [search, setSearch] = useState("");

    useEffect(() => {
        fetchEvents();
    }, []);

    const fetchEvents = async () => {
        try {
            const [pinnedList, normalRes] = await Promise.all([
                getEventPinnedList(),
                getEventList({})
            ]);
            const merged = [...(pinnedList || []), ...(normalRes?.content || [])];
            setEvents(merged);
        } catch (err) {
            console.error("이벤트 목록 조회 실패", err);
        }
    };

    const filtered = events.filter(e =>
        e.title.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="bg-white w-full max-w-3xl p-6 rounded shadow-2xl">
            <div className="flex justify-between mb-4">
                <h2 className="text-lg font-bold text-green-800">이벤트 검색</h2>
                <button onClick={onClose} className="text-gray-600 font-semibold hover:text-black cursor-pointer">✕</button>
            </div>

            <input
                type="text"
                placeholder="이벤트명 검색"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full border px-3 py-2 rounded mb-4"
            />

            <div className="max-h-70 overflow-y-auto space-y-2">
                {filtered.length > 0 ? (
                    filtered.map(event => (
                        <div
                            key={event.eno}
                            className="border rounded p-5 hover:bg-yellow-100 cursor-pointer"
                            onClick={() => onSelect(event)}
                        >
                            <div className="text-sm text-gray-800">{event.title}</div>
                        </div>
                    ))
                ) : (
                    <p className="text-sm text-gray-500">검색 결과가 없습니다.</p>
                )}
            </div>
            <div className="mt-4 text-center">
                <Button onClick={onClose}>닫기</Button>
            </div>

        </div>
    );
};

export default EventBannerSearchComponent;