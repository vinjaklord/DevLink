import { useStore } from '@/hooks';
import ChatSidebar from '@/Components/Chat/ChatSidebar/ChatSidebar';
import NoChatSelected from '@/Components/Chat/NoChatSelected';
import ChatContainer from '@/Components/Chat/ChatContainer';

const ChatPage = () => {
  const { selectedUser } = useStore((state) => state);

  return (
    <div className="bg-base-200">
      <div className="flex items-center justify-center pt-10 px-4">
        <div className="bg-base-100 rounded-lg shadow-cl w-full max-w-6xl h-[calc(100vh-8rem)]">
          <div className="flex h-full rounded-lg overflow-hidden">
            <ChatSidebar />

            {!selectedUser ? <NoChatSelected /> : <ChatContainer />}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatPage;
