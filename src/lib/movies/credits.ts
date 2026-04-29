import type { PersonChipData } from "@/components/person/types";
import type { PersonRole } from "@/lib/person/roles";

type CreditPersonSource = {
  id: string;
  name: string;
  tmdbId: number | null;
};

type CreditSource = {
  role: PersonRole;
  person: CreditPersonSource;
};

type CreditsFallbackInput = {
  credits?: CreditSource[] | null;
  directors?: string[] | null;
  cast?: string[] | null;
};

export function mapCreditsToPersonChipData({
  credits,
  directors,
  cast,
}: CreditsFallbackInput): PersonChipData[] {
  if (credits && credits.length > 0) {
    return credits.map((credit) => ({
      personId: credit.person.id,
      tmdbId: credit.person.tmdbId,
      name: credit.person.name,
      role: credit.role,
    }));
  }

  return [
    ...(directors ?? []).map((name) => ({ name, role: "director" as const })),
    ...(cast ?? []).map((name) => ({ name, role: "actor" as const })),
  ];
}
