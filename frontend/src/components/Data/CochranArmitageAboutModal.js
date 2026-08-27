import {inject, observer} from "mobx-react";
import PropTypes from "prop-types";
import React, {Component} from "react";
import {Modal} from "react-bootstrap";

import ExternalAnchor from "@/components/common/ExternalAnchor";
import IM, {typesetMath} from "@/components/common/InlineMath";

@inject("store")
@observer
class CochranArmitageAboutModal extends Component {
    componentDidMount() {
        typesetMath();
    }
    render() {
        const {store} = this.props;
        return (
            <Modal size="lg" show={store.showAboutModal} onHide={() => store.setAboutModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Cochran-Armitage Trend Test for Dichotomous Data</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p>
                        The Cochran-Armitage trend test allows users to test for trends in binomial
                        proportions across different levels of a single variable. In the case of
                        dichotomous dose-response data, the number of responses divided by the total
                        number of subjects exposed represents the binomial proportion, which is
                        tested across the different doses. Here, dose is treated as an ordinal
                        variable, and thus the test depends only on the order of the doses, not
                        their numerical values. The Cochran-Armitage trend test in pybmds
                        automatically computes both the asymptotic and conditional exact p-values
                        for testing the presences of a monotonic trend in incidence rations across
                        increasing dose groups.
                    </p>
                    <p>
                        The asymptotic p-value is based on a normal approximation of the linear
                        trend statistic proposed by{" "}
                        {ExternalAnchor(
                            "https://www.jstor.org/tc/accept?origin=%2Fstable%2Fpdf%2F3001616.pdf&is_image=False",
                            "Cochran (1954)"
                        )}{" "}
                        and{" "}
                        {ExternalAnchor(
                            "https://www.jstor.org/stable/3001775?seq=1",
                            "Armitage (1954)"
                        )}
                        . The exact one-sided p-value for the Cochran-Armitage trend test uses a
                        special case of the linear rank test algorithm by{" "}
                        {ExternalAnchor(
                            "https://www.jstor.org/stable/1390598?seq=6",
                            "Mehta, Patel, and Tsiastis (1992)"
                        )}
                        .
                    </p>
                    <p>
                        The null hypothesis for the Cochran-Armitage test is that the binomial
                        proportion of the responses is the same across all levels of the ordinal
                        dose variable; p-values less than the alpha level (normally 0.05) indicate
                        that a monotonic trend does exist in the data.
                    </p>
                </Modal.Body>
            </Modal>
        );
    }
}
CochranArmitageAboutModal.propTypes = {
    store: PropTypes.object,
};
export default CochranArmitageAboutModal;
