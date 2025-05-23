const ApplyFacilityFormComponent = () => {

    return (
        <div className="max-w-3xl mx-auto px-6 py-12 bg-white rounded shadow">
            <h2 className="text-2xl font-bold mb-6">신청접수</h2>
            {error && <p className="text-red-500 mb-4">{error}</p>}
            <form onSubmit={handleSubmit} className="space-y-6 text-sm">
                
            </form>
        </div>
    )

}

export default ApplyFacilityFormComponent;