export const formatPrice = (price: number) => {
  if (price < 0) {
    return `-$${Math.abs(price).toFixed(2)}`;
  } else if (price > 0) {
    return `$${price.toFixed(2)}`;
  } else {
    return `$0.00`;
  }
};
