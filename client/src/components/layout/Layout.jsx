import Sidebar from './Sidebar';
import Footer from './Footer';

export default function Layout({ children }) {
  return (
    <div className="app-bg flex min-h-screen">
      <Sidebar />
      <div className="flex min-h-screen flex-1 flex-col lg:pl-0">
        <main className="flex-1 px-4 py-8 pt-16 lg:px-10 lg:py-10 lg:pt-10">
          <div className="mx-auto max-w-4xl animate-fade-up">{children}</div>
        </main>
        <Footer />
      </div>
    </div>
  );
}
