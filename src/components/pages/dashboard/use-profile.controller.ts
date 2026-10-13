"use client";

import { useQuery } from "@tanstack/react-query";
import { useCallback, useMemo, useState } from "react";
import { toast } from "sonner";
import { useAmaPromptMutation } from "@/data/user/use-ama-prompt-mutation";
import { useAmaSuggestionsMutation } from "@/data/user/use-ama-suggestions-mutation";
import { useUpdateProfileMutation } from "@/data/user/use-update-profile-mutation";
import { userQueries } from "@/data/user/user.queries";
import { resizeImageToDataUrl } from "@/lib/browser/resize-image";
import { toLinkPrefix } from "./dashboard.utils";
import { useProfileLinkController } from "./use-profile-link.controller";

/** Unsaved edits; `undefined` means "unchanged from the server". */
interface ProfileDraft {
  amaPrompt?: string;
  /** `null` removes the photo. */
  avatarUrl?: string | null;
  displayName?: string;
  showAmaBanner?: boolean;
}

const EMPTY_DRAFT: ProfileDraft = {};

/**
 * Profile page: identity, link, AMA Prompt and the live preview. Edits stay
 * a local draft (shown in the preview) until "Save changes".
 */
export function useProfileController() {
  const link = useProfileLinkController();
  const { data: profileData } = useQuery(userQueries.profile());
  const { data: acceptanceData } = useQuery(userQueries.acceptance());
  const profileMutation = useUpdateProfileMutation();
  const amaMutation = useAmaPromptMutation();
  const suggestMutation = useAmaSuggestionsMutation();

  const saved = profileData?.profile;
  const [draft, setDraft] = useState<ProfileDraft>(EMPTY_DRAFT);
  const [isPhotoProcessing, setIsPhotoProcessing] = useState(false);
  const [aiIdeas, setAiIdeas] = useState<string[]>([]);

  const values = {
    username: saved?.username ?? link.username,
    displayName: draft.displayName ?? saved?.displayName ?? "",
    avatarUrl:
      draft.avatarUrl === undefined
        ? (saved?.avatarUrl ?? null)
        : draft.avatarUrl,
    amaPrompt: draft.amaPrompt ?? saved?.amaPrompt ?? "",
    showAmaBanner: draft.showAmaBanner ?? saved?.showAmaBanner ?? true,
  };

  const isDirty = useMemo(
    () =>
      (draft.displayName !== undefined &&
        draft.displayName.trim() !== (saved?.displayName ?? "")) ||
      (draft.avatarUrl !== undefined &&
        draft.avatarUrl !== (saved?.avatarUrl ?? null)) ||
      (draft.amaPrompt !== undefined &&
        draft.amaPrompt.trim() !== (saved?.amaPrompt ?? "")) ||
      (draft.showAmaBanner !== undefined &&
        draft.showAmaBanner !== (saved?.showAmaBanner ?? true)),
    [draft, saved]
  );

  const update = useCallback(
    (patch: ProfileDraft) => setDraft((prev) => ({ ...prev, ...patch })),
    []
  );

  const handlePhotoSelect = useCallback(
    async (file: File) => {
      setIsPhotoProcessing(true);
      try {
        update({ avatarUrl: await resizeImageToDataUrl(file) });
      } catch {
        toast.error("Couldn't read that image. Try a PNG, JPEG or WebP.");
      } finally {
        setIsPhotoProcessing(false);
      }
    },
    [update]
  );

  const handleDiscard = useCallback(() => setDraft(EMPTY_DRAFT), []);

  const { mutateAsync: saveProfile } = profileMutation;
  const { mutateAsync: saveAmaPrompt } = amaMutation;
  const handleSave = useCallback(async () => {
    const amaPrompt = draft.amaPrompt?.trim();
    try {
      const profilePatch = {
        displayName: draft.displayName?.trim(),
        avatarUrl: draft.avatarUrl,
        showAmaBanner: draft.showAmaBanner,
      };
      const hasProfileChange = Object.values(profilePatch).some(
        (value) => value !== undefined
      );
      await Promise.all([
        hasProfileChange ? saveProfile(profilePatch) : undefined,
        amaPrompt && amaPrompt !== saved?.amaPrompt
          ? saveAmaPrompt(amaPrompt)
          : undefined,
      ]);
      setDraft(EMPTY_DRAFT);
      toast.success("Profile saved");
    } catch {
      // Each mutation toasts and rolls back its own failure.
    }
  }, [draft, saved?.amaPrompt, saveProfile, saveAmaPrompt]);

  const { mutateAsync: suggest } = suggestMutation;
  const handleSuggest = useCallback(async () => {
    try {
      const result = await suggest(values.amaPrompt || undefined);
      setAiIdeas(result.suggestions);
    } catch {
      // Toasted by the mutation
    }
  }, [suggest, values.amaPrompt]);

  return {
    ...values,
    profileUrl: link.profileUrl,
    linkPrefix: toLinkPrefix(link.profileLabel),
    isAccepting: Boolean(acceptanceData?.isAcceptingMessage ?? true),
    setDisplayName: (displayName: string) => update({ displayName }),
    setAmaPrompt: (amaPrompt: string) => update({ amaPrompt }),
    setShowAmaBanner: (showAmaBanner: boolean) => update({ showAmaBanner }),
    handlePhotoSelect,
    handlePhotoRemove: () => update({ avatarUrl: null }),
    isPhotoProcessing,
    aiIdeas,
    handleSuggest,
    isSuggesting: suggestMutation.isPending,
    handleCopyProfileUrl: link.handleCopy,
    handleShareProfileUrl: link.handleShare,
    isDirty,
    isSaving: profileMutation.isPending || amaMutation.isPending,
    handleDiscard,
    handleSave,
  };
}
