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
            <div className="">
                {collections.map(d => (
                    <span className="badge badge-info ml-2" key={d.id}>
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
