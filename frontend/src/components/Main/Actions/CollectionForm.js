import {inject, observer} from "mobx-react";
import PropTypes from "prop-types";
import React, {Component} from "react";

import Button from "../../common/Button";

@inject("mainStore")
@observer
class CollectionForm extends Component {
    constructor(props) {
        super(props);
        this.state = {selected: props.mainStore.collectionDefaultValues};
    }
    render() {
        const {mainStore} = this.props;
        const {collectionDefaultValues} = mainStore;
        const {collections} = mainStore.config.editSettings;

        if (!mainStore.canEdit || !mainStore.isDesktop) {
            return null;
        }

        return (
            <form className="px-3">
                <select
                    multiple
                    className="form-control"
                    defaultValue={collectionDefaultValues}
                    onChange={e =>
                        this.setState({
                            selected: Array.from(e.target.selectedOptions, d =>
                                Number.parseInt(d.value)
                            ),
                        })
                    }>
                    {collections.map(d => (
                        <option key={d.id} value={d.id}>
                            {d.name}
                        </option>
                    ))}
                </select>
                <Button
                    className="btn btn-primary btn-block btn-sm mt-1"
                    onClick={() => mainStore.collectionsToggle(this.state.selected)}
                    icon={"check-circle-fill"}
                    text="Apply"
                />
            </form>
        );
    }
}
CollectionForm.propTypes = {
    mainStore: PropTypes.object,
};
export default CollectionForm;
