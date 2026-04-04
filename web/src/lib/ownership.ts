import type { AuthSession } from "@/lib/auth";

type IdLike =
  | string
  | {
      _id?: string | { toString(): string };
      id?: string | { toString(): string };
    }
  | null
  | undefined;

export function getEntityId(value: IdLike): string {
  if (!value) {
    return "";
  }

  if (typeof value === "string") {
    return value;
  }

  const id = value._id ?? value.id;
  if (!id) {
    return "";
  }

  return typeof id === "string" ? id : id.toString();
}

export function isSellerOwner(
  session: AuthSession | null,
  ownerId: IdLike,
): boolean {
  return (
    session?.user.role === "seller" &&
    session.user.id.length > 0 &&
    session.user.id === getEntityId(ownerId)
  );
}
