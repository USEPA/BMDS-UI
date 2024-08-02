import {inject, observer} from "mobx-react";
import PropTypes from "prop-types";
import React, {Component} from "react";

@inject("mainStore")
@observer
class CollectionList extends Component {
    render() {
        const {collections} = this.props.mainStore;

        if (collections.length == 0) {
            return null;
        }

        return (
            <div className="mt-2">
                {collections.map(d => (
                    <span
                        className="analysis-label"
                        style={{border: `3px solid ${d.bg_color}`, background: `${d.bg_color}1F`}}
                        key={d.id}>
                        {d.name}
                    </span>
                ))}
            </div>
        );
    }
}
CollectionList.propTypes = {
    mainStore: PropTypes.object,
};
export default CollectionList;
