import { Outlet } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import LiveChatButton from '../components/LiveChatButton';

export default function CustomerLayout() {
  return (
    <>
      <Header />
      <div className="flex-grow">
        <Outlet />
      </div>
      <Footer />
      <LiveChatButton />
    </>
  );
}
