import PropTypes from "prop-types";
import React, {useState} from "react";

const normalize = value => value.replace(/\s+/g, "").toLowerCase();

function AnalysisFingerprint({fingerprint, dirty}) {
    const [reportFingerprint, setReportFingerprint] = useState("");

    if (!fingerprint) {
        return (
            <p className="text-muted">
                {dirty
                    ? "Analysis changed - save changes, then generate a new fingerprint or export."
                    : "Use Actions to generate a fingerprint or export a completed analysis."}
            </p>
        );
    }

    const candidate = normalize(reportFingerprint);
    const valid = /^bmds-v1-sha256:[0-9a-f]{64}$/.test(candidate);

    let message = "";
    if (candidate) {
        message = !valid
            ? "Paste the complete BMDS-v1-sha256 fingerprint."
            : candidate === normalize(fingerprint)
              ? "MATCH: The saved analysis matches the report fingerprint."
              : "DOES NOT MATCH: The fingerprints identify different snapshots.";
    }

    return (
        <section className="mt-3" aria-label="Analysis fingerprint">
            <label htmlFor="analysis-fingerprint">Current saved analysis fingerprint</label>
            <input
                id="analysis-fingerprint"
                className="form-control"
                value={fingerprint}
                readOnly
                onFocus={event => event.target.select()}
            />
            <small className="text-muted">Select the value to copy it.</small>

            <label htmlFor="report-fingerprint" className="mt-3">
                Paste the fingerprint from your Word report
            </label>
            <textarea
                id="report-fingerprint"
                className="form-control"
                rows={3}
                value={reportFingerprint}
                onChange={event => setReportFingerprint(event.target.value)}
                spellCheck={false}
            />
            <p role="status">{message}</p>
            <small className="text-muted">
                A match does not verify that the Word document is unedited.
            </small>
        </section>
    );
}

AnalysisFingerprint.propTypes = {
    fingerprint: PropTypes.string,
    dirty: PropTypes.bool,
};

export default AnalysisFingerprint;
