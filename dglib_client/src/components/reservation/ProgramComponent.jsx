import React, { useEffect, useState, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { getUserProgramList } from '../../api/programApi';
import { usePagination } from '../../hooks/usePage';
import SearchSelectComponent from '../common/SearchSelectComponent';
import SelectComponent from '../common/SelectComponent';
import dayjs from 'dayjs';
import Loading from '../../routers/Loading';

const ProgramComponent = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const [programs, setPrograms] = useState({ content: [], pageable: {}, totalPages: 0 });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const status = searchParams.get('status') || '';
    const option = searchParams.get('option') || 'progName';
    const query = searchParams.get('query') || '';

    const searchFieldMap = {
        '전체': 'all',
        '강좌명': 'progName',
        '내용': 'content',
    };
    const searchOptions = Object.keys(searchFieldMap);

    const defaultCategory = useMemo(() => {
        const entry = Object.entries(searchFieldMap).find(([label, field]) => field === option);
        return entry ? entry[0] : '강좌명';
    }, [option]);

    const handleSearch = (input, selectedLabel) => {
        const realOption = searchFieldMap[selectedLabel];
        const newParams = new URLSearchParams(searchParams);
        newParams.set('option', realOption);
        newParams.set('query', input);
        newParams.set('page', '1');
        setSearchParams(newParams);
    };

    const { renderPagination } = usePagination(programs, searchParams, setSearchParams, isLoading);

    const handleStatusChange = (selected) => {
        const newParams = new URLSearchParams(searchParams);
        newParams.set('status', selected === '신청상태' ? '' : selected);
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
                sort: 'applyStartAt,desc'
            };

            const currentOption = searchParams.get('option') || 'progName';
            const currentQuery = searchParams.get('query') || '';

            if (currentQuery) {
                params.option = currentOption;
                params.query = currentQuery;
            }
            try {
                const data = await getUserProgramList(params);
                setPrograms(data);
            } catch (err) {
                setError("프로그램 목록을 불러오는 중 오류가 발생했습니다.");
                console.error("API 호출 오류:", err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchPrograms();
    }, [searchParams]);

    const getProgramStatus = (applyStartAt, applyEndAt, current, capacity) => {
        const now = new Date();
        const start = new Date(applyStartAt);
        const end = new Date(applyEndAt);

        if (now < start) return '신청전';
        if (now > end) return '신청마감';
        if (current >= capacity) return '모집마감';
        return '신청중';
    };

    const renderStatusBadge = (status) => {
        const base = "text-lg font-semibold whitespace-nowrap";

        switch (status) {
            case '신청중':
                return <span className={`${base} text-green-700`}>〔 신청가능 〕</span>;
            case '신청전':
                return <span className={`${base} text-blue-600`}>〔 신청전 〕</span>;
            case '모집마감':
                return <span className={`${base} text-gray-700`}>〔 모집마감 〕</span>;
            case '신청마감':
                return <span className={`${base} text-gray-700`}>〔 신청마감 〕</span>;
            default:
                return null;
        }
    };

    const statusPriority = {
        '신청중': 0,
        '신청전': 1,
        '모집마감': 2,
        '신청마감': 3
    };

    const finalPrograms = [...programs.content]
        .filter(program => {
            const currentStatus = getProgramStatus(program.applyStartAt, program.applyEndAt, program.current, program.capacity);

            // 아무 조건 없을 때는 모두 표시
            if (!status || status === '신청상태') return true;

            // 선택된 상태와 일치하는 것만 표시
            return currentStatus === status;
        })
        .sort((a, b) => {
            const aStatus = getProgramStatus(a.applyStartAt, a.applyEndAt, a.current, a.capacity);
            const bStatus = getProgramStatus(b.applyStartAt, b.applyEndAt, b.current, b.capacity);

            // 정렬 우선순위 지정
            if (!status || status === '신청상태') {
                const statusCompare = statusPriority[aStatus] - statusPriority[bStatus];
                if (statusCompare !== 0) return statusCompare;
            }

            return new Date(a.applyStartAt) - new Date(b.applyStartAt);
        });

    return (
        <div className="max-w-5xl mx-auto mt-20 mb-10 border border-gray-100 px-6 pt-10 sm:pt-10 md:pt-10 pb-16 bg-white rounded-lg shadow-md">
            <div className="flex flex-wrap justify-between items-center gap-2 mb-6">
                <div>
                    <h2 className="text-2xl text-gray-800 font-semibold">프로그램 목록</h2>
                    {programs.content.length > 0 && (
                        <div className="text-center text-sm text-gray-500 mt-5">
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
                    <SearchSelectComponent
                        options={searchOptions}
                        defaultCategory={defaultCategory}
                        input={query}
                        handleSearch={handleSearch}
                        selectClassName="mr-2"
                        dropdownClassName="w-32"
                        inputClassName="w-64"
                    />
                </div>
            </div>

            {isLoading ? (
                <Loading />
            ) : error ? (
                <p className="text-red-500">{error}</p>
            ) : finalPrograms.length === 0 ? (
                <p>검색 결과가 없습니다.</p>
            ) : (
                <div className="grid gap-4">
                    {finalPrograms.map((program) => {
                        const status = getProgramStatus(program.applyStartAt, program.applyEndAt, program.current, program.capacity);
                        return (
                            <div key={program.progNo} className="relative p-8 border-gray-700 rounded-2xl drop-shadow-sm bg-white flex justify-between items-start">
                                <div className='ml-8'>
                                    <h3 className='text-[22px] font-bold mb-4 cursor-pointer hover:text-green-700 hover:underline'
                                        onClick={() => navigate(`/reservation/program/${program.progNo}`)}>
                                        {program.progName}
                                    </h3>
                                    <div className='ml-2'>
                                        <p className="text-sm mb-2"><strong>신청기간:</strong> {dayjs(program.applyStartAt).format('YYYY-MM-DD HH:mm')} ~ {dayjs(program.applyEndAt).format('YYYY-MM-DD HH:mm')}</p>
                                        <p className="text-sm mb-2"><strong>수강기간:</strong> {program.startDate} ~ {program.endDate}</p>
                                        <p className="text-sm mb-2"><strong>수강대상:</strong> {program.target}</p>
                                        <p className="text-sm mb-2">
                                            <strong>모집인원:</strong> [선착순]{" "}
                                            <span className={`
                                            font-semibold
                                            ${program.current / program.capacity >= 0.8
                                                    ? "text-red-600"
                                                    : "text-blue-600"}
                                        `}>
                                                {program.current}
                                            </span> / {program.capacity}명
                                        </p>
                                    </div>
                                </div>
                                <div className="mr-8 self-center">
                                    {renderStatusBadge(status)}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            <div className="mt-6">{renderPagination()}</div>
        </div>
    );
};

export default ProgramComponent;
