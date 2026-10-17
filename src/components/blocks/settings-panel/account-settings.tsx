"use client";

import { DownloadIcon } from "lucide-react";
import type React from "react";
import { useCallback } from "react";
import { Button } from "@/components/elements/button";
import type { MessageExportFormat } from "@/lib/messages/export";
import {
  SettingRow,
  SettingsDivider,
  SettingsSection,
} from "./settings-section";

export interface DataSettingsProps {
  /** Export in progress: both buttons wait. */
  isExporting?: boolean;
  onExport: (format: MessageExportFormat) => void;
}

/** Export every message as CSV or JSON. */
export function DataSettings({
  onExport,
  isExporting = false,
}: DataSettingsProps): React.JSX.Element {
  const handleExportCsv = useCallback(() => {
    onExport("csv");
  }, [onExport]);
  const handleExportJson = useCallback(() => {
    onExport("json");
  }, [onExport]);

  return (
    <SettingsSection id="data" title="Data & account">
      <SettingRow
        className="flex-wrap"
        control={
          <div className="flex gap-2">
            <Button
              className="rounded-full"
              disabled={isExporting}
              onClick={handleExportCsv}
              size="sm"
              variant="outline"
            >
              <DownloadIcon data-icon="inline-start" />
              CSV
            </Button>
            <Button
              className="rounded-full"
              disabled={isExporting}
              onClick={handleExportJson}
              size="sm"
              variant="outline"
            >
              <DownloadIcon data-icon="inline-start" />
              JSON
            </Button>
          </div>
        }
        description="Messages, answers and Sentiment Tags. Sender Hashes are not included."
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
