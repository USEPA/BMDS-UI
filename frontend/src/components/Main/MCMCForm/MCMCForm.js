import PropTypes from "prop-types";
import React from "react";

import Button from "../../common/Button";
import { chainOptions } from "@/constants/MCMCConstants";

import SelectInput from "../../common/SelectInput";
import IntegerInput from "../../common/IntegerInput";

const MCMCForm = (props) => {
  return (
    <tr className="form-group">
      <td>
        <Button
          className="btn btn-sm btn-info"
          onClick={props.setDefaults}
          text="Reset to Default"
        />
      </td>

      <td>
        <IntegerInput
          onChange={(value) => props.saveOptions("seed", value, props.idx)}
          value={props.options.seed}
        />
      </td>

      <td>
        <SelectInput
          choices={chainOptions.map((option) => {
            return { value: option.value, text: option.label };
          })}
          onChange={(value) =>
            props.saveOptions("num_chains", parseInt(value), props.idx)
          }
          value={props.options.num_chains}
        />
      </td>

      <td>
        <IntegerInput
          value={props.options.iterations_per_chain}
          onChange={(value) =>
            props.saveOptions("iterations_per_chain", value, props.idx)
          }
        />
      </td>

      <td>
        <IntegerInput
          value={props.options.burnin}
          onChange={(value) => props.saveOptions("burnin", value, props.idx)}
        />
      </td>
    </tr>
  );
};

MCMCForm.propTypes = {
  MCMCStore: PropTypes.object,
  idx: PropTypes.number.isRequired,
  options: PropTypes.object.isRequired,
};
export default MCMCForm;
