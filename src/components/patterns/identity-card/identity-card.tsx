"use client";

import type React from "react";
import { useId, useRef } from "react";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/elements/avatar";
import { Button } from "@/components/elements/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/elements/card";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/elements/field";
import { Input } from "@/components/elements/input";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
  InputGroupText,
} from "@/components/elements/input-group";
import { Spinner } from "@/components/elements/spinner";

export const DISPLAY_NAME_MAX_LENGTH = 40;

export interface IdentityCardProps {
  avatarUrl?: string | null;
  displayName: string;
  isPhotoProcessing?: boolean;
  /** "ghostmsg.app/u/" style prefix shown before the username. */
  linkPrefix: string;
  onChangeUsername: () => void;
  onDisplayNameChange: (value: string) => void;
  onPhotoRemove: () => void;
  onPhotoSelect: (file: File) => void;
  username: string;
}

/** Identity: photo, display name and username (opens a change dialog). */
export function IdentityCard({
  username,
  displayName,
  avatarUrl,
  linkPrefix,
  isPhotoProcessing = false,
  onDisplayNameChange,
  onPhotoSelect,
  onPhotoRemove,
  onChangeUsername,
}: IdentityCardProps): React.JSX.Element {
  const fileRef = useRef<HTMLInputElement>(null);
  const displayNameId = useId();
  const usernameId = useId();
  const photoHintId = useId();
  const initial = (displayName || username).charAt(0);

  return (
    <Card data-slot="identity-card" variant="elevated">
      <CardHeader>
        <CardTitle>
          <h2 className="text-h2">Identity</h2>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <FieldGroup>
          <div className="flex flex-wrap items-center gap-4">
            <Avatar size="2xl">
              {avatarUrl ? <AvatarImage alt="" src={avatarUrl} /> : null}
              <AvatarFallback variant="brand">{initial}</AvatarFallback>
            </Avatar>
            <div className="flex flex-col gap-2">
              <div className="flex gap-2">
                <Button
                  aria-describedby={photoHintId}
                  className="rounded-full"
                  disabled={isPhotoProcessing}
                  onClick={() => fileRef.current?.click()}
                  size="sm"
                  variant="outline"
                >
                  {isPhotoProcessing ? (
                    <Spinner data-icon="inline-start" />
                  ) : null}
                  Change photo
                </Button>
                {avatarUrl ? (
                  <Button
                    className="rounded-full"
                    onClick={onPhotoRemove}
                    size="sm"
                    variant="ghost"
                  >
                    Remove
                  </Button>
                ) : null}
              </div>
              <FieldDescription id={photoHintId}>
                Optional. Initials are used if you skip it.
              </FieldDescription>
              <input
                accept="image/png,image/jpeg,image/webp"
                aria-label="Upload a profile photo"
                className="sr-only"
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (file) {
                    onPhotoSelect(file);
                  }
                  event.target.value = "";
                }}
                ref={fileRef}
                tabIndex={-1}
                type="file"
              />
            </div>
          </div>

          <Field>
            <div className="flex items-center justify-between">
              <FieldLabel htmlFor={displayNameId}>Display name</FieldLabel>
              <span className="text-muted-foreground text-xs tabular-nums">
                {displayName.length} / {DISPLAY_NAME_MAX_LENGTH}
              </span>
            </div>
            <Input
              className="h-12 bg-card text-body"
              id={displayNameId}
              maxLength={DISPLAY_NAME_MAX_LENGTH}
              onChange={(event) => onDisplayNameChange(event.target.value)}
              placeholder={username}
              value={displayName}
            />
          </Field>

          <Field>
            <FieldLabel htmlFor={usernameId}>Username</FieldLabel>
            <InputGroup size="lg">
              <InputGroupAddon>
                <InputGroupText>{linkPrefix}</InputGroupText>
              </InputGroupAddon>
              <InputGroupInput
                className="pl-0 font-semibold"
                id={usernameId}
                readOnly
                value={username}
              />
              <InputGroupAddon align="inline-end">
                <InputGroupButton
                  onClick={onChangeUsername}
                  size="sm"
                  variant="secondary"
                >
                  Change
                </InputGroupButton>
              </InputGroupAddon>
            </InputGroup>
            <FieldDescription>
              Changing it changes your link. The old link stops working, so
              update your bio.
            </FieldDescription>
          </Field>
        </FieldGroup>
      </CardContent>
    </Card>
  );
}

export default IdentityCard;
