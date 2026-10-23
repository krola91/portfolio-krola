/** Preserve source categories, including multi-label incidents; no inferred percentages. */
export const attackTypeId = (label: string) => label.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
