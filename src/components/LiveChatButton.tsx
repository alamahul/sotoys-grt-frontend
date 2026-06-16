import { useState } from 'react';
import { MessageSquare, X, Send } from 'lucide-react';

export default function LiveChatButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<{sender: 'user' | 'admin', text: string}[]>([
    { sender: 'admin', text: 'Halo! Ada yang bisa kami bantu? SOTOYS siap melayani!' }
  ]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;
    
    setMessages(prev => [...prev, { sender: 'user', text: message }]);
    setMessage('');
    
    // Simulate auto-reply
    setTimeout(() => {
      setMessages(prev => [...prev, { sender: 'admin', text: 'Terima kasih telah menghubungi kami. Admin akan segera merespon pesan Anda.' }]);
    }, 1000);
  };

  return (
    <>
      {/* Floating Button */}
      <button 
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 right-6 p-4 bg-orange-600 text-white rounded-full shadow-lg hover:bg-orange-700 transition-all focus:outline-none focus:ring-4 focus:ring-orange-300 z-50 ${isOpen ? 'hidden' : 'block'}`}
        aria-label="Buka Live Chat"
      >
        <MessageSquare size={24} />
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col z-50 overflow-hidden" style={{ height: '500px', maxHeight: '80vh' }}>
          {/* Header */}
          <div className="bg-orange-600 p-4 text-white flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <MessageSquare size={20} />
              <h3 className="font-bold">CS SOTOYS</h3>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-orange-100 hover:text-white focus:outline-none" aria-label="Tutup Live Chat">
              <X size={20} />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-grow p-4 overflow-y-auto bg-gray-50 flex flex-col space-y-3">
            {messages.map((msg, idx) => (
              <div key={idx} className={`max-w-[80%] rounded-lg px-4 py-2 ${msg.sender === 'user' ? 'bg-orange-100 text-orange-900 self-end rounded-br-none' : 'bg-white border border-gray-200 text-gray-800 self-start rounded-bl-none'}`}>
                <p className="text-sm">{msg.text}</p>
              </div>
            ))}
          </div>

          {/* Input form */}
          <form onSubmit={handleSend} className="border-t border-gray-200 p-3 bg-white flex items-center space-x-2">
            <input 
              type="text" 
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Ketik pesan..." 
              className="flex-grow text-sm py-2 px-3 bg-gray-100 border-transparent rounded-full focus:outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white"
            />
            <button 
              type="submit" 
              disabled={!message.trim()}
              className="p-2 rounded-full bg-orange-600 text-white disabled:bg-gray-300 hover:bg-orange-700 transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500"
              aria-label="Kirim Pesan"
            >
              <Send size={18} className="ml-0.5" />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
