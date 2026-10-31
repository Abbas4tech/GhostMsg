"use client";

import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useCallback, useMemo, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { notify } from "@/components/elements/sonner";
import { useAmaSuggestionsMutation } from "@/data/user/use-ama-suggestions-mutation";
import { useUpdateProfileMutation } from "@/data/user/use-update-profile-mutation";
import { userQueries } from "@/data/user/user.queries";
import { useLeaveGuard } from "@/hooks/use-leave-guard";
import { resizeImageToDataUrl } from "@/lib/browser/resize-image";
import { toLinkPrefix } from "./dashboard.utils";
import { buildProfilePatch, type ProfileFormValues } from "./profile.utils";
import { useProfileLinkController } from "./use-profile-link.controller";

const EMPTY_PROFILE: ProfileFormValues = {
  amaPrompt: "",
  avatarUrl: null,
  displayName: "",
  showAmaBanner: true,
};

/** Programmatic edits count as user edits (dirty) for the unsaved bar. */
const AS_EDIT = { shouldDirty: true } as const;

/**
 * Profile page: identity, link, AMA Prompt and the live preview. Edits live
 * in a react-hook-form draft fed by the server profile (`values`), shown in
 * the preview, saved as one atomic PATCH, and protected from accidental
 * navigation by the leave guard.
 */
export function useProfileController() {
  const router = useRouter();
  const link = useProfileLinkController();
  const { data: profileData } = useQuery(userQueries.profile());
  const { data: acceptanceData } = useQuery(userQueries.acceptance());
  const { mutateAsync: saveProfile, isPending: isSaving } =
    useUpdateProfileMutation();
  const suggestMutation = useAmaSuggestionsMutation();

  const saved = profileData?.profile;
  const serverValues = useMemo<ProfileFormValues>(
    () =>
      saved
        ? {
            amaPrompt: saved.amaPrompt ?? "",
            avatarUrl: saved.avatarUrl ?? null,
            displayName: saved.displayName ?? "",
            showAmaBanner: saved.showAmaBanner ?? true,
          }
        : EMPTY_PROFILE,
    [saved]
  );

  // `values` keeps the form in step with the server; fields the recipient is
  // editing are kept (keepDirtyValues) when a refetch lands.
  const form = useForm<ProfileFormValues>({
    resetOptions: { keepDirtyValues: true },
    values: serverValues,
  });
  const values = useWatch({ control: form.control }) as ProfileFormValues;
  const { isDirty, dirtyFields } = form.formState;

  const [isPhotoProcessing, setIsPhotoProcessing] = useState(false);
  const [aiIdeas, setAiIdeas] = useState<string[]>([]);

  const { setValue, reset, getValues } = form;
  const setDisplayName = useCallback(
    (displayName: string) => setValue("displayName", displayName, AS_EDIT),
    [setValue]
  );
  const setAmaPrompt = useCallback(
    (amaPrompt: string) => setValue("amaPrompt", amaPrompt, AS_EDIT),
    [setValue]
  );
  const setShowAmaBanner = useCallback(
    (showAmaBanner: boolean) =>
      setValue("showAmaBanner", showAmaBanner, AS_EDIT),
    [setValue]
  );
  const setAvatarUrl = useCallback(
    (avatarUrl: string | null) => setValue("avatarUrl", avatarUrl, AS_EDIT),
    [setValue]
  );

  const handlePhotoSelect = useCallback(
    async (file: File) => {
      setIsPhotoProcessing(true);
      try {
        setAvatarUrl(await resizeImageToDataUrl(file));
      } catch {
        notify.error("Couldn't read that image. Try a PNG, JPEG or WebP.");
      } finally {
        setIsPhotoProcessing(false);
      }
    },
    [setAvatarUrl]
  );

  // Reset to the server values explicitly: a bare `reset()` combined with
  // `values` + `keepDirtyValues` can keep the draft the recipient is discarding.
  const handleDiscard = useCallback(
    () => reset(serverValues, { keepDirtyValues: false }),
    [reset, serverValues]
  );

  const handleSave = useCallback(async () => {
    const current = getValues();
    const patch = buildProfilePatch(current, dirtyFields);
    if (Object.keys(patch).length === 0) {
      handleDiscard();
      return;
    }
    try {
      await saveProfile(patch);
      // The saved values become the new baseline (no longer dirty).
      reset({
        ...current,
        amaPrompt: patch.amaPrompt ?? serverValues.amaPrompt,
        displayName: current.displayName.trim(),
      });
    } catch {
      // Rolled back + toasted by the mutation
    }
  }, [
    getValues,
    dirtyFields,
    saveProfile,
    reset,
    handleDiscard,
    serverValues.amaPrompt,
  ]);

  const { mutateAsync: suggest } = suggestMutation;
  const handleSuggest = useCallback(async () => {
    try {
      const result = await suggest(getValues("amaPrompt") || undefined);
      setAiIdeas(result.suggestions);
    } catch {
      // Toasted by the mutation
    }
  }, [suggest, getValues]);

  // Leaving with unsaved edits asks first (DiscardChangesModal).
  const leave = useLeaveGuard(isDirty);
  const { pendingHref, clearPendingHref } = leave;
  const handleConfirmLeave = useCallback(() => {
    if (!pendingHref) {
      return;
    }
    clearPendingHref();
    handleDiscard();
    router.push(pendingHref);
  }, [pendingHref, clearPendingHref, handleDiscard, router]);

  return {
    aiIdeas,
    amaPrompt: values.amaPrompt,
    avatarUrl: values.avatarUrl ?? null,
    displayName: values.displayName,
    handleCancelLeave: clearPendingHref,
    handleConfirmLeave,
    handleCopyProfileUrl: link.handleCopy,
    handleDiscard,
    handlePhotoRemove: () => setAvatarUrl(null),
    handlePhotoSelect,
    handleSave,
    handleShareProfileUrl: link.handleShare,
    handleSuggest,
    isAccepting: Boolean(acceptanceData?.isAcceptingMessage ?? true),
    isDirty,
    isLeaveConfirmOpen: pendingHref !== null,
    isPhotoProcessing,
    isSaving,
    isSuggesting: suggestMutation.isPending,
    linkPrefix: toLinkPrefix(link.profileLabel),
    profileUrl: link.profileUrl,
    setAmaPrompt,
    setDisplayName,
    setShowAmaBanner,
    showAmaBanner: values.showAmaBanner,
    username: saved?.username ?? link.username,
  };
}
