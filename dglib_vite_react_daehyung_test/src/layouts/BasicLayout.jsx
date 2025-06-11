import Menu from '../components/Menu';

const BasicLayout = ({children}) => {
    return (
        <div className="min-h-screen bg-gray-100">
            <Menu />
            <div className="container mx-auto px-4 py-6">
                <main className="bg-white p-6 rounded shadow">
                    {children}
                </main>
            </div>
        </div>
    );
}

export default BasicLayout;