import useStore from '@/hooks/useStore';
import Sidebar from './Sidebar/Sidebar';
import NoChatSelected from './Chat/NoChatSelected';
import ChatContainer from './Chat/ChatContainer';

const MessagePage = () => {
  const { selectedUser } = useStore((state) => state);

  return (
    <div className="h-screen bg-base-200">
      <div className="flex items-center justify-center pt-14 px-4">
        <div className="bg-base-100 rounded-lg shadow-cl w-full max-w-6xl h-[calc(100vh-8rem)]">
          <div className="flex h-full rounded-lg overflow-hidden">
            <Sidebar />

            {!selectedUser ? <NoChatSelected /> : <ChatContainer />}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessagePage;
