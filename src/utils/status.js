export const normalizeStatus = (status = "") =>
  String(status).trim().toLowerCase().replace(/\s+/g, "");

export const isPendingStatus = (status) =>
  ["pending", "submitted", "underreview"].includes(normalizeStatus(status));

export const getStatusStats = (data = []) => ({
  total: data.length,
  approved: data.filter((item) => normalizeStatus(item.status) === "approved").length,
  pending: data.filter((item) => isPendingStatus(item.status)).length,
  rejected: data.filter((item) => normalizeStatus(item.status) === "rejected").length,
  notdetected: data.filter((item) => normalizeStatus(item.status) === "notdetected").length,
});
