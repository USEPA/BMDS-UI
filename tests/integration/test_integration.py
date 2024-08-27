from playwright.sync_api import Page, expect

from bmds_ui.analysis.models import Analysis

from .common import PlaywrightTestCase

# current version: {"analysis_schema_version": "1.1"}
analysis_pks = [
    ("432a6083-f9aa-4de2-a71f-a6488b4c5bf1", "dichotomous"),
    ("cfe458aa-2313-44c0-9346-f4931567bef0", "continuous summary"),
    ("09c09d22-2e1a-413c-b350-6b19969f6533", "continuous individual"),
    ("4459f728-05f7-4057-a27c-174822a0313d", "nested dichotomous"),
    ("2f86f324-911d-4194-97d1-fc7c3f5d0c72", "multitumor"),
]


class TestContinuousIntegration(PlaywrightTestCase):
    def _create_new_analysis(self) -> Page:
        self.page.goto(self.url("/"))
        with self.page.expect_navigation():
            self.page.get_by_role("button", name="Create a new BMDS analysis").click()
        return self.page

    def _test_continuous(self, option: str):
        page = self._create_new_analysis()

        # set main input
        page.locator("#analysis_name").fill("abc")
        page.locator("#analysis_description").fill("def")
        page.locator("#analysis_model_type").select_option("C")

        # select models
        page.locator("#select_all_frequentist_restricted").click()

        # view data tab
        page.get_by_role("link", name="Data").click()
        page.locator("#datasetType").select_option(option)
        page.get_by_role("button", name="New").click()
        page.get_by_role("button", name="Load an example dataset").click()

        # save current settings
        page.locator('a:has-text("Settings")').click()
        page.locator("text=Save Analysis").click()

        # execute and wait until complete
        page.locator("text=Run Analysis").click()
        expect(page.locator("#controlPanel")).to_contain_text("Executing, please wait...")

        # view output summary tables
        page.locator('a:has-text("Output")').click()
        expect(page.locator("#frequentist-model-result tbody tr")).to_have_count(2)

        # display frequentist modal
        page.locator("#freq-result-0").click()
        expect(page.locator("#info-table tbody tr")).to_have_count(3)
        page.locator("#close-modal").click()

        page.locator("#selection_model").select_option("0")
        page.locator("#selection_notes").fill("selected!")
        page.locator("#selection_submit").click()
        expect(page.locator(".toast")).to_contain_text("Model selection updated.")

        page.locator('a:has-text("Logic")').click()
        expect(page.locator("#decision-logic tbody tr")).to_have_count(4)
        expect(page.locator("#rule-table tbody tr")).to_have_count(20)

        # Read-only
        page.get_by_role("button", name="Share").click()
        with page.expect_popup() as page2_info:
            page.get_by_role("link", name="Open").first.click()
        page2 = page2_info.value

        page2.get_by_role("link", name="Settings").click()
        expect(page2.get_by_role("cell", name="abc")).to_be_visible()

        page2.get_by_role("link", name="Data").click()
        expect(page2.get_by_text("Dataset Name: Dataset #1")).to_be_visible()

        page2.get_by_role("link", name="Output").click()
        expect(page2.get_by_text("Dataset Name: Dataset #1")).to_be_visible()

        page2.get_by_role("link", name="Logic").click()
        expect(page2.get_by_role("cell", name="Decision Logic")).to_be_visible()

    def test_continuous_summary(self):
        # create new analysis and make sure we can execute, view results, and view read-only page
        self._test_continuous(option="CS")

    def test_continuous_individual(self):
        # create new analysis and make sure we can execute, view results, and view read-only page
        self._test_continuous(option="I")

    def test_dichotomous(self):
        # create new analysis and make sure we can execute, view results, and view read-only page
        page = self._create_new_analysis()

        # set main input
        page.locator("#analysis_name").fill("abc")
        page.locator("#analysis_description").fill("def")
        page.locator("#analysis_model_type").select_option("D")

        # select models
        page.locator("#select_all_frequentist_restricted").click(click_count=2)
        page.locator("#select_all_frequentist_unrestricted").click(click_count=2)
        page.locator("#frequentist_unrestricted-Logistic").check()
        page.locator("#bayesian-Logistic").check()

        # view data tab
        page.get_by_role("link", name="Data").click()
        page.get_by_role("button", name="New").click()
        page.get_by_role("button", name="Load an example dataset").click()

        # save current settings
        page.locator('a:has-text("Settings")').click()
        page.locator("text=Save Analysis").click()

        # execute and wait until complete
        page.locator("text=Run Analysis").click()
        expect(page.locator("#controlPanel")).to_contain_text("Executing, please wait...")

        # view output summary tables
        page.locator('a:has-text("Output")').click()
        expect(page.locator("#frequentist-model-result tbody tr")).to_have_count(2)
        expect(page.locator("#bayesian-model-result tbody tr")).to_have_count(2)

        # display frequentist modal
        page.locator("#freq-result-0").click()
        expect(page.locator("#info-table tbody tr")).to_have_count(3)
        page.locator("#close-modal").click()

        # display bayesian modal
        page.locator("#bayesian-result-0").click()
        expect(page.locator("#info-table tbody tr")).to_have_count(3)
        page.locator("#close-modal").click()

        # display bayesian model average modal
        page.locator("td", has_text="Model Average").click()
        expect(page.locator("#ma-result-summary tbody tr")).to_have_count(3)
        page.locator("#close-modal").click()

        page.locator("#selection_model").select_option("0")
        page.locator("#selection_notes").fill("selected!")
        page.locator("#selection_submit").click()
        expect(page.locator(".toast")).to_contain_text("Model selection updated.")

        page.locator('a:has-text("Logic")').click()
        expect(page.locator("#decision-logic tbody tr")).to_have_count(4)
        expect(page.locator("#rule-table tbody tr")).to_have_count(18)

        # Read-only
        page.get_by_role("button", name="Share").click()
        with page.expect_popup() as page2_info:
            page.get_by_role("link", name="Open").first.click()
        page2 = page2_info.value

        page2.get_by_role("link", name="Settings").click()
        expect(page2.get_by_role("cell", name="abc")).to_be_visible()

        page2.get_by_role("link", name="Data").click()
        expect(page2.get_by_text("Dataset Name: Dataset #1")).to_be_visible()

        page2.get_by_role("link", name="Output").click()
        expect(page2.get_by_text("Dataset Name: Dataset #1")).to_be_visible()

        page2.get_by_role("link", name="Logic").click()
        expect(page2.get_by_role("cell", name="Decision Logic")).to_be_visible()

    def test_nested_dichotomous(self):
        # create new analysis and make sure we can execute, view results, and view read-only page
        page = self._create_new_analysis()

        # set main input
        page.locator("#analysis_name").fill("abc")
        page.locator("#analysis_description").fill("def")
        page.locator("#analysis_model_type").select_option("ND")

        # view data tab, add 2 datasets
        page.get_by_role("link", name="Data").click()
        page.get_by_role("button", name="New").click()
        page.get_by_role("button", name="Load an example dataset").click()
        page.get_by_role("button", name="New").click()
        page.get_by_role("button", name="Load an example dataset").click()

        # save current settings
        page.locator('a:has-text("Settings")').click()
        page.get_by_role("button", name="Save Analysis").click()

        # execute and wait until complete
        page.locator("text=Run Analysis").click()
        expect(page.locator("#controlPanel")).to_contain_text("Executing, please wait...")

        # view output summary tables
        page.locator('a:has-text("Output")').click()
        # num rows in results table
        expect(page.locator("#frequentist-model-result tbody tr")).to_have_count(5)

        # check one result
        page.get_by_role("link", name="Nested Logistic (lsc+ilc-)").click()
        expect(page.get_by_role("dialog")).to_contain_text("Nested Logistic (lsc+ilc-)")
        page.locator("#close-modal").click()

        # Read-only
        page.get_by_role("button", name="Share").click()
        with page.expect_popup() as page2_info:
            page.get_by_role("link", name="Open").first.click()
        page2 = page2_info.value

        page2.get_by_role("link", name="Settings").click()
        expect(page2.get_by_role("cell", name="abc")).to_be_visible()

        page2.get_by_role("link", name="Data").click()
        expect(page2.get_by_text("Dataset Name: Dataset #1")).to_be_visible()

        page2.get_by_role("link", name="Output").click()
        expect(page2.get_by_text("Dataset Name: Dataset #1")).to_be_visible()

        page2.get_by_role("link", name="Logic").click()
        expect(page2.get_by_role("cell", name="Decision Logic")).to_be_visible()

    def test_multi_tumor(self):
        # create new analysis and make sure we can execute, view results, and view read-only page
        page = self._create_new_analysis()

        # set main input
        page.locator("#analysis_name").fill("abc")
        page.locator("#analysis_description").fill("def")
        page.locator("#analysis_model_type").select_option("MT")

        # view data tab, add 3 datasets
        page.get_by_role("link", name="Data").click()
        page.get_by_role("button", name="New").click()

        page.get_by_role("button", name="Load an example dataset").click()

        # 2nd dataset
        page.get_by_role("button", name="New").click()
        page.get_by_role("button", name="Load an example dataset").click()

        # 3rd dataset
        page.get_by_role("button", name="New").click()
        page.get_by_role("button", name="Load an example dataset").click()

        # save current settings
        page.locator('a:has-text("Settings")').click()
        page.locator("text=Save Analysis").click()

        # execute and wait until complete
        page.locator("text=Run Analysis").click()
        expect(page.locator("#controlPanel")).to_contain_text("Executing, please wait...")

        # view output summary tables
        page.locator('a:has-text("Output")').click()

        # check one result (multitumor)
        page.get_by_role("link", name="Multitumor").click()
        expect(page.get_by_role("dialog")).to_contain_text("MS Combo")
        page.locator("#close-modal").click()

        # check one result (individual)
        expect(page.get_by_role("link", name="Multistage 2*")).to_have_count(3)
        page.get_by_role("link", name="Multistage 2*").nth(1).click()
        expect(page.get_by_role("dialog")).to_contain_text("Multistage 2")
        page.locator("#close-modal").click()

        # Read-only
        page.get_by_role("button", name="Share").click()
        with page.expect_popup() as page2_info:
            page.get_by_role("link", name="Open").first.click()
        page2 = page2_info.value

        page2.get_by_role("link", name="Settings").click()
        expect(page2.get_by_role("cell", name="abc")).to_be_visible()

        page2.get_by_role("link", name="Data").click()
        expect(page2.get_by_text("Select existing")).to_be_visible()

        page2.get_by_role("link", name="Output").click()
        expect(page2.get_by_text("Model Results")).to_be_visible()

    def test_read_view(self):
        # load existing analyses in our database and confirm we can view everything in read-only mode
        page = self.page
        for pk, model_type in analysis_pks:
            a = Analysis.objects.get(pk=pk)
            self.page.goto(self.url(a.get_absolute_url()))

            # check main tab loads
            expect(page.get_by_role("cell", name="Analysis Name:")).to_be_visible()

            # check data tab loads
            page.get_by_role("link", name="Data").click()
            expect(page.get_by_text("Dataset Name:")).to_be_visible()

            # check output tab loads
            page.get_by_role("link", name="Output").click()
            if model_type == "multitumor":
                expect(page.get_by_role("heading", name="Model Results")).to_be_visible()
            else:
                expect(page.locator("#frequentist-model-result")).to_be_visible()

            # check logic tab loads (not present with multitumor)
            if model_type != "multitumor":
                page.get_by_role("link", name="Logic").click()
                expect(page.get_by_role("cell", name="Decision Logic")).to_be_visible()

    def test_edit_view(self):
        # load existing analyses in our database and confirm we can view everything in editable mode
        page = self.page
        for pk, model_type in analysis_pks:
            a = Analysis.objects.get(pk=pk)
            self.page.goto(self.url(a.get_edit_url()))

            # check main tab loads
            expect(page.locator("#analysis_name")).to_be_visible()

            # check data tab loads
            page.get_by_role("link", name="Data").click()
            expect(page.get_by_role("button", name="New")).to_be_visible()

            # check output tab loads
            page.get_by_role("link", name="Output").click()
            if model_type == "multitumor":
                expect(page.get_by_role("heading", name="Model Results")).to_be_visible()
            else:
                expect(page.locator("#frequentist-model-result")).to_be_visible()

            # check logic tab loads (not present with multitumor)
            if model_type != "multitumor":
                page.get_by_role("link", name="Logic").click()
                expect(page.get_by_role("cell", name="Decision Logic")).to_be_visible()
