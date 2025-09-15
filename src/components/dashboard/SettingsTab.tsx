import React from "react";

import { Switch } from "@/components/ui/switch";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface SettingsTabProps {
  acceptMessages: boolean;
  onToggle: () => void;
  isSubmitting: boolean;
}

export const SettingsTab = ({
  acceptMessages,
  onToggle,
  isSubmitting,
}: SettingsTabProps): React.JSX.Element => (
  <Card>
    <CardHeader>
      <CardTitle>Message Settings</CardTitle>
      <CardDescription>Control your message preferences</CardDescription>
    </CardHeader>
    <CardContent>
      <div className="flex items-center justify-between p-4 border rounded-lg">
        <div className="space-y-0.5">
          <label
            htmlFor="accept-messages"
            className="text-base font-medium cursor-pointer"
          >
            Accept Messages
          </label>
          <p className="text-sm text-gray-500">
            {acceptMessages
              ? "You are currently accepting messages"
              : "You are not accepting messages at this time"}
          </p>
        </div>
        <Switch
          id="accept-messages"
          checked={acceptMessages}
          onCheckedChange={onToggle}
          disabled={isSubmitting}
        />
      </div>
    </CardContent>
  </Card>
);
