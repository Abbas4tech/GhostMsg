"use client";

import type React from "react";
import { Badge } from "@/components/elements/badge";
import { Button } from "@/components/elements/button";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/elements/empty";
import { FieldDescription } from "@/components/elements/field";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/elements/table";
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@/components/elements/toggle-group";
import type { QuarantineSensitivity } from "@/types/api";
import {
  SettingRow,
  SettingsDivider,
  SettingsSection,
  SwitchSetting,
} from "./settings-section";

const SENSITIVITIES: { label: string; value: QuarantineSensitivity }[] = [
  { label: "Relaxed", value: "relaxed" },
  { label: "Balanced", value: "balanced" },
  { label: "Strict", value: "strict" },
];

const isSensitivity = (value: string): value is QuarantineSensitivity =>
  SENSITIVITIES.some((option) => option.value === value);

export interface BlockedSenderRow {
  blockedAt?: string;
  hash: string;
}

export interface SafetySettingsProps {
  blockedSenders: BlockedSenderRow[];
  blurSpicy: boolean;
  isUnblockPending?: boolean;
  onBlurSpicyChange: (value: boolean) => void;
  onQuarantineChange: (value: boolean) => void;
  onSensitivityChange: (value: QuarantineSensitivity) => void;
  onUnblock: (hash: string) => void;
  quarantineEnabled: boolean;
  sensitivity: QuarantineSensitivity;
}

/** "#7f3a…c1": a short, stable handle for an anonymous fingerprint. */
export const formatSenderHash = (hash: string): string =>
  `#${hash.slice(0, 4)}…${hash.slice(-2)}`;

const formatBlockedDate = (iso?: string): string =>
  iso
    ? new Date(iso).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
      })
    : "—";

/** Quarantine, sensitivity, Spicy blur and the blocked-senders table. */
export function SafetySettings({
  quarantineEnabled,
  onQuarantineChange,
  sensitivity,
  onSensitivityChange,
  blurSpicy,
  onBlurSpicyChange,
  blockedSenders,
  isUnblockPending = false,
  onUnblock,
}: SafetySettingsProps): React.JSX.Element {
  const count = blockedSenders.length;

  return (
    <SettingsSection id="safety" title="Safety & blocking">
      <SwitchSetting
        checked={quarantineEnabled}
        description="Flagged messages are held in Quarantined, blurred, never in your main inbox."
        onCheckedChange={onQuarantineChange}
        title="Quarantine toxic and spam"
      />
      <SettingsDivider />
      <SettingRow
        className="flex-wrap items-start"
        control={
          <ToggleGroup
            aria-label="Sensitivity"
            disabled={!quarantineEnabled}
            onValueChange={(value) => {
              if (isSensitivity(value)) {
                onSensitivityChange(value);
              }
            }}
            size="touch"
            type="single"
            value={sensitivity}
            variant="segment"
          >
            {SENSITIVITIES.map(({ value, label }) => (
              <ToggleGroupItem key={value} value={value}>
                {label}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        }
        description="Balanced holds back clearly hurtful or spammy messages. Strict also holds borderline ones."
        title="Sensitivity"
      />
      <SettingsDivider />
      <SwitchSetting
        checked={blurSpicy}
        description="Tap to reveal. Spicy is not the same as quarantined."
        onCheckedChange={onBlurSpicyChange}
        title="Blur Spicy 🔥 messages until opened"
      />
      <SettingsDivider />
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between gap-2">
          <b className="text-title">Blocked senders</b>
          <Badge variant="neutral">
            {count} {count === 1 ? "Sender Hash" : "Sender Hashes"}
          </Badge>
        </div>
        <FieldDescription>
          You never see who they are, and they aren&apos;t told. Blocking stops
          anything more from that Sender Hash.
        </FieldDescription>
        {count === 0 ? (
          <Empty className="border border-dashed p-6 md:p-6">
            <EmptyHeader>
              <EmptyTitle>No one is blocked</EmptyTitle>
              <EmptyDescription>
                Block a sender from any message card.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          <Table aria-label="Blocked senders">
            <TableHeader>
              <TableRow>
                <TableHead>Sender Hash</TableHead>
                <TableHead>Blocked</TableHead>
                <TableHead>
                  <span className="sr-only">Action</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {blockedSenders.map(({ hash, blockedAt }) => (
                <TableRow key={hash}>
                  <TableCell className="font-semibold tabular-nums">
                    {formatSenderHash(hash)}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {formatBlockedDate(blockedAt)}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      aria-label={`Unblock sender ${formatSenderHash(hash)}`}
                      className="rounded-full"
                      disabled={isUnblockPending}
                      onClick={() => onUnblock(hash)}
                      size="sm"
                      variant="outline"
                    >
                      Unblock
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </SettingsSection>
  );
}
