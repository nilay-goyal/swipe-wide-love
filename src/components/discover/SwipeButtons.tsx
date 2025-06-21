
import { X, Heart } from 'lucide-react';

interface SwipeButtonsProps {
  onPass: () => void;
  onLike: () => void;
}

const SwipeButtons = ({ onPass, onLike }: SwipeButtonsProps) => {
  return (
    <div className="flex justify-center space-x-8 mt-8">
      <button
        onClick={onPass}
        className="w-16 h-16 bg-white rounded-full shadow-lg flex items-center justify-center hover:scale-110 transition-transform border-2 border-gray-200 hover:border-gray-300"
      >
        <X className="w-8 h-8 text-gray-500" />
      </button>
      <button
        onClick={onLike}
        className="w-16 h-16 dating-gradient rounded-full shadow-lg flex items-center justify-center hover:scale-110 transition-transform"
      >
        <Heart className="w-8 h-8 text-white" />
      </button>
    </div>
  );
};

export default SwipeButtons;
