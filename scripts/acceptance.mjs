const target = process.argv[2];
const message =
  target === "fortnox"
    ? "Fortnox acceptance is not implemented. See docs/implementation/S00-spike-evidence.md (G04). No provider requests were made."
    : "Hosted-client acceptance is not implemented. See docs/implementation/S00-spike-evidence.md (G01-G03). No hosted client was tested.";
console.error(message);
process.exitCode = 1;
