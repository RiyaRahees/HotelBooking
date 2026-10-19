export const generateBookingId = (): string => {
  const randomNum = Math.floor(1000 + Math.random() * 9000);
  return `BK-${randomNum}`;
};
