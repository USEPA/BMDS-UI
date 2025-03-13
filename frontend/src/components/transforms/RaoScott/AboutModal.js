import {inject, observer} from "mobx-react";
import PropTypes from "prop-types";
import React, {Component} from "react";
import {Modal} from "react-bootstrap";

import ExternalAnchor from "@/components/common/ExternalAnchor";
import IM, {typesetMath} from "@/components/common/InlineMath";

@inject("store")
@observer
class AboutModal extends Component {
    componentDidMount() {
        typesetMath();
    }
    render() {
        const {store} = this.props;
        return (
            <Modal size="xl" show={store.showAboutModal} onHide={() => store.setAboutModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>
                        Rao-Scott Transformation for Modelling Summary Dichotomous Developmental
                        Data
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p>
                        The Rao-Scott transformation is an approach, described in{" "}
                        {ExternalAnchor(
                            "https://hero.epa.gov/hero/index.cfm/reference/details/reference_id/3392311",
                            "Fox et al., 2017"
                        )}
                        , to model dichotomous developmental data when only summary level
                        dose-response data is available. The transformation works by scaling
                        dose-level incidence and sample size data by a variable called the design
                        effect in order to approximate the intralitter correlation that occurs due
                        to the clustered study design of developmental toxicity studies.
                    </p>
                    <p>
                        For dose-response analyses of dichotomous developmental toxicity studies,
                        the proper approach is to model individual animal data (i.e., litter data
                        for individual dams) in order to account for the tendency of pups from one
                        litter to respond more alike one another than pups from other litters. This
                        behavior is commonly termed the <i>litter effect</i> or{" "}
                        <i>intralitter correlation</i>.
                    </p>
                    <p>
                        However, it is frequently the case that dose-response modelers will be
                        modeling data reported in the peer-reviewed literature and it is rarely the
                        case that individual litter data is reported in peer-reviewed articles or
                        provided as supplemental materials. Instead, peer-reviewed articles
                        typically report the dose-level summary data: the total number of fetuses
                        and the number of fetuses responding to treatment per dose group,
                        irrespective of litter membership.
                    </p>
                    <div className="alert alert-info my-3">
                        <strong>Note:</strong> If individual-level developmental toxicity data are
                        available for modeling, model a Nested Dichotomous endpoint instead of
                        transforming data to model as a Dichotomous endpoint.
                    </div>
                    <p>
                        As reported in{" "}
                        {ExternalAnchor(
                            "https://hero.epa.gov/hero/index.cfm/reference/details/reference_id/3392311",
                            "Fox et al., 2017"
                        )}
                        , multiple statistical studies have researched the concept of the design
                        effect, <IM f="D" />, as a strategy to reduce overdispersion arising from
                        clustered study design via a simple dose-response transformation. The core
                        concept is that correlated data can be transformed via scaling and then
                        modeled with standard dichotomous models as if they were not correlated.
                    </p>
                    <p>
                        In order to apply the Rao-Scott transformation, both the numerator and
                        denominator of a dose-level proportion are divided by <IM f="D" />. This
                        results in what can be described as the <i>effective</i> sample size{" "}
                        <IM f="\left({N_{f}}_{RS} = \frac{N_{f}}{D}\right)" />
                        and the <i>effective</i> affected fetuses{" "}
                        <IM f="\left({A_{f}}_{RS} = \frac{A_{f}}{D}\right)" />.
                    </p>
                    <p>
                        In order to provide BMDS users an approach to approximate <IM f="D" /> for
                        summary data,{" "}
                        {ExternalAnchor(
                            "https://hero.epa.gov/hero/index.cfm/reference/details/reference_id/3392311",
                            "Fox et al., 2017"
                        )}{" "}
                        conducted an analysis of 55 developmental toxicity studies for which
                        individual level data were available and used the regression equation{" "}
                        <IM f="\ln(D) = a + b \times\ln(P_{f})" />
                        to establish the relationship between <IM f="D" /> and
                        <IM f="P_{f}" /> for studies that used either rats, mice, or rabbits as
                        their test species. This analysis used both least-squares and orthogonal
                        regression. The table below reports the species-specific regression
                        coefficients for the established relationship between <IM f="D" /> and{" "}
                        <IM f="P_{f}" />.
                    </p>
                    <table className="table table-condensed table-striped">
                        <thead>
                            <tr>
                                <th>Species</th>
                                <th>Method</th>
                                <th>$n$, Studies</th>
                                <th>$n$, Dose Groups</th>
                                <th>$a$</th>
                                <th>$b$</th>
                                <th>
                                    <IM f="\sigma_{res}^2" />
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>Mice</td>
                                <td>LS</td>
                                <td>21</td>
                                <td>88</td>
                                <td>1.5938</td>
                                <td>0.2866</td>
                                <td>0.2078</td>
                            </tr>
                            <tr>
                                <td>Mice</td>
                                <td>OR</td>
                                <td>21</td>
                                <td>88</td>
                                <td>1.6943</td>
                                <td>0.3132</td>
                                <td>0.1863</td>
                            </tr>
                            <tr>
                                <td>Rats</td>
                                <td>LS</td>
                                <td>25</td>
                                <td>101</td>
                                <td>1.6852</td>
                                <td>0.3310</td>
                                <td>0.1248</td>
                            </tr>
                            <tr>
                                <td>Rats</td>
                                <td>OR</td>
                                <td>25</td>
                                <td>101</td>
                                <td>1.8327</td>
                                <td>0.3690</td>
                                <td>0.1090</td>
                            </tr>
                            <tr>
                                <td>Rabbits</td>
                                <td>LS</td>
                                <td>10</td>
                                <td>43</td>
                                <td>1.0582</td>
                                <td>0.2397</td>
                                <td>0.1452</td>
                            </tr>
                            <tr>
                                <td>Rabbits</td>
                                <td>OR</td>
                                <td>10</td>
                                <td>43</td>
                                <td>1.1477</td>
                                <td>0.2739</td>
                                <td>0.1299</td>
                            </tr>
                        </tbody>
                    </table>
                    <p>
                        From these regression coefficients, the design effect can be calculated as
                        <IM f="D = e^{\left\lbrack a + b \times \ln(P_{f})+0.5\sigma_{res}^{2} \right\rbrack}" />
                        . Given there is no strong methodological preference using the design effect
                        calculated using linear least squares regression (<IM f="D_{LS}" />) vs the
                        design effect calculated using orthogonal regression (<IM f="D_{OR}" />
                        ), by practice the design effect estimated using these two regression
                        approaches is averaged to generate the average design effect (
                        <IM f="D_{average}" />) actually used in the scaling of <IM f="N_{f}" /> and{" "}
                        <IM f="A_{f}" />.
                    </p>
                    <p>
                        For modeling the transformed data in BMDS, scaled <IM f="{N_{f}}_{RS}" />{" "}
                        and <IM f="{A_{f}}_{RS}" /> values would be entered as the modeling inputs.
                    </p>
                    <p>
                        The ultimate consequence of the Rao-Scott transformation will be the
                        estimation of wider confidence intervals for the BMD, and thus lower BMDLs.
                        This is the consequence of the transformation that is most important as the
                        lower BMDLs of the Rao-Scott transformed fetal incidence data approximate
                        the BMDLs that would be estimated had individual-level data been modeled
                        with a nested dichotomous model.
                    </p>
                    <h3>Software Inputs</h3>
                    <p>
                        The dataset used for the Rao-Scott transformation should have the same
                        structure as regular dichotomous data and should have the following columns
                        in this sequence:
                    </p>

                    <ol>
                        <li>
                            <strong>Dose</strong> - the numeric value of the dose group
                        </li>
                        <li>
                            <strong>N</strong> - the numeric value for the number of fetuses
                            (irrespective of litter membership) per dose group
                        </li>
                        <li>
                            <strong>Incidence</strong> - the numeric value for the number of
                            affected fetuses (irrespective of litter membership) per dose group
                        </li>
                    </ol>
                    <p>
                        Additionally, users will need to select the species that corresponds to
                        their dose-response data; currently options for species are limited to rat,
                        mouse, and rabbit.
                    </p>
                    <h3>Software Outputs</h3>
                    <ol>
                        <li>A summary table of the original and adjusted data</li>
                        <li>
                            Plots of the original and adjusted values for both the total number of
                            fetuses and number of affected fetuses per dose group
                        </li>
                    </ol>
                    <p>
                        The <strong>Copy Data for BMDS Modeling</strong> link copies the summary
                        table data to the clipboard. From there, the user can return to their
                        Dichotomous analysis, return to the data tab, select the{" "}
                        <strong>Load dataset from Excel</strong> button, and paste the clipboard
                        contents to create a new dataset.
                    </p>
                    <h3>References</h3>
                    <p>
                        Fox JR, Hogan KA, Davis A. (2016) Dose-response modeling with summary data
                        from developmental studies. Risk Analysis 37(5): 905-917.
                        {ExternalAnchor(
                            "https://hero.epa.gov/hero/index.cfm/reference/details/reference_id/3392311",
                            "HERO",
                            "p-2 mx-1 badge badge-info"
                        )}
                        {ExternalAnchor(
                            "https://pubmed.ncbi.nlm.nih.gov/27567129/",
                            "PubMed",
                            "p-2 mx-1 badge badge-info"
                        )}
                    </p>
                </Modal.Body>
            </Modal>
        );
    }
}
AboutModal.propTypes = {
    store: PropTypes.object,
};
export default AboutModal;
