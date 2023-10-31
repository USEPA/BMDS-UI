import {inject, observer} from "mobx-react";
import PropTypes from "prop-types";
import React, {Component} from "react";
import {Modal} from "react-bootstrap";

import LabelInput from "@/components/common/LabelInput";

import Button from "../../common/Button";
import CheckboxInput from "../../common/CheckboxInput";

@inject("mainStore")
@observer
class WordReportOptionsModal extends Component {
    render() {
        const {
            displayWordReportOptionModal,
            changeReportOptions,
            submitWordReportRequest,
            closeWordReportOptionModal,
            wordReportOptions,
            isMultiTumorOrNestedDichotomous,
        } = this.props.mainStore;
        return (
            <Modal
                show={displayWordReportOptionModal}
                onHide={closeWordReportOptionModal}
                size="xl"
                centered>
                <Modal.Header>
                    <Modal.Title>Download Microsoft Word Report</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <div className="row">
                        <div className="col-md-12">
                            <p className="text-muted">
                                Download a Microsoft Word report of the current modeling session.
                                This will include all datasets and options which were modeled, as
                                well as both frequentist and bayesian models. Depending on the
                                complexity of the analysis, it may take a few minutes to generate;
                                please be patient.
                            </p>
                        </div>
                        {isMultiTumorOrNestedDichotomous ? null : (
                            <div className="col-md-4">
                                <LabelInput
                                    label="Long dataset format"
                                    htmlFor="datasetFormatLong"
                                />
                                <br />
                                <CheckboxInput
                                    id="datasetFormatLong"
                                    checked={wordReportOptions.datasetFormatLong}
                                    onChange={v => changeReportOptions("datasetFormatLong", v)}
                                />
                                <p className="text-muted">
                                    Print the dataset table in a long format (good for Excel or
                                    additional data analysis), or a narrow format, which is more
                                    concise for a narrative report.
                                </p>
                            </div>
                        )}
                        <div className="col-md-4">
                            <LabelInput label="Include all models" htmlFor="allModels" />
                            <br />
                            <CheckboxInput
                                id="allModels"
                                checked={wordReportOptions.allModels}
                                onChange={v => changeReportOptions("allModels", v)}
                            />
                            <p className="mb-0 text-muted">
                                Determines how many individual model outputs should be shown in the
                                report. If unchecked, only the user-selected best fitting model will
                                be included in the report (if one was selected). If checked, all
                                models which were executed will be included.
                            </p>
                        </div>
                        {isMultiTumorOrNestedDichotomous ? null : (
                            <div className="col-md-4">
                                <LabelInput label="Include BMD CDF Table" htmlFor="bmdCdfTable" />
                                <br />
                                <CheckboxInput
                                    id="bmdCdfTable"
                                    checked={wordReportOptions.bmdCdfTable}
                                    onChange={v => changeReportOptions("bmdCdfTable", v)}
                                />
                                <p className="text-muted">
                                    Include the BMD cumulative distribution function (CDF) table for
                                    each model. This is a large table and makes the report
                                    considerably longer, but may be necessary for some downstream
                                    analysis of results.
                                </p>
                            </div>
                        )}
                    </div>
                </Modal.Body>
                <Modal.Footer>
                    <Button
                        className="btn btn-primary mr-2"
                        onClick={submitWordReportRequest}
                        text="Download Report"
                    />
                    <Button
                        id="close-modal"
                        className="btn btn-secondary"
                        onClick={closeWordReportOptionModal}
                        text="Cancel"
                    />
                </Modal.Footer>
            </Modal>
        );
    }
}
WordReportOptionsModal.propTypes = {
    mainStore: PropTypes.object,
};
export default WordReportOptionsModal;
