"use client";

import { BanIcon, ShieldCheckIcon } from "lucide-react";
import type React from "react";
import { useCallback } from "react";
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
  SettingsListRow,
  SettingsListRowBody,
  SettingsSection,
  SwitchSetting,
  useSettingsLayout,
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

function BlockedSenderTableRow({
  hash,
  blockedAt,
  isUnblockPending,
  onUnblock,
}: {
  blockedAt?: string;
  hash: string;
  isUnblockPending: boolean;
  onUnblock: (hash: string) => void;
}): React.JSX.Element {
  const handleUnblock = useCallback(() => {
    onUnblock(hash);
  }, [onUnblock, hash]);

  return (
    <TableRow>
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
          onClick={handleUnblock}
          size="sm"
          variant="outline"
        >
          Unblock
        </Button>
      </TableCell>
    </TableRow>
  );
}

/** Phone layout: one blocked sender as a list row instead of a table row. */
function BlockedSenderListRow({
  hash,
  blockedAt,
  isUnblockPending,
  onUnblock,
}: {
  blockedAt?: string;
  hash: string;
  isUnblockPending: boolean;
  onUnblock: (hash: string) => void;
}): React.JSX.Element {
  const handleUnblock = useCallback(() => {
    onUnblock(hash);
  }, [onUnblock, hash]);
  const label = formatSenderHash(hash);

  return (
    <SettingsListRow>
      <SettingsListRowBody
        description={`Blocked ${formatBlockedDate(blockedAt)}`}
        icon={<BanIcon />}
        title={`Sender ${label}`}
      />
      <Button
        aria-label={`Unblock sender ${label}`}
        className="h-11 rounded-full px-5"
        disabled={isUnblockPending}
        onClick={handleUnblock}
        variant="outline"
      >
        Unblock
      </Button>
    </SettingsListRow>
  );
}

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
  const isList = useSettingsLayout() === "list";
  const count = blockedSenders.length;
  const sensitivityLabel =
    SENSITIVITIES.find((option) => option.value === sensitivity)?.label ??
    "Balanced";
  const handleSensitivityChange = useCallback(
    (value: string) => {
      if (isSensitivity(value)) {
        onSensitivityChange(value);
      }
    },
    [onSensitivityChange]
  );

  return (
    <SettingsSection
      icon={<ShieldCheckIcon />}
      id="safety"
      summary={`${quarantineEnabled ? sensitivityLabel : "Quarantine off"} · ${count} blocked`}
      title="Safety & blocking"
    >
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
            className={isList ? "w-full *:flex-1" : undefined}
            disabled={!quarantineEnabled}
            onValueChange={handleSensitivityChange}
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
        ) : null}
        {count > 0 && isList ? (
          <ul
            aria-label="Blocked senders"
            className="divide-y overflow-hidden rounded-xl border"
          >
            {blockedSenders.map(({ hash, blockedAt }) => (
              <li key={hash}>
                <BlockedSenderListRow
                  blockedAt={blockedAt}
                  hash={hash}
                  isUnblockPending={isUnblockPending}
                  onUnblock={onUnblock}
                />
              </li>
            ))}
          </ul>
        ) : null}
        {count > 0 && !isList ? (
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
                <BlockedSenderTableRow
                  blockedAt={blockedAt}
                  hash={hash}
                  isUnblockPending={isUnblockPending}
                  key={hash}
                  onUnblock={onUnblock}
                />
              ))}
            </TableBody>
          </Table>
        ) : null}
      </div>
    </SettingsSection>
  );
}
