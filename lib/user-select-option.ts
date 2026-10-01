type UserSelectOptionSource = {
  id: string;
  full_name: string;
  avatar: string | null;
};

// Keep every picker of internal users visually consistent.
export function userSelectOption(user: UserSelectOptionSource) {
  return {
    value: user.id,
    label: user.full_name,
    avatar: user.avatar,
  };
}
