import React from "react";
import { CopyIcon, LinkIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface ProfileTabProps {
  profileUrl: string;
  onCopy: () => void;
}

export const ProfileTab = ({
  profileUrl,
  onCopy,
}: ProfileTabProps): React.JSX.Element => (
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
        <Button onClick={onCopy} className="shrink-0">
          <CopyIcon className="h-4 w-4 mr-2" />
          Copy
        </Button>
      </div>
      <div className="flex items-center text-sm text-gray-500">
        <LinkIcon className="h-4 w-4 mr-2" />
        Anyone with this link can send you anonymous messages
      </div>
    </CardContent>
  </Card>
);
