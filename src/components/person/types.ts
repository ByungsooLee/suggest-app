export type PersonRole = "director" | "actor" | "writer";

export type PersonChipData = {
  personId?: string | null;
  tmdbId?: number | null;
  name: string;
  role: PersonRole;
  displayName?: string;
};

export type PersonDetailResponse = {
  person: {
    id: string;
    name: string;
    tmdbId: number | null;
    avatarUrl: string | null;
    biography: string | null;
    knownForDepartment: string | null;
    knownFor: string[];
  };
  credits?: Array<{
    movieId: string;
    movieTitle: string;
    releaseYear: number;
    posterUrl: string | null;
    role: PersonRole;
    character: string | null;
    job: string | null;
  }>;
  collaborators?: Array<{
    id: string;
    name: string;
    tmdbId: number | null;
    avatarUrl: string | null;
    collaborationCount: number;
    roles: PersonRole[];
  }>;
};
