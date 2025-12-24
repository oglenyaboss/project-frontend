import { useState, useRef, useEffect } from "react";
import { Send, SkipForward, Loader2, Mic, MicOff } from "lucide-react";
import { Button, Textarea } from "@/shared/ui";
import { cn } from "@/shared/lib/utils";

// Web Speech API interfaces
interface SpeechRecognitionEvent extends Event {
  resultIndex: number;
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
  message: string;
}

interface ISpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onresult: (event: SpeechRecognitionEvent) => void;
  onerror: (event: SpeechRecognitionErrorEvent) => void;
  onend: () => void;
}

// Add constructor type
interface SpeechRecognitionConstructor {
  new (): ISpeechRecognition;
}

interface IWindow extends Window {
  webkitSpeechRecognition: SpeechRecognitionConstructor;
  SpeechRecognition: SpeechRecognitionConstructor;
}

interface AnswerInputProps {
  onSubmit: (text: string) => void;
  onSkip?: () => void;
  isSubmitting?: boolean;
  canSkip?: boolean;
  disabled?: boolean;
  placeholder?: string;
}

export function AnswerInput({
  onSubmit,
  onSkip,
  isSubmitting = false,
  canSkip = true,
  disabled = false,
  placeholder = "Введите ваш ответ...",
}: AnswerInputProps) {
  const [value, setValue] = useState("");
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<ISpeechRecognition | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const { webkitSpeechRecognition, SpeechRecognition } =
        window as unknown as IWindow;
      const SpeechRecognitionConstructor =
        SpeechRecognition || webkitSpeechRecognition;

      if (SpeechRecognitionConstructor) {
        const recognition = new SpeechRecognitionConstructor();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = "ru-RU";

        recognition.onresult = (event: SpeechRecognitionEvent) => {
          let finalTranscript = "";
          for (let i = event.resultIndex; i < event.results.length; ++i) {
            if (event.results[i].isFinal) {
              finalTranscript += event.results[i][0].transcript;
            }
          }
          if (finalTranscript) {
            setValue((prev) => {
              const newValue = prev
                ? `${prev} ${finalTranscript}`
                : finalTranscript;
              return newValue.trim();
            });
          }
        };

        recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
          console.error("Speech recognition error", event.error);
          setIsListening(false);
        };

        recognition.onend = () => {
          setIsListening(false);
        };

        recognitionRef.current = recognition;
      }
    }
  }, []);

  const toggleListening = () => {
    if (!recognitionRef.current) return;

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  const handleSubmit = () => {
    if (!value.trim()) return;
    onSubmit(value);
    setValue("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const hasSpeechSupport =
    typeof window !== "undefined" &&
    !!(
      (window as unknown as IWindow).webkitSpeechRecognition ||
      (window as unknown as IWindow).SpeechRecognition
    );

  return (
    <div className="p-4 bg-background border-t">
      <div className="relative">
        <Textarea
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={isListening ? "Слушаю..." : placeholder}
          disabled={disabled || isSubmitting}
          className={cn(
            "min-h-[80px] max-h-[200px] pr-24 resize-none rounded-xl transition-all duration-300",
            isListening &&
              "ring-2 ring-red-500/50 border-red-500/50 bg-red-500/5",
          )}
        />
        <div className="absolute bottom-2 right-2 flex gap-2">
          {/* Voice Input Button */}
          {hasSpeechSupport && (
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleListening}
              disabled={disabled || isSubmitting}
              className={cn(
                "h-8 w-8 p-0 rounded-lg transition-all duration-300",
                isListening
                  ? "bg-red-500 text-white hover:bg-red-600 animate-pulse"
                  : "hover:bg-muted text-muted-foreground",
              )}
              title={isListening ? "Остановить запись" : "Голосовой ввод"}
            >
              {isListening ? (
                <MicOff className="h-4 w-4" />
              ) : (
                <Mic className="h-4 w-4" />
              )}
            </Button>
          )}

          {canSkip && onSkip && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onSkip}
              disabled={disabled || isSubmitting}
              className="h-8 w-8 p-0 rounded-lg hover:bg-muted"
              title="Пропустить вопрос"
            >
              <SkipForward className="h-4 w-4 text-muted-foreground" />
            </Button>
          )}
          <Button
            size="sm"
            onClick={handleSubmit}
            disabled={!value.trim() || disabled || isSubmitting}
            className="h-8 w-8 p-0 rounded-lg"
          >
            {isSubmitting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>
      <div className="flex justify-between items-center mt-2 px-1">
        <p className="text-xs text-muted-foreground">Enter для отправки</p>
        {isListening && (
          <span className="text-xs text-red-500 font-medium animate-pulse flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
            Запись...
          </span>
        )}
      </div>
    </div>
  );
}
