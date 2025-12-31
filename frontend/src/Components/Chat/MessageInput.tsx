import { useRef, useState } from 'react';
import useStore from '@/hooks/useStore';
import { X, Image, Send } from 'lucide-react';
import { toast } from 'sonner';

const MessageInput = () => {
  const [text, setText] = useState<string>('');
  const [imagePreview, setImagePreview] = useState<string | ArrayBuffer | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const { sendMessage } = useStore();

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result);
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSendMessage = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const file = fileInputRef.current?.files?.[0];

    if (!text.trim() && !file) return;

    const formData = new FormData();
    formData.append('text', text.trim());

    if (file) {
      formData.append('image', file);
    }

    try {
      sendMessage(formData);
      setText('');
      setImagePreview(null);

      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  return (
    <div className="p-4 w-full border-t border-border bg-background">
      {imagePreview && (
        <div className="mb-3 flex items-center gap-2">
          <div className="relative">
            <img
              src={typeof imagePreview === 'string' ? imagePreview : ''}
              alt="Preview"
              className="w-20 h-20 object-cover rounded-lg border border-border"
            />
            <button
              onClick={removeImage}
              className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-base-300 flex items-center justify-center hover:bg-base-200 transition"
              type="button"
            >
              <X className="size-3 text-muted-foreground" />
            </button>
          </div>
        </div>
      )}

      <form onSubmit={handleSendMessage} className="flex items-center gap-2">
        <div className="flex-1 flex gap-2">
          <input
            type="text"
            className="w-full px-4 py-2 rounded-lg bg-base-200 border border-border text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary transition"
            placeholder="Type a message..."
            value={text}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setText(e.target.value)}
          />

          <input
            type="file"
            accept="image/*"
            className="hidden"
            ref={fileInputRef}
            onChange={handleImageChange}
          />

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className={`hidden sm:flex items-center justify-center w-10 h-10 rounded-full transition ${
              imagePreview
                ? 'bg-emerald-100 text-emerald-600 hover:bg-emerald-200'
                : 'bg-base-300 text-muted-foreground hover:bg-base-200'
            }`}
          >
            <Image size={20} />
          </button>
        </div>

        <button
          type="submit"
          disabled={!text.trim() && !imagePreview}
          className="w-10 h-10 rounded-full flex items-center justify-center bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition"
        >
          <Send size={22} />
        </button>
      </form>
    </div>
  );
};

export default MessageInput;
