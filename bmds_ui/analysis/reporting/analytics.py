from collections import Counter

import pandas as pd
import plotly.express as px
from django.conf import settings
from django.db.models import BooleanField, Count, ExpressionWrapper, F, Q
from django.db.models.functions import TruncDay, TruncMonth, TruncWeek

from ...common.figures import punchcard
from ...common.utils import timeout_cache
from ..models import Analysis


def time_series() -> dict:
    stats = {}

    # per day
    df = pd.DataFrame(
        data=Analysis.objects.annotate(day=TruncDay("created"))
        .values("day")
        .order_by("day")
        .annotate(count=Count("id"))
        .values("day", "count")
    )

    # per day line chart
    fig = px.line(df, x="day", y="count", title="Analyses created per day", markers=True)
    stats["fig_per_day"] = fig

    # per day punchcard chart
    fig = punchcard(df)
    fig.update_layout(title="Analysis creations per day")
    stats["fig_punchcard"] = fig

    # per week
    df = pd.DataFrame(
        data=Analysis.objects.annotate(week=TruncWeek("created"))
        .values("week")
        .order_by("week")
        .annotate(count=Count("id"))
        .values("week", "count")
    )
    fig = px.line(df, x="week", y="count", title="Analyses created per week", markers=True)
    stats["fig_per_week"] = fig

    # per month
    df = pd.DataFrame(
        data=Analysis.objects.annotate(month=TruncMonth("created"))
        .values("month")
        .order_by("month")
        .annotate(count=Count("id"))
        .values("month", "count")
    )
    fig = px.bar(df, x="month", y="count", title="Analyses created per month", text_auto=True)
    stats["fig_per_month"] = fig
    return stats


def successes() -> dict:
    stats = {}

    # completions per week
    completed_filter = ExpressionWrapper(
        Q(ended__isnull=False) & Q(outputs__outputs__isnull=False), output_field=BooleanField()
    )
    df = pd.DataFrame(
        data=Analysis.objects.annotate(completed=completed_filter)
        .annotate(week=TruncWeek("created"))
        .values("week", "completed")
        .order_by("week")
        .annotate(count=Count("id"))
        .values("week", "completed", "count")
    )
    df["completed"] = df.completed.map({True: "completed", False: "not completed"})
    fig = px.bar(
        df,
        x="week",
        y="count",
        color="completed",
        title="Successful completions per week",
        text_auto=True,
        color_discrete_sequence=["goldenrod", "royalblue"],
    )
    stats["fig_completions_per_week"] = fig

    completed_filter = ExpressionWrapper(
        Q(ended__isnull=False) & Q(outputs__outputs__isnull=False), output_field=BooleanField()
    )
    df = pd.DataFrame(
        data=Analysis.objects.annotate(completed=completed_filter)
        .annotate(month=TruncMonth("created"))
        .values("month", "completed")
        .order_by("month")
        .annotate(count=Count("id"))
        .values("month", "completed", "count")
    )
    df["completed"] = df.completed.map({True: "completed", False: "not completed"})
    fig = px.bar(
        df,
        x="month",
        y="count",
        color="completed",
        title="Successful completions per month",
        text_auto=True,
        color_discrete_sequence=["goldenrod", "royalblue"],
    )
    stats["fig_completions_per_month"] = fig

    return stats


def datasets() -> dict:
    stats = {}

    # dataset count by option set
    completed_filter = ExpressionWrapper(
        Q(ended__isnull=False) & Q(outputs__outputs__isnull=False), output_field=BooleanField()
    )
    completed_qs = Analysis.objects.annotate(completed=completed_filter).filter(completed=True)
    mappings = Counter()
    data_types = Counter()
    model_classes = Counter()
    for analysis in completed_qs.only("inputs").iterator():
        mappings[(len(analysis.inputs["datasets"]), len(analysis.inputs["options"]))] += 1
        data_types.update([dataset["dtype"] for dataset in analysis.inputs["datasets"]])
        first_ds = analysis.inputs["datasets"][0]["dtype"]
        if first_ds == "D":
            has_frequentist = (
                len(analysis.inputs["models"].get("frequentist_restricted", [])) > 0
                or len(analysis.inputs["models"].get("frequentist_unrestricted", [])) > 0
            )
            has_bayesian = len(analysis.inputs["models"].get("bayesian", [])) > 0
            model_classes[(has_frequentist, has_bayesian)] += 1

    df = pd.DataFrame(
        data=[(ds, os, count) for (ds, os), count in mappings.items()],
        columns=["n_dataset", "n_options", "count"],
    )
    df.head()

    fig = px.imshow(
        df.pivot_table(index="n_dataset", columns=["n_options"], values=["count"])
        .fillna(0)
        .droplevel(0, axis=1),
        text_auto=True,
        labels=dict(x="# option sets", y="# datasets", color="# analyses"),
        color_continuous_scale="mint",
    )
    stats["fig_n_dataset_option"] = fig

    fig = px.bar(df.groupby("n_dataset")["count"].sum(), text_auto=True)
    stats["fig_n_dataset"] = fig

    fig = px.bar(df.groupby("n_options")["count"].sum(), text_auto=True)
    stats["fig_n_options"] = fig

    df = pd.DataFrame(data=data_types.items(), columns=["data_type", "count"])
    df.loc[:, "data_type"] = df.data_type.map(
        {"C": "Continuous", "CI": "Countinuous Individual", "D": "Dichotomous"}
    )
    fig = px.pie(df, names="data_type", values="count", hole=0.6, title="Runs by data type")
    stats["fig_by_type"] = fig

    # cross tab
    df = pd.DataFrame(
        data=[(freq, bayes, count) for (freq, bayes), count in model_classes.items()],
        columns=["frequentist", "bayesian", "counts"],
    )
    df = df.assign(
        frequentist=df.frequentist.map({True: "yes", False: "no"}),
        bayesian=df.bayesian.map({True: "yes", False: "no"}),
    )
    ct = (
        pd.crosstab(
            df.frequentist,
            columns=df.bayesian,
            values=df.counts,
            aggfunc="sum",
            margins=True,
            margins_name="Total",
        )
        .fillna(0)
        .astype(int)
    )
    stats["fig_dichotomous_table"] = ct.to_dict(orient="records")
    return stats


def runtime() -> dict:
    stats = {}
    qs = (
        Analysis.objects.filter(started__isnull=False, ended__isnull=False)
        .annotate(runtime=F("ended") - F("started"))
        .values_list("runtime", flat=True)
    )
    data = pd.Series(pd.Series(qs).dt.total_seconds(), name="Runtime (s)")
    fig = px.box(data, log_y=True)
    stats["fig_boxplot"] = fig
    stats["stats"] = data.describe().to_dict()

    failures = Analysis.objects.filter(started__isnull=False, ended__isnull=True).order_by(
        "-created"
    )[:50]
    stats["failures"] = [
        {"timestamp": analysis.created, "url": analysis.get_absolute_url()} for analysis in failures
    ]

    return stats


def get_analytics() -> dict:
    n_total = Analysis.objects.count()
    first_date = Analysis.objects.earliest("created").created.date()
    last_date = Analysis.objects.latest("created").created.date()
    n_days = (last_date - first_date).days + 1
    n_completed = Analysis.objects.filter(
        ended__isnull=False, outputs__outputs__isnull=False
    ).count()
    return dict(
        first_date=first_date,
        last_date=last_date,
        n_total=n_total,
        n_days=n_days,
        created_per_day=n_total / n_days,
        n_completed=n_completed,
        fraction_completed=n_completed / n_total * 100,
        n_completed_per_day=n_completed / n_days,
        time_series=time_series(),
        successes=successes(),
        datasets=datasets(),
        runtime=runtime(),
    )


@timeout_cache("func-get_analytics", 10 if settings.DEBUG else 3600)
def get_cached_analytics():
    return get_analytics()
