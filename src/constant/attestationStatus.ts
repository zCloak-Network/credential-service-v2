const defaultStatus = -9999;

const submitFailure = -1;
const notSubmit = 1;
const submitting = 2;
const submitSuccess = 3;

type AttestationStatus =
  | typeof defaultStatus
  | typeof submitFailure
  | typeof notSubmit
  | typeof submitting
  | typeof submitSuccess;

export {
  AttestationStatus,
  defaultStatus,
  notSubmit,
  submitting,
  submitSuccess,
  submitFailure,
};
