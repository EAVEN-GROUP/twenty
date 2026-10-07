export const computePodiumDisplayNames = (
  labels: string[],
): Map<string, string> => {
  const firstNameByLabel = new Map(
    labels.map((label) => [label, label.trim().split(/\s+/)[0] ?? label]),
  );

  const occurrencesByFirstName = new Map<string, number>();

  for (const firstName of firstNameByLabel.values()) {
    occurrencesByFirstName.set(
      firstName,
      (occurrencesByFirstName.get(firstName) ?? 0) + 1,
    );
  }

  return new Map(
    labels.map((label) => {
      const firstName = firstNameByLabel.get(label) ?? label;

      return [
        label,
        occurrencesByFirstName.get(firstName) === 1 ? firstName : label,
      ];
    }),
  );
};
