import json
from datetime import timedelta

import pandas as pd
import plotly.express as px
from pandas.tseries.offsets import Week
from plotly.graph_objs._figure import Figure


def to_dict(fig: Figure) -> dict:
    return json.loads(fig.to_json())


def punchcard(df: pd.DataFrame, color_scale: str = "viridis") -> Figure:
    """Generate a punchcard style plotly heatmap of count per day of week

    The x-axis is the week number, and the y-axis is the day of the week.

    Args:
        df (pd.DataFrame): A pandas dataframe with two columns, day and count

    Returns:
        Figure: A plotly heatmap figure
    """
    if df.columns.values.tolist() != ["day", "count"]:
        raise ValueError("Unknown data type")
    d1 = df.set_index("day")
    start_day = d1.index.min()
    end_day = d1.index.max()
    if (end_day - start_day).days < 30:
        start_day - timedelta(days=30)

    d2 = pd.date_range(start_day, end_day, name="day").to_frame(name="tmp").drop(columns="tmp")

    df = (
        d2.merge(d1, how="left", left_index=True, right_index=True)
        .fillna(0)
        .astype(int)
        .reset_index()
    )
    df.loc[:, "x"] = (df.day.dt.year + df.day.dt.isocalendar().week / 52).astype(str)
    df.loc[:, "xlabel"] = df.day.where(
        df.day.dt.weekday == 0, df.day - Week(weekday=0)
    ).dt.strftime("%Y-%m-%d ")
    df.loc[:, "y"] = df.day.dt.day_of_week  # Monday=0, Sunday=6

    piv = (
        df.pivot_table(index="y", columns="xlabel", values="count", aggfunc="sum")
        .fillna(0)
        .astype(int)
    )

    fig = px.imshow(
        piv.values,
        labels=dict(x="Week", y="Day of week", color="Count"),
        x=piv.columns,
        y=["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
        color_continuous_scale=color_scale,
    )
    return fig
