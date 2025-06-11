import crypto from "crypto";

const renameBillImg = (location: string, purchaseOrderNumber: string) => {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0"); // Months are zero-based
  const day = String(date.getDate()).padStart(2, "0");

  const uniqueId = `${Date.now()}-${crypto.randomBytes(4).toString("hex")}`;
  const formattedDate = `${year}${month}${day}`;
  const newFilename = `${location}_${purchaseOrderNumber}_${formattedDate}_${uniqueId}`;
  return newFilename;
};

export default renameBillImg;
