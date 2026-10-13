import { MessageCircleHeart } from "lucide-react";
import type React from "react";
import { Text } from "@/components/elements/text";
import { cn } from "@/lib/utils";

export const DEFAULT_AMA_PROMPT =
  "Send me an anonymous message, confession, or question!";

export interface AmaBannerProps extends React.HTMLAttributes<HTMLDivElement> {
  prompt?: string | null;
  username: string;
}

/** Recipient header with avatar mark, @handle and the AMA prompt bubble. */
export function AmaBanner({
  username,
  prompt,
  className,
  ...props
}: AmaBannerProps): React.JSX.Element {
  return (
    <div
      className={cn(
        "mx-auto flex w-full max-w-2xl flex-col items-center text-center",
        className
      )}
      data-slot="ama-banner"
      {...props}
    >
      <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-purple-600 to-pink-500 text-white shadow-lg">
        <MessageCircleHeart className="h-7 w-7" />
      </div>

      <Text
        as="h1"
        className="font-bold text-2xl tracking-tight sm:text-3xl"
        variant="h1"
      >
        @{username}
      </Text>

      <div className="mt-3 rounded-xl border border-purple-500/20 bg-purple-500/5 px-4 py-2.5 shadow-xs backdrop-blur-xs">
        <p className="font-medium text-foreground text-sm sm:text-base">
          ✨ {prompt || DEFAULT_AMA_PROMPT}
        </p>
      </div>
    </div>
  );
}

export default AmaBanner;
