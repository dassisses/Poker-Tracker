import { Navbar } from './Navbar';

export function Layout({ children }) {
    return (
        <div className="layout">
            <Navbar />
            <main className="container" style={{ padding: '2rem 1rem' }}>
                {children}
            </main>
        </div>
    );
}
