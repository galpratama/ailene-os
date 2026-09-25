"use client";

import AppButton from "@/components/buttons/AppButton";
import AppInput from "@/components/fields/AppInput";
import AppSelect, { AppSelectOption } from "@/components/fields/AppSelect";
import { lmsMemberRoleStyles } from "@/components/labels/LmsMemberRoleLabel";
import SheetOS from "@/components/modals/SheetOS";
import { inviteLmsMember, updateLmsMember } from "@/lib/actions";
import { isSuccessStatus } from "@/lib/status_code";
import type {
  LmsGroupEntry,
  LmsInviteResult,
  LmsMemberEntry,
  LmsMemberRole,
  UpdateLmsMemberPayload,
} from "@/apis/lms";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { toast } from "sonner";

const roleOptions: AppSelectOption[] = (
  Object.keys(lmsMemberRoleStyles) as LmsMemberRole[]
).map((role) => ({ value: role, label: lmsMemberRoleStyles[role].label }));

// The invite itself succeeded; these toasts only flag what the admin may need to follow up on.
function announceInvite(result: LmsInviteResult, typedPassword: boolean) {
  const name = result.member.user.full_name;

  if (result.email_sent) {
    toast.success(`${name} was invited.`, {
      description: `Invitation sent to ${result.member.user.email}.`,
    });
  } else {
    toast.warning(`${name} was invited, but the email failed to send.`, {
      description: "Share the LMS link with them yourself.",
      duration: Infinity,
      action: {
        label: "Copy link",
        onClick: () => navigator.clipboard.writeText(result.access_url),
      },
    });
  }

  if (typedPassword && !result.password_set) {
    toast.info("User already has a password — it was not changed.");
  }
}

interface LmsMemberFormOSProps {
  projectId: string;
  groups: LmsGroupEntry[];
  // `null` invites someone new; an entry edits that member.
  member: LmsMemberEntry | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function LmsMemberFormOS({
  projectId,
  groups,
  member,
  isOpen,
  onClose,
}: LmsMemberFormOSProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState(member?.user.full_name ?? "");
  const [jobTitle, setJobTitle] = useState(member?.user.job_title ?? "");
  const [role, setRole] = useState<LmsMemberRole | "">(member?.role ?? "");
  const [groupId, setGroupId] = useState<number | null>(
    member?.group.id ?? null
  );

  function seed(next: LmsMemberEntry | null) {
    setEmail("");
    setPassword("");
    setFullName(next?.user.full_name ?? "");
    setJobTitle(next?.user.job_title ?? "");
    setRole(next?.role ?? "");
    setGroupId(next?.group.id ?? null);
    setError(null);
  }

  // Re-seed the fields whenever a different member (or "invite") is opened, without an effect.
  const [seenMember, setSeenMember] = useState<LmsMemberEntry | null>(member);
  if (member !== seenMember) {
    setSeenMember(member);
    seed(member);
  }

  const groupOptions: AppSelectOption[] = groups.map((group) => ({
    value: group.id,
    label: group.name,
  }));

  function handleClose() {
    seed(member);
    onClose();
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (!member && !email.trim()) return setError("Email is required.");
    if (!role) return setError("Role is required.");
    if (!groupId) return setError("Group is required.");
    if (!member && password && (password.length < 8 || password.length > 72))
      return setError("Password must be 8–72 characters.");

    if (member) {
      // `users/update` only touches what's sent, so unchanged fields stay out of the payload.
      const payload: UpdateLmsMemberPayload = {
        project_id: projectId,
        access_id: member.access_id,
      };
      if (role !== member.role) payload.role = role;
      if (groupId !== member.group.id) payload.group_id = groupId;
      if (fullName.trim() && fullName.trim() !== member.user.full_name)
        payload.full_name = fullName.trim();
      if (jobTitle.trim() !== member.user.job_title)
        payload.job_title = jobTitle.trim();

      if (Object.keys(payload).length === 2) return handleClose();

      setIsSubmitting(true);
      const result = await updateLmsMember(payload);
      setIsSubmitting(false);

      if (!isSuccessStatus(result.status)) {
        return setError(result.message ?? "Failed to save member.");
      }
      toast.success("Member updated.");
    } else {
      setIsSubmitting(true);
      const result = await inviteLmsMember({
        project_id: projectId,
        email: email.trim(),
        full_name: fullName.trim() || undefined,
        job_title: jobTitle.trim() || undefined,
        role,
        group_id: groupId,
        password: password || undefined,
      });
      setIsSubmitting(false);

      if (!isSuccessStatus(result.status) || !result.data) {
        return setError(result.message ?? "Failed to invite member.");
      }
      announceInvite(result.data, !!password);
    }

    router.refresh();
    seed(null);
    onClose();
  }

  return (
    <SheetOS
      title={member ? "Edit member" : "Invite member"}
      description={
        member
          ? "Name and job title change everywhere this person appears, in every project."
          : "An invitation email with a link to the LMS is sent to this address."
      }
      isOpen={isOpen}
      onClose={handleClose}
    >
      <form onSubmit={handleSubmit} className="flex flex-1 flex-col min-h-0">
        <div className="flex-1 overflow-y-auto px-6 py-5 flex flex-col gap-4">
          {error && (
            <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-600 dark:border-red-800 dark:bg-red-950/40 dark:text-red-400">
              {error}
            </p>
          )}

          {member ? (
            <AppInput
              inputId="lms-member-email"
              label="Email"
              value={member.user.email}
              disabled
            />
          ) : (
            <AppInput
              inputId="lms-member-email"
              label="Email"
              type="email"
              required
              maxLength={255}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@company.com"
            />
          )}
          <div className="flex flex-col gap-1">
            <AppInput
              inputId="lms-member-name"
              label="Full name"
              maxLength={255}
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Enter full name"
            />
            {!member && (
              <p className="text-xs text-gray-400 dark:text-zinc-500">
                Required for someone new to the LMS; ignored if they already
                have an account from another project.
              </p>
            )}
          </div>
          <AppInput
            inputId="lms-member-job-title"
            label="Job title"
            maxLength={255}
            value={jobTitle}
            onChange={(e) => setJobTitle(e.target.value)}
            placeholder="e.g. HR Generalist"
          />
          {!member && (
            <div className="flex flex-col gap-1">
              <AppInput
                inputId="lms-member-password"
                label="Password"
                type="password"
                autoComplete="new-password"
                maxLength={72}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Optional, 8–72 characters"
              />
              <p className="text-xs text-gray-400 dark:text-zinc-500">
                Lets them sign in with email and password besides Google.
                It&apos;s sent in the invitation email in plain text, and
                never replaces a password they already have.
              </p>
            </div>
          )}
          <AppSelect
            selectId="lms-member-role"
            label="Role"
            required
            placeholder="Select role"
            value={role}
            onChange={(v) => setRole((v as LmsMemberRole) ?? "")}
            options={roleOptions}
          />
          <AppSelect
            selectId="lms-member-group"
            label="Group"
            required
            placeholder={
              groups.length ? "Select group" : "Create a group first"
            }
            value={groupId ?? ""}
            onChange={(v) => setGroupId(v ? (v as number) : null)}
            options={groupOptions}
            disabled={groups.length === 0}
          />
        </div>

        <div className="sticky bottom-0 flex gap-3 border-t border-gray-200 bg-white px-6 py-4 dark:border-zinc-800 dark:bg-zinc-900">
          <AppButton
            type="button"
            variant="outline"
            className="flex-1 justify-center"
            onClick={handleClose}
          >
            Cancel
          </AppButton>
          <AppButton
            type="submit"
            variant="primary"
            className="flex-1 justify-center"
            disabled={isSubmitting}
          >
            {isSubmitting && <Loader2 size={14} className="animate-spin" />}
            {member ? "Save changes" : "Invite"}
          </AppButton>
        </div>
      </form>
    </SheetOS>
  );
}
