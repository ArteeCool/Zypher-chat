const OpponentMessage = ({
  children,
  timestamp,
}: {
  children: React.ReactNode;
  timestamp: Date;
}) => {
  if (!timestamp) return;
  return (
    <div className="self-start max-w-1/2 rounded-[8px_8px_8px_0px] bg-green-900 px-3 py-1 text-white flex items-end gap-1 m-1">
      <div className="text-white break-all whitespace-pre-wrap">{children}</div>
      <span className="text-xs">
        {timestamp.getHours()}:{timestamp.getMinutes()}
      </span>
    </div>
  );
};
export default OpponentMessage;
