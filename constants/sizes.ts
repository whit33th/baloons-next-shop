export const BALLOON_SIZES = ["30cm", "45cm", "80cm", "100cm"] as const;

export type BalloonSize = (typeof BALLOON_SIZES)[number];
