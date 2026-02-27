import React, { useCallback, useMemo } from "react";
import { CopyIcon, LinkIcon } from "lucide-react";
import { toast } from "sonner";
import { useIsClient } from "usehooks-ts";
import { useSession } from "next-auth/react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
          <Input value={profileUrl} disabled className="flex-grow" />
         
            <CopyButton onClick={copyToClipboard} content={profileUrl}/>

        </div>
        <div className="flex items-center text-sm text-gray-500">
          <LinkIcon className="h-4 w-4 mr-2" />
          Anyone with this link can send you anonymous messages
        </div>
      </CardContent>
    </Card>
  );
};
