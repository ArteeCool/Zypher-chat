import { CheckCheck, Clock } from "lucide-react";

const YourMessage = ({
  children,
  timestamp,
  pending,
}: {
  children: React.ReactNode;
  timestamp: Date;
  pending?: boolean;
}) => {
  return (
    <div className="self-end max-w-1/2 rounded-[8px_8px_0px_8px] bg-[var(--primary)] px-3 py-1 flex gap-2 items-end m-1">
      <div className="text-white break-all whitespace-pre-wrap">{children}</div>
      {pending ? (
        <Clock className="w-4 h-4" />
      ) : (
        <CheckCheck className="w-4 h-4" />
      )}

      {timestamp && (
        <span className="text-xs">
          {timestamp.getHours()}:{timestamp.getMinutes()}
        </span>
      )}
    </div>
  );
};
export default YourMessage;
