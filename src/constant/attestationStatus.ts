const defaultStatus = -9999;

const notSubmit = 1;
const submitting = 2;
const submitSuccess = 3;

type AttestationStatus =
  | typeof defaultStatus
  | typeof notSubmit
  | typeof submitting
  | typeof submitSuccess;

export {
  AttestationStatus,
  defaultStatus,
  notSubmit,
  submitting,
  submitSuccess,
};
