import PropTypes from "prop-types";
import React from "react";

import Button from "../../common/Button";
import { seedOptions } from "@/constants/MCMCConstants";

import FloatInput from "../../common/FloatInput";
import SelectInput from "../../common/SelectInput";

const MCMCForm = (props) => {
  return (
    <tr className="form-group">
      <td>
        <Button
          className="btn btn-sm btn-info"
          onClick={props.setDefault}
          text="Reset to Default"
        />
      </td>

      <td>
        <SelectInput
          choices={seedOptions.map((option) => {
            return { value: option.value, text: option.label };
          })}
          onChange={(value) =>
            props.saveOptions("seed", parseInt(value), props.idx)
          }
          value={props.options.seed}
        />
      </td>

      <td>
        <FloatInput
          onChange={(value) =>
            props.saveOptions("num_chains", value, props.idx)
          }
          value={props.options.num_chains}
        />
      </td>

      <td>
        <FloatInput
          value={props.options.iterations_per_chain}
          onChange={(value) =>
            props.saveOptions("iterations_per_chain", value, props.idx)
          }
        />
      </td>

      <td>
        <FloatInput
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
