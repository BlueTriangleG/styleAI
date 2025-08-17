import { useState, useEffect } from 'react';

interface TypewriterTextProps {
  text: string;
  speed?: number; // 每个字符显示的时间间隔（毫秒）
  delay?: number; // 开始打字前的延迟（毫秒）
  onComplete?: () => void; // 打字完成后的回调
  className?: string;
  startTyping?: boolean; // 控制是否开始打字的外部状态
}

export const TypewriterText: React.FC<TypewriterTextProps> = ({
  text,
  speed = 50,
  delay = 0,
  onComplete,
  className = '',
  startTyping = true,
}) => {
  const [displayedText, setDisplayedText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    if (!startTyping) {
      setDisplayedText('');
      setCurrentIndex(0);
      setIsTyping(false);
      return;
    }

    if (currentIndex === 0 && !isTyping) {
      const delayTimer = setTimeout(() => {
        setIsTyping(true);
      }, delay);

      return () => clearTimeout(delayTimer);
    }
  }, [startTyping, delay, currentIndex, isTyping]);

  useEffect(() => {
    if (!isTyping || currentIndex >= text.length) {
      if (currentIndex >= text.length && onComplete) {
        onComplete();
      }
      return;
    }

    const timer = setTimeout(() => {
      setDisplayedText(text.slice(0, currentIndex + 1));
      setCurrentIndex(currentIndex + 1);
    }, speed);

    return () => clearTimeout(timer);
  }, [isTyping, currentIndex, text, speed, onComplete]);

  return (
    <span className={className}>
      {displayedText}
      {isTyping && currentIndex < text.length && (
        <span className="animate-pulse">|</span>
      )}
    </span>
  );
};