"use client";

import { useQuery } from "@tanstack/react-query";
import type React from "react";
import { useCallback } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Text } from "@/components/ui/text";
import { useAcceptMessageMutation } from "@/hooks/mutations/use-accept-message-mutation";
import { userQueries } from "@/queries/user.queries";

interface SettingsTabProps {
  acceptMessages?: boolean;
  isSubmitting?: boolean;
  onToggle?: () => void;
}

export const SettingsTab = ({
  acceptMessages: controlledAcceptMessages,
  isSubmitting: controlledIsSubmitting,
  onToggle: controlledOnToggle,
}: SettingsTabProps = {}): React.JSX.Element => {
  const { data: statusData } = useQuery(userQueries.acceptance());
  const acceptMutation = useAcceptMessageMutation();

  const isAccepting =
    controlledAcceptMessages ?? Boolean(statusData?.isAcceptingMessage ?? true);

  const isSubmitting = controlledIsSubmitting ?? acceptMutation.isPending;

  const handleToggle = useCallback(() => {
    if (controlledOnToggle) {
      controlledOnToggle();
      return;
    }
    acceptMutation.mutate(!isAccepting);
  }, [controlledOnToggle, acceptMutation, isAccepting]);

  return (
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
              {isAccepting
                ? "You are currently accepting messages"
                : "You are not accepting messages at this time"}
            </Text>
          </div>
          <Switch
            checked={isAccepting}
            disabled={isSubmitting}
            id="accept-messages"
            onCheckedChange={handleToggle}
          />
        </div>
      </CardContent>
    </Card>
  );
};
