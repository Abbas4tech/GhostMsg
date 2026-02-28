import type React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Text } from "../ui/text";

interface SettingsTabProps {
  acceptMessages: boolean;
  isSubmitting: boolean;
  onToggle: () => void;
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
      <div className="flex items-center justify-between rounded-lg border p-4">
        <div className="space-y-0.5">
          <label
            className="cursor-pointer font-medium text-base"
            htmlFor="accept-messages"
          >
            Accept Messages
          </label>
          <Text variant={"muted"}>
            {acceptMessages
              ? "You are currently accepting messages"
              : "You are not accepting messages at this time"}
          </Text>
        </div>
        <Switch
          checked={acceptMessages}
          disabled={isSubmitting}
          id="accept-messages"
          onCheckedChange={onToggle}
        />
      </div>
    </CardContent>
  </Card>
);
