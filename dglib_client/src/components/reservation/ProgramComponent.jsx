import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { getProgramList } from '../../api/programApi';
import { usePagination } from '../../hooks/usePage';
import { useSearchHandler } from '../../hooks/useSearchHandler';
import SelectComponent from '../common/SelectComponent';
import dayjs from 'dayjs';

const ProgramComponent = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const [programs, setPrograms] = useState({ content: [], pageable: {}, totalPages: 0 });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [searchQuery, setSearchQuery] = useState(searchParams.get('query') || '');

    const status = searchParams.get('status') || '';
    const option = searchParams.get('option') || 'all';

    const { handleSearch } = useSearchHandler({ tab: 'program' });
    const { renderPagination } = usePagination(programs, searchParams, setSearchParams, isLoading);

    const handleStatusChange = (selected) => {
        const newParams = new URLSearchParams(searchParams);
        newParams.set('status', selected === '신청상태' ? '' : selected);
        newParams.set('page', '1');
        setSearchParams(newParams);
    };

    const handleOptionChange = (selected) => {
        const newParams = new URLSearchParams(searchParams);
        newParams.set('option', selected === '전체' ? 'all' : selected);
        newParams.set('page', '1');
        setSearchParams(newParams);
    };

    const navigate = useNavigate();

    useEffect(() => {
        const fetchPrograms = async () => {
            setIsLoading(true);
            setError(null);

            const params = {
                page: Math.max(parseInt(searchParams.get('page') || '1', 10) - 1, 0),
                size: 10,
                status: searchParams.get('status') || ''
            };

            const currentOption = searchParams.get('option') || 'all';
            const currentQuery = searchParams.get('query') || '';

            if (currentOption === 'all') {
                params.progName = currentQuery;
                params.content = currentQuery;
            } else {
                params[currentOption] = currentQuery;
            }

            console.log("보낸 검색 파라미터", params);

            try {
                const data = await getProgramList(params);
                setPrograms(data);
            } catch (err) {
                setError("프로그램 목록을 불러오는 중 오류가 발생했습니다.");
            } finally {
                setIsLoading(false);
            }
        };
        fetchPrograms();
    }, [searchParams]);

    const handleSubmit = (e) => {
        e.preventDefault();
        handleSearch(searchQuery, option);
    };

    const getProgramStatus = (applyStartAt, applyEndAt, current, capacity) => {
        const now = new Date();
        const start = new Date(applyStartAt);
        const end = new Date(applyEndAt);

        if (now < start) return '신청전';
        if (now > end || current >= capacity) return '모집마감';
        return '신청중';
    };

    const renderStatusBadge = (status) => {
        const base = "px-4 py-4 rounded text-sm font-semibold whitespace-nowrap";

        switch (status) {
            case '신청중':
                return <span className={`${base} bg-green-600 text-white`}>신청가능</span>;
            case '신청전':
                return <span className={`${base} bg-blue-200 text-blue-800`}>신청전</span>;
            case '신청마감':
                return <span className={`${base} bg-gray-500 text-white`}>신청마감</span>;
            default:
                return null;
        }
    };

    return (
        <div className="max-w-5xl mx-auto px-6 py-12 bg-white rounded-lg shadow-md">
            <div className="flex flex-wrap justify-between items-center gap-2 mb-6">
                <div>
                    <h2 className="text-2xl text-gray-800 font-semibold">프로그램 목록</h2>

                    {programs.content.length > 0 && (
                        <div className="text-center text-sm text-gray-500 mt-4">
                            총 {programs.totalElements}개의 프로그램이 등록되어있습니다.
                        </div>
                    )}
                </div>

                <div className="flex flex-wrap gap-2 items-center">
                    <SelectComponent
                        options={['신청상태', '신청전', '신청중', '신청마감']}
                        value={status || '신청상태'}
                        onChange={handleStatusChange}
                    />

                    <SelectComponent
                        options={{ 전체: 'all', 강좌명: 'progName', 내용: 'content' }}
                        value={option}
                        onChange={handleOptionChange}
                    />

                    <form onSubmit={handleSubmit} className="flex items-center gap-2">
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="검색어를 입력하세요"
                            className="p-2 px-4 border border-[#00893B] rounded-2xl focus:outline-none w-64"
                        />
                        <button
                            type="submit"
                            className="px-4 py-2 bg-[#00893B] text-white rounded-2xl hover:bg-[#006C2D] cursor-pointer">
                            검색
                        </button>
                    </form>
                </div>
            </div>

            {isLoading ? (
                <p>프로그램 목록을 불러오는 중입니다...</p>
            ) : error ? (
                <p className="text-red-500">{error}</p>
            ) : programs.content.length === 0 ? (
                <p>검색 결과가 없습니다.</p>
            ) : (
                <div className="grid gap-4">
                    {programs.content.map((program) => {
                        const status = getProgramStatus(program.applyStartAt, program.applyEndAt, program.current, program.capacity);
                        return (
                            <div key={program.progNo} className="relative p-7 border rounded-2xl shadow-sm bg-white flex justify-between items-start">
                                <div>
                                    <h3 className='text-lg font-bold mb-2 cursor-pointer hover:underline'
                                        onClick={() => navigate(`/reservation/program/${program.progNo}`)}>
                                        {program.progName}
                                    </h3>
                                    <p className="text-sm mb-2"><strong>신청기간:</strong> {dayjs(program.applyStartAt).format('YYYY-MM-DD HH:mm')} ~ {dayjs(program.applyEndAt).format('YYYY-MM-DD HH:mm')}</p>
                                    <p className="text-sm mb-2"><strong>운영기간:</strong> {program.startDate} ~ {program.endDate}</p>
                                    <p className="text-sm mb-2"><strong>수강대상:</strong> {program.target}</p>
                                    <p className="text-sm mb-2"><strong>모집인원:</strong> [선착순] {program.current} / {program.capacity}명</p>
                                </div>
                                <div className="ml-4 self-center">
                                    {renderStatusBadge(status)}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            <div className="mt-6">
                {renderPagination()}
            </div>
        </div>
    );
};

export default ProgramComponent;