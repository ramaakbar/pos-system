import { Loader2Icon } from "lucide-react";

export const LoadingScreen = () => {
  return (
    <main className="flex h-full items-center justify-center">
      <div className="animate-spin">
        <Loader2Icon className="size-12" />
      </div>
    </main>
  );
};
