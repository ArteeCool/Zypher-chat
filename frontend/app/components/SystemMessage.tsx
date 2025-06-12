const SystemMessage = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="self-center max-w-1/2 rounded-lg bg-neutral-600 px-3 py-1 text-white break-all whitespace-pre-wrap">
      <div className="flex items-end gap-1">{children}</div>
    </div>
  );
};
export default SystemMessage;
