import { describe, expect, it } from "vitest";
import {
  AddMemberInputSchema,
  DeleteExpenseInputSchema,
  RemoveMemberInputSchema,
  UpdateGroupInputSchema,
  notImplemented,
} from "./contracts";

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
  it("updateGroup: groupId + al menos name o currency", () => {
    expect(UpdateGroupInputSchema.safeParse({ groupId: "g1" }).success).toBe(false);
    expect(UpdateGroupInputSchema.safeParse({ groupId: "g1", currency: "USD" }).success).toBe(true);
    expect(UpdateGroupInputSchema.safeParse({ groupId: "g1", name: " Asado " }).success).toBe(true);
    expect(UpdateGroupInputSchema.safeParse({ groupId: "g1", currency: "EUR" }).success).toBe(false);
  });
  it("deleteExpense exige expenseId", () => {
    expect(DeleteExpenseInputSchema.safeParse({}).success).toBe(false);
    expect(DeleteExpenseInputSchema.safeParse({ expenseId: "e1" }).success).toBe(true);
  });
  it("los stubs devuelven INTERNAL con NOT_IMPLEMENTED en message", () => {
    expect(notImplemented("x")).toEqual({ ok: false, error: { code: "INTERNAL", message: "NOT_IMPLEMENTED: x" } });
  });
});
