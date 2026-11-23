export function QuizAudioRetry({ retry }: { retry: () => void }) {
  return (
    <div className="quiz-audio-retry">
      <span role="status">声音没播出来，可以再听一次。</span>
      <button type="button" className="scenic-tool-btn quiz-hint-button" onClick={retry}>重新播放录音</button>
    </div>
  );
}
