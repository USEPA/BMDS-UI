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
                    <Modal.Title>Jonckheere-Terpstra Trend Test</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p>
                        The Jonckheere-Terpstra trend test (
                        {ExternalAnchor(
                            "https://www.jstor.org/stable/2333011?seq=1",
                            "Jonckheere, 1954"
                        )}{" "}
                        ;{" "}
                        {ExternalAnchor(
                            "https://scispace.com/pdf/the-asymptotic-normality-and-consistency-of-kendall-s-test-59ew49i1tf.pdf",
                            "Terpstra, 1954"
                        )}
                        ) is a non-parametric statistical test used to detect a trend in continuous
                        response data across ordered dose groups. The null hypothesis for the
                        Jonckheere-Terpstra trend test is that the continuous response data are all
                        from the same population, that is, the sample medians for all dose groups
                        are equal. The alternative hypothesis is that the sample medians have an{" "}
                        <i>
                            <strong>a priori</strong>
                        </i>{" "}
                        ordering with at least one dose group sample being larger or smaller than
                        the others. The test statistic counts, for each dose group, the number of
                        times values in that group are greater than those in every lower order dose
                        group and sums these counts across groups. A statistically significant tend
                        can be inferred when the trend test p-value <IM f="< 0.05" />.
                    </p>
                    <p>
                        The Jonckheere-Terpstra trend test can be performed using a one-sided
                        alternative hypothesis that the trend in responses is either increasing or
                        decreasing (with the direction set by the user before running the test) or a
                        two-sided alternative hypothesis used to detect a trend in either direction.
                        Both exact and approximate versions of the Jonckheere-Terpstra trend test
                        are available.
                    </p>
                    <p>
                        When running the Jonckheere-Terpstra trend test, the exact method, utilizing
                        a convolution approach to compute the null distribution of the
                        Jonckheere-Terpstra statistic, is preferentially used. However, this exact
                        method is only available when there are no ties in the data (i.e., there are
                        no equal response values in the data set across dose groups) and when the
                        total sample size is less than 150. The limit on sample size is based on the
                        observation that computation time for the exact Jonckheere's test increases
                        in an exponential fashion with increasing total <IM f="N" />:
                    </p>
                    <p
                        style={{
                            margin: "0 auto",
                            maxWidth: "600px",
                            width: "40%",
                            textAlign: "center",
                        }}>
                        Computation time for the exact Jonckheere-Terpstra trend test
                    </p>
                    <table
                        className="table table-condensed table-sm text-center table-striped table--tight"
                        style={{maxWidth: "600px", width: "40%", margin: "0 auto"}}>
                        <thead>
                            <tr>
                                <th>Total Sample size ($N$)</th>
                                <th>Computation Time ($s$)</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>60</td>
                                <td>0.56</td>
                            </tr>
                            <tr>
                                <td>100</td>
                                <td>6.8</td>
                            </tr>
                            <tr>
                                <td>150</td>
                                <td>54</td>
                            </tr>
                            <tr>
                                <td>190</td>
                                <td>254</td>
                            </tr>
                            <tr>
                                <td>200</td>
                                <td>1026</td>
                            </tr>
                        </tbody>
                    </table>
                    <p>
                        When the total N exceeds 150 or ties in the data exist, the approximate
                        approach, based on a normal approximation of the test statistics, is used
                        instead.
                    </p>
                    <p>
                        Alterntatively, users can also opt to use a permutation approach that is not
                        dependent on any distributional assumptions. This approach iteratively
                        reshuffles the observed data (i.e., reshuffles the response data relative to
                        dose group labels) to generate a dataset that might be expected due to
                        chance. For each reshuffled (permuted) dataset, the test statistic is
                        calculated and compared to the original test statistic. The final p-value is
                        then the the proportion of permutted statistics that are greater than or
                        lesser than the original statistic for decreasing and increasing trends,
                        respectively.
                    </p>
                    <p>
                        Individual data are required for the Jonckheere-Terpstra trend test. If
                        users only have summary level continuous data (i.e., means and standard
                        deviations only), BMDS includes an approach to calculate synthetic
                        individual response data that corresponds to the observed summary
                        statistics. This is done by iteratively generating random samples using a
                        normal distribution; random samples are generated until the sample mean and
                        standard deviation match the target (i.e., observed) mean and standard
                        deviation or until the maximum number of iterations are reached. If no
                        sampled mean and standard deviation are found that match the target values,
                        an error message is returned.
                    </p>
                    <h3>Software Inputs</h3>
                    <p>
                        The dataset will initially be populated from the Data tab of the BMDS
                        analysis. Users can also opt to manually enter or paste a dataset.
                    </p>
                    <p>
                        The dataset used for the Jonckheere-Terpstra trend test should have the same
                        structure as Summarized Continuous or Individual Continuous data and should
                        have the following columns in this sequence:
                    </p>
                    <h5>Summarized Contintuous Data Input</h5>
                    <ol>
                        <li>
                            <strong>doses</strong> - the numeric value of each dose group
                        </li>
                        <li>
                            <strong>ns</strong> - the total number of subjects per dose group
                        </li>
                        <li>
                            <strong>means</strong> - the numeric value for the mean response per
                            dose group
                        </li>
                        <li>
                            <strong>stdevs</strong> - the numeric value for the standard deviation
                            per dose group
                        </li>
                    </ol>
                    <h5>Individual Continuous Data Input</h5>
                    <ol>
                        <li>
                            <strong>doses</strong> - the numeric value of each dose
                        </li>
                        <li>
                            <strong>responses</strong> - the response value for each individual
                        </li>
                    </ol>
                    <h5>Settings Inputs</h5>
                    <ol>
                        <li>
                            <strong>Hypothesis</strong> - [Increasing, Decreasing, Two-Sided]
                        </li>
                        <li>
                            <strong>Number of Permutations</strong> - (optional) Setting a number of
                            permutations will run the test using 'permutation' approach.
                        </li>
                    </ol>
                    <h3>Software Outputs</h3>
                    <ol>
                        <li>
                            <strong>Hypothesis</strong> - [Increasing, Decreasing, Two-Sided]
                        </li>
                        <li>
                            <strong>Statistic</strong>
                        </li>
                        <li>
                            <strong>Approach (P-Value)</strong> - [exact, approximate, permutation]
                        </li>
                        <li>
                            <strong>P-Value</strong>
                        </li>
                    </ol>
                    <h3>References</h3>
                    <p>
                        Jonckheere, A.R. (1954) A Distribution-Free k-Sample Test Against Ordered
                        Alternatives. Biometrika 41(1/2): 133-145.
                        {ExternalAnchor(
                            "https://www.jstor.org/stable/2333011?seq=1",
                            "JSTOR",
                            "p-2 mx-1 badge badge-info"
                        )}
                    </p>
                    <p>
                        Terpstra, T.J. (1952) The Asymptotic Normality and Consistency of Kendall’s
                        Test against Trend, When Ties Are Present in One Ranking. Indigationes
                        Mathematicae, 14, 327-333.
                        {ExternalAnchor(
                            "https://scispace.com/pdf/the-asymptotic-normality-and-consistency-of-kendall-s-test-59ew49i1tf.pdf",
                            "SciSpace",
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
