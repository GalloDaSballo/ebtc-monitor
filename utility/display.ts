const formatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

export function toValueDisplay(amount: number, showDecimals = false): string {
  if (showDecimals) {
    return formatter.format(amount);
  }
  return formatter.format(amount).split(".")[0];
}
