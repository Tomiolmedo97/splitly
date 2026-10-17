import { describe, expect, it } from "vitest";
import { AddMemberInputSchema, RemoveMemberInputSchema, notImplemented } from "./contracts";

describe("contratos de Server Actions", () => {
  it("addMember: invitado o persona con cuenta, siempre con groupId", () => {
    expect(AddMemberInputSchema.safeParse({ groupId: "g1", kind: "guest", name: "Sofi" }).success).toBe(true);
    expect(AddMemberInputSchema.safeParse({ groupId: "g1", kind: "user", userId: "u1" }).success).toBe(true);
    expect(AddMemberInputSchema.safeParse({ kind: "guest", name: "Sofi" }).success).toBe(false);
    expect(AddMemberInputSchema.safeParse({ groupId: "g1", kind: "user", email: "a@b.co" }).success).toBe(false);
  });
  it("removeMember exige groupId y memberId", () => {
    expect(RemoveMemberInputSchema.safeParse({ groupId: "g1" }).success).toBe(false);
  });
  it("los stubs devuelven INTERNAL con NOT_IMPLEMENTED en message", () => {
    expect(notImplemented("x")).toEqual({ ok: false, error: { code: "INTERNAL", message: "NOT_IMPLEMENTED: x" } });
  });
});
