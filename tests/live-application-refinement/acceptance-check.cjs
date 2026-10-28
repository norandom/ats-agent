'use strict';
// Foundation gate: final receipt validation belongs to task 7.3.
function requireLiveEvidence() {
  throw Error('Missing live refinement evidence: foundation observations and simulated controls cannot establish final acceptance; full revision receipts require the final acceptance gate.');
}
module.exports = {requireLiveEvidence};
