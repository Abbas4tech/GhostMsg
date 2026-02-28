import { LinkIcon } from "lucide-react";
import { useSession } from "next-auth/react";
import type React from "react";
import { useCallback, useMemo } from "react";
import { toast } from "sonner";
import { useIsClient } from "usehooks-ts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { CopyButton } from "../animate-ui/components/buttons/copy";

export const ProfileTab = (): React.JSX.Element => {
  const { data: session } = useSession();
  const isClient = useIsClient();

  const baseUrl = useMemo(
    () => (isClient ? window.location.origin : ""),
    [isClient]
  );
  const profileUrl = useMemo(
    () => `${baseUrl}/u/${session?.user?.username || ""}`,
    [baseUrl, session?.user?.username]
  );

  const copyToClipboard = useCallback(() => {
    toast.success("Profile link copied to clipboard!");
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Your Profile</CardTitle>
        <CardDescription>
          Share this link to receive anonymous messages
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Input className="flex-grow" disabled value={profileUrl} />

          <CopyButton content={profileUrl} onClick={copyToClipboard} />
        </div>
        <div className="flex items-center text-gray-500 text-sm">
          <LinkIcon className="mr-2 h-4 w-4" />
          Anyone with this link can send you anonymous messages
        </div>
      </CardContent>
    </Card>
  );
};
