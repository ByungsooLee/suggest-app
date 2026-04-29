import { z } from "zod";

export const PERSON_ROLES = ["director", "actor", "writer"] as const;

export const PersonRoleSchema = z.enum(PERSON_ROLES);

export type PersonRole = (typeof PERSON_ROLES)[number];
