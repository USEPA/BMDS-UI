import PropTypes from "prop-types";
import React from "react";

import Button from "../../common/Button";
import { chainOptions, limits } from "@/constants/MCMCConstants";

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
          onChange={(value) => props.saveOptions("seed", value)}
          value={props.options.seed}
          min={limits.seed.min}
          max={limits.seed.max}
        />
      </td>

      <td>
        <SelectInput
          choices={chainOptions.map((option) => {
            return { value: option.value, text: option.label };
          })}
          onChange={(value) => props.saveOptions("num_chains", parseInt(value))}
          value={props.options.num_chains}
        />
      </td>

      <td>
        <IntegerInput
          value={props.options.iterations_per_chain}
          onChange={(value) => props.saveOptions("iterations_per_chain", value)}
          min={limits.iterations_per_chain.min}
          max={limits.iterations_per_chain.max}
        />
      </td>

      <td>
        <IntegerInput
          value={props.options.burnin}
          onChange={(value) => props.saveOptions("burnin", value)}
          min={limits.burnin.min}
          max={limits.burnin.max}
        />
      </td>
    </tr>
  );
};

MCMCForm.propTypes = {
  MCMCStore: PropTypes.object,
  options: PropTypes.object.isRequired,
};
export default MCMCForm;
