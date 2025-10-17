import './globals.css';
import TopNav from '../components/TopNav';
import TxBadge from '../components/TxBadge';
export const metadata = { title: 'Voss Taxi' };
export default function RootLayout({ children }: { children: React.ReactNode }){
  return (
    <html lang="nn">
      <body>
        <TopNav/>
        <div className="container">{children}</div>
        <TxBadge/>
      </body>
    </html>
  );
}
