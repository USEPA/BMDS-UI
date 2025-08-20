import _ from "lodash";
import {inject, observer} from "mobx-react";
import PropTypes from "prop-types";
import React, {Component} from "react";

import Button from "../common/Button";
import SelectInput from "../common/SelectInput";
import TextAreaInput from "../common/TextAreaInput";

@inject("outputStore")
@observer
class SelectModelIndex extends Component {
    render() {
        const {outputStore} = this.props,
            selectedOutput = outputStore.selectedOutput.frequentist,
            {models} = selectedOutput,
            {model_index, notes} = selectedOutput.selected,
            selectValue = _.isNumber(model_index) ? model_index : -1,
            textValue = _.isNull(notes) ? "" : notes,
            choices = models.map((model, idx) => {
                return {value: idx, text: model.name};
            });

        choices.unshift({value: -1, text: "None (no model selected)"});

        return (
            <form className="form-group row well py-2">
                <div className="col-md-4">
                    <SelectInput
                        id="selection_model"
                        label="Selected best-fitting model"
                        onChange={value => outputStore.saveSelectedModelIndex(parseInt(value))}
                        value={selectValue}
                        choices={choices}
                    />
                </div>
                <div className="col-md-4">
                    <TextAreaInput
                        id="selection_notes"
                        label="Selection notes"
                        value={textValue}
                        onChange={outputStore.saveSelectedIndexNotes}
                    />
                </div>
                <div className="col-md-4">
                    <label>&nbsp;</label>
                    <Button
                        id="selection_submit"
                        className="btn btn-primary btn-block mt-1"
                        onClick={outputStore.saveSelectedModel}
                        text="Save model selection"
                    />
                </div>
            </form>
        );
    }
}
SelectModelIndex.propTypes = {
    outputStore: PropTypes.object,
};
export default SelectModelIndex;
