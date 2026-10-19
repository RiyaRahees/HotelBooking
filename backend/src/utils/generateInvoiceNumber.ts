export const generateInvoiceNumber = (sequence = 1): string => {
  const year = new Date().getFullYear();
  const paddedSeq = sequence.toString().padStart(6, '0');
  return `INV-${year}-${paddedSeq}`;
};
