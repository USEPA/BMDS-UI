import {toJS} from "mobx";
import {inject, observer} from "mobx-react";
import PropTypes from "prop-types";
import React, {Component} from "react";

import HelpTextPopover from "@/components/common/HelpTextPopover";
import McmcForm from "./MCMCForm";

@inject("mcmcStore")
@observer
class McmcFormList extends Component {
    render() {
        const {mcmcStore} = this.props,
            optionsDict = toJS(mcmcStore.optionsDict);
        return (
            <div>
                <div className="panel panel-default">
                    <form className="form-horizontal">
                        <table className="table table-sm table-fixed">
                            <thead style={{height: "50px"}} className="bg-custom">
                                <tr>
                                    <th>Markov Chain Monte Carlo</th>
                                    <>
                                        <th>Seed</th>
                                        <th># Chains</th>
                                        <th>
                                            # Iterations per Chain{" "}
                                            <HelpTextPopover
                                                title="Attention"
                                                content={`Total iterations (# chains  x  # iterations per chain) cannot exceed 50,000`}
                                            />
                                        </th>
                                        <th>Burn In</th>
                                    </>
                                </tr>
                            </thead>
                            <tbody>
                                <McmcForm
                                    key={`${mcmcStore.resetCount}`}
                                    options={optionsDict}
                                    saveOptions={mcmcStore.saveOptions}
                                    setDefaults={() => mcmcStore.setDefaults(true)}
                                />
                            </tbody>
                        </table>
                    </form>
                </div>
            </div>
        );
    }
}

McmcFormList.propTypes = {
    mcmcStore: PropTypes.object,
};

export default McmcFormList;
