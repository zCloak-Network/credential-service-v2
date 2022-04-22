const notTransfer = 1;
const transfering = 2;
const transferSuccess = 3;

type TransferStatus =
  | typeof notTransfer
  | typeof transfering
  | typeof transferSuccess;

export { TransferStatus, notTransfer, transfering, transferSuccess };
