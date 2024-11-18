import {inject, observer} from "mobx-react";
import PropTypes from "prop-types";
import React, {Component} from "react";
import {Modal} from "react-bootstrap";

const externalReference = (href, text, classes) => {
    return (
        <a target="blank" className={classes} href={href}>
            {text}
        </a>
    );
};

@inject("store")
@observer
class AboutModal extends Component {
    render() {
        const {store} = this.props;
        return (
            <Modal size="xl" show={store.showAboutModal} onHide={() => store.setAboutModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Poly K Adjustment</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p>
                        The poly-k adjustment is an approach (based on the poly-k trend test
                        developed by&nbsp;
                        {externalReference(
                            "https://hero.epa.gov/hero/index.cfm/reference/details/reference_id/93236",
                            "Portier and Bailer (1989)"
                        )}
                        &nbsp;to correct for treatment-related differences in survival across
                        dose-groups in standard 2-year cancer bioassays.
                    </p>
                    <p>
                        Consider the example provided in Portier and Bailer, 1989: there exists a
                        tumor type that does not appear before 90 weeks of age and has 10%
                        incidence, so that the lifetime incidence would be 5 animals in a group of
                        50. If exposure to a carcinogen increases the lifetime incidence to 30%, 15
                        animals out of a group of 50 would develop the tumor. But, if exposure to
                        the carcinogen also decreases survival to 60% at 90 weeks, only 9 out of the
                        30 surviving exposed animals would develop a tumor. If this decrease in
                        survival is not taken into account, the incidence used in dose response
                        modeling would be 9/50.
                    </p>
                    <p>
                        Thus, by not taking differential survival into account, it is possible to
                        understate a chemical’s true carcinogenic potential when performing
                        dose-response analyses.
                    </p>
                    <p>
                        Animals in a carcinogenicity experiment can be placed into four bins for the
                        purpose of analysis:
                    </p>
                    <table className="table table-striped">
                        <thead>
                            <tr>
                                <th></th>
                                <th>Numerator contribution</th>
                                <th>Denominator contribution</th>
                                <th>Rationale for denominator contribution</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>
                                    <b>Survive until end of experiment, no tumor</b>
                                </td>
                                <td>0</td>
                                <td>1</td>
                                <td>Animal observed for full lifetime.</td>
                            </tr>
                            <tr>
                                <td>
                                    <b>Survive until end of experiment, develops tumor.</b>
                                </td>
                                <td>1</td>
                                <td>1</td>
                                <td>Animal observed for full lifetime</td>
                            </tr>
                            <tr>
                                <td>
                                    <b>Dies prior to end of experiment, develops tumor</b>
                                </td>
                                <td>1</td>
                                <td>1</td>
                                <td>
                                    Animal observed for less than full lifetime but observed for
                                    long enough time to develop tumor of interest.
                                </td>
                            </tr>
                            <tr>
                                <td>
                                    <b>Dies prior to end of experiment, no tumor</b>
                                </td>
                                <td>0</td>
                                <td>
                                    (t/t<sub>max</sub>)<sup>k</sup>
                                </td>
                                <td>
                                    Animal may have developed a tumor within a normal lifetime;
                                    contribution should account for acceleration of rate with age.
                                    Rationale for denominator contribution.
                                </td>
                            </tr>
                        </tbody>
                    </table>
                    <p>
                        Portier and Bailer (1989) provide rationale for how to determine the
                        denominator contribution of animals that die early without developing a
                        tumor:
                    </p>
                    <p>
                        If an animal in a 2-year bioassay dies after one year, this animal can be
                        considered to be at less risk of developing a tumor than animals that lived
                        until the end of the experiment. Thus, this animal should not contribute the
                        same amount of information as animals that survived until the end of the
                        experiment (irrespective of tumor status) or animals that did develop a
                        tumor (irrespective of survival time). In other words, this animal should
                        not be given a weight of 1 (i.e., should not be counted as 1 when
                        determining the denominator). If the risk of developing a tumor is constant
                        throughout a lifetime, this animal should be given a weight of ½ . However,
                        if tumor risk accelerates with age, this animal would be at (½)<sup>k</sup>
                        &nbsp; the risk of developing the tumor compared to animals that survive
                        until the end of the experiment, where k is the exponent for the polynomial
                        function describing the cumulative rate of tumor onset as a function of
                        time.&nbsp;
                        {externalReference(
                            "https://hero.epa.gov/hero/index.cfm/reference/details/reference_id/4998",
                            "Portier and Bailer (1986)"
                        )}
                        &nbsp;analyzed the untreated control groups of 47 NTP studies in mice and
                        rats and concluded at a 3rd order polynomial was a reasonable general value
                        of k.
                    </p>
                    <p>
                        Given the example above, an animal dying at one year would contribute a
                        weight of (½)<sup>3</sup>=0.125. For tumors that are quicker to develop, a
                        lower value of k can be used (such that animals dying early provide more
                        information). Conversely, for slower developing tumors, a higher value of k
                        can be used (such that animals dying early provide less information).
                    </p>
                    <p>
                        Use of the poly-3 adjustment will result in survival adjusted Ns (frequently
                        non-integer values) that can be used in dose-response analyses.
                    </p>
                    <p>
                        <b>The inputs for this tool are:</b>
                    </p>
                    <ol>
                        <li>
                            Dose units – the dose metrics for the data being adjusted (e.g., ppm,
                            mg/kg-d)
                        </li>
                        <li>
                            Power – the power to be used for the adjustment. Defaults to 3, but can
                            be adjusted given the nature of the tumors being analyzed.
                        </li>
                        <li>
                            Duration – the duration of the study in days. By default (if empty), the
                            maximum reported day in the dataset. In&nbsp;
                            {externalReference(
                                "https://hero.epa.gov/hero/index.cfm/reference/details/reference_id/708980",
                                "Kissling et al. (2008)"
                            )}
                            , the authors note that the poly-3 adjustment has not been validated for
                            carcinogenicity studies longer than two years, consistent with the
                            conclusion of the Portier et al. (1986) analysis that acknowledges that
                            “animals used in historical control data base were generally sacrificed
                            if they lived to 109 weeks…. Thus, the application of these models
                            beyond 109 weeks would be speculative.”
                        </li>
                        <li>
                            Dataset – the dose-response data that will be adjusted, provided in an
                            uploaded CSV file with the following structure:
                            <ol type="a">
                                <li>Dose - numeric value of dose group</li>
                                <li>Day – numeric value of survival time</li>
                                <li>
                                    Tumor status – numeric value indicate if animal did not have
                                    tumor (0) or did have tumor (1)
                                </li>
                            </ol>
                        </li>
                    </ol>
                    <p>
                        <b>The outputs from this tool are:</b>
                    </p>
                    <ol>
                        <li>A summary table of the original and adjusted data</li>
                        <li>
                            A plot of the adjusted proportions compared to the original proportions
                        </li>
                        <li>A plot of the tumor incidence over study duration</li>
                        <li>
                            A table for the full dataset reporting the original data and the weight
                            that each animal provides to the denominator
                        </li>
                    </ol>
                    <h2>References:</h2>
                    <p>
                        Kissling GE, Portier CJ, Huff J. (2008) MtBE and cancer in animals:
                        statistical issues with poly-3 survival adjustments for lifetime studies.
                        Regul Toxicol Pharmacol. 50(3):428-429.
                        {externalReference(
                            "https://hero.epa.gov/hero/index.cfm/reference/details/reference_id/708980",
                            "HERO",
                            "p-2 mx-1 badge badge-info"
                        )}
                        {externalReference(
                            "https://pubmed.ncbi.nlm.nih.gov/17905498/",
                            "PubMed",
                            "p-2 mx-1 badge badge-info"
                        )}
                    </p>
                    <p>
                        Portier CJ, Bailer AJ. (1989). Testing for increased carcinogenicity using a
                        survival-adjusted quantal response test. Fund Appl Toxicol 12(4):731-737.
                        {externalReference(
                            "https://hero.epa.gov/hero/index.cfm/reference/details/reference_id/93236",
                            "HERO",
                            "p-2 mx-1 badge badge-info"
                        )}
                        {externalReference(
                            "https://pubmed.ncbi.nlm.nih.gov/2744275/",
                            "PubMed",
                            "p-2 mx-1 badge badge-info"
                        )}
                    </p>
                    <p>
                        Portier CJ, Hedges JC, Hoel DG. (1986). Age-specific models of mortality and
                        tumor onset for historical control animals in the National Toxicology
                        Program’s carcinogenicity experiments. Cancer Research 46: 4372-4378.
                        {externalReference(
                            "https://hero.epa.gov/hero/index.cfm/reference/details/reference_id/4998",
                            "HERO",
                            "p-2 mx-1 badge badge-info"
                        )}
                        {externalReference(
                            "https://pubmed.ncbi.nlm.nih.gov/3731095/",
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
