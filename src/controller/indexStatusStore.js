const indexStatus = {};

function setStatus(application_id, status) {
  indexStatus[application_id] = { status, updated_at: new Date() };
}

function getStatus(application_id) {
  return indexStatus[application_id] || { status: 'idle' };
}

module.exports = { setStatus, getStatus };
