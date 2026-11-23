import PropTypes from "prop-types";
import React, {useState} from "react";

const normalize = value => value.replace(/\s+/g, "").toLowerCase();

function AnalysisFingerprint({fingerprint, dirty}) {
    const [reportFingerprint, setReportFingerprint] = useState("");
    const [hasCompared, setHasCompared] = useState(false);

    if (!fingerprint) {
        return (
            <div className="text-muted mt-3 row well py-2 px-2">
                {dirty
                    ? "Analysis changed - save changes, then generate a new fingerprint or export."
                    : "Use Actions to generate a fingerprint or export a completed analysis."}
            </div>
        );
    }

    const candidate = normalize(reportFingerprint);
    const fingerprintsMatch = hasCompared ? candidate === normalize(fingerprint) : null;

    const handleCompare = event => {
        event.preventDefault();
        setHasCompared(true);
    };

    return (
        <div style={{display: "flex", flexDirection: "column", alignItems: "center"}}>
            <div className="px-2 mb-1" style={{fontWeight: 650}}>
                Paste fingerprint from exported Word Report, Excel, or JSON to compare
            </div>
            <section
                className="row well py-2 px-2"
                aria-label="Analysis fingerprint"
                style={{width: 760}}>
                <form onSubmit={handleCompare}>
                    <label htmlFor="analysis-fingerprint" style={{fontWeight: 500}}>
                        Current saved analysis fingerprint
                    </label>
                    <input
                        id="analysis-fingerprint"
                        className="form-control"
                        value={fingerprint}
                        readOnly
                        onFocus={event => event.target.select()}
                        style={{width: 720}}
                    />

                    <label htmlFor="report-fingerprint" className="mt-3" style={{fontWeight: 500}}>
                        paste the complete BMDS-v1-sha256 fingerprint to compare
                    </label>
                    <textarea
                        id="report-fingerprint"
                        className="form-control"
                        rows={1}
                        value={reportFingerprint}
                        onChange={event => {
                            setReportFingerprint(event.target.value);
                            setHasCompared(false);
                        }}
                        spellCheck={false}
                    />
                    <div className="mt-3">
                        <button
                            type="submit"
                            className="btn btn-sm btn-info"
                            style={{marginRight: 16}}>
                            Compare
                        </button>
                        {fingerprintsMatch === true ? (
                            <strong className="text-success">Fingerprints match!</strong>
                        ) : null}
                        {fingerprintsMatch === false ? (
                            <strong className="text-danger">Fingerprints do not match</strong>
                        ) : null}
                    </div>
                </form>
            </section>
        </div>
    );
}

AnalysisFingerprint.propTypes = {
    fingerprint: PropTypes.string,
    dirty: PropTypes.bool,
};

export default AnalysisFingerprint;
