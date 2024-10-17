from bmds_ui.analysis import utils


def test_get_citation(settings):
    initial = settings.IS_DESKTOP

    settings.IS_DESKTOP = False
    assert "BMDS Online" in utils.get_citation()

    settings.IS_DESKTOP = True
    assert "BMDS Desktop" in utils.get_citation()

    settings.IS_DESKTOP = initial
