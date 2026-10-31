"use client";

import { DownloadIcon, LogOutIcon, Trash2Icon, XIcon } from "lucide-react";
import type React from "react";
import { useCallback } from "react";
import { Accordion } from "@/components/elements/accordion";
import { Button } from "@/components/elements/button";
import { FieldDescription } from "@/components/elements/field";
import type { MessageExportFormat } from "@/lib/messages/export";
import { cn } from "@/lib/utils";
import {
  SettingRow,
  SettingsDivider,
  SettingsListButton,
  SettingsListGroup,
  SettingsSection,
  useSettingsLayout,
} from "./settings-section";

const EXPORT_DESCRIPTION =
  "Messages, answers and Sentiment Tags. Sender Hashes are not included.";

export interface DataSettingsProps {
  /** Export in progress: both buttons wait. */
  isExporting?: boolean;
  onExport: (format: MessageExportFormat) => void;
  /** Phones only: the design puts Sign out under Data & account. */
  onSignOut?: () => void;
}

function ExportButtons({
  isExporting,
  onExport,
  size,
}: {
  isExporting: boolean;
  onExport: (format: MessageExportFormat) => void;
  size: "sm" | "touch";
}): React.JSX.Element {
  const handleExportCsv = useCallback(() => {
    onExport("csv");
  }, [onExport]);
  const handleExportJson = useCallback(() => {
    onExport("json");
  }, [onExport]);
  const className = cn("rounded-full", size === "touch" && "h-11 px-5");
  const buttonSize = size === "touch" ? "default" : "sm";

  return (
    <div className="flex gap-2">
      <Button
        className={className}
        disabled={isExporting}
        onClick={handleExportCsv}
        size={buttonSize}
        variant="outline"
      >
        <DownloadIcon data-icon="inline-start" />
        CSV
      </Button>
      <Button
        className={className}
        disabled={isExporting}
        onClick={handleExportJson}
        size={buttonSize}
        variant="outline"
      >
        <DownloadIcon data-icon="inline-start" />
        JSON
      </Button>
    </div>
  );
}

/** Export every message as CSV or JSON (and, on phones, Sign out). */
export function DataSettings({
  onExport,
  onSignOut,
  isExporting = false,
}: DataSettingsProps): React.JSX.Element {
  if (useSettingsLayout() === "list") {
    return (
      <SettingsListGroup label="Data & account">
        <Accordion collapsible type="single">
          <SettingsSection
            icon={<DownloadIcon />}
            id="data"
            summary="CSV or JSON"
            title="Export messages"
          >
            <FieldDescription>{EXPORT_DESCRIPTION}</FieldDescription>
            <ExportButtons
              isExporting={isExporting}
              onExport={onExport}
              size="touch"
            />
          </SettingsSection>
        </Accordion>
        {onSignOut ? (
          <SettingsListButton
            icon={<LogOutIcon />}
            onClick={onSignOut}
            title="Sign out"
          />
        ) : null}
      </SettingsListGroup>
    );
  }

  return (
    <SettingsSection id="data" title="Data & account">
      <SettingRow
        className="flex-wrap"
        control={
          <ExportButtons
            isExporting={isExporting}
            onExport={onExport}
            size="sm"
          />
        }
        description={EXPORT_DESCRIPTION}
        title="Export all messages"
      />
    </SettingsSection>
  );
}

export interface DangerZoneProps {
  onDeleteAccount: () => void;
  onDeleteAll: () => void;
}

/** Delete all messages / delete the account (both confirm in a dialog). */
export function DangerZone({
  onDeleteAll,
  onDeleteAccount,
}: DangerZoneProps): React.JSX.Element {
  if (useSettingsLayout() === "list") {
    return (
      <SettingsListGroup label="Danger zone" tone="danger">
        <SettingsListButton
          description="10 seconds to undo"
          icon={<Trash2Icon />}
          onClick={onDeleteAll}
          title="Delete all messages"
          tone="danger"
        />
        <SettingsListButton
          description="Type your username to confirm"
          icon={<XIcon />}
          onClick={onDeleteAccount}
          title="Delete account and link"
          tone="danger"
        />
      </SettingsListGroup>
    );
  }

  return (
    <SettingsSection id="danger" title="Danger zone" tone="danger">
      <SettingRow
        control={
          <Button
            className="rounded-full border-destructive text-destructive hover:bg-destructive/10 hover:text-destructive"
            onClick={onDeleteAll}
            size="sm"
            variant="outline"
          >
            Delete all
          </Button>
        }
        description="Public answers go too. You get 10 seconds to undo."
        title="Delete all messages"
      />
      <SettingsDivider />
      <SettingRow
        control={
          <Button
            className="rounded-full"
            onClick={onDeleteAccount}
            size="sm"
            variant="destructive"
          >
            Delete account
          </Button>
        }
        description="You'll type your username to confirm. This can't be undone."
        title="Delete account and link"
      />
    </SettingsSection>
  );
}
