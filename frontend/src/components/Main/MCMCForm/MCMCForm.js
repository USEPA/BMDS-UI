import PropTypes from "prop-types";
import React from "react";

import Button from "../../common/Button";
import { chainOptions } from "@/constants/mcmcConstants";

import SelectInput from "../../common/SelectInput";
import IntegerInput from "../../common/IntegerInput";

const McmcForm = (props) => {
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
        />
      </td>

      <td>
        <SelectInput
          choices={chainOptions.map((option) => {
            return { value: option.value, text: option.label };
          })}
          onChange={(value) => props.saveOptions("n_chains", parseInt(value))}
          value={props.options.n_chains}
        />
      </td>

      <td>
        <IntegerInput
          value={props.options.iterations_per_chain}
          onChange={(value) => props.saveOptions("iterations_per_chain", value)}
        />
      </td>

      <td>
        <IntegerInput
          value={props.options.burnin}
          onChange={(value) => props.saveOptions("burnin", value)}
        />
      </td>
    </tr>
  );
};

McmcForm.propTypes = {
  mcmcStore: PropTypes.object,
  options: PropTypes.object.isRequired,
};
export default McmcForm;
