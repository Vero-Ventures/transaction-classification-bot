import pandas as pd

path = "./data"
singleton_data = "/Formated_LLM.csv"

singleton = pd.read_csv(path + singleton_data)
singleton.head()


# Create the test data for the no history case
def create_no_history(df):
    grouped = df.groupby(df.index // 30)

    # Export the data to new two csv files (test and expected)
    for i, group in grouped:
        group.to_csv(
            path + "/tests/No History/Expected_No_History_" + str(i + 1) + ".csv",
            index=False,
        )

        # Remove the category column
        group = group.drop("category", axis=1)
        group.to_csv(
            path + "/tests/No History/Test_No_History_" + str(i + 1) + ".csv",
            index=False,
        )

    # Full list
    df.to_csv(path + "/tests/No History/Expected_No_History_Full.csv", index=False)
    temp = df.drop("category", axis=1)
    temp.to_csv(path + "/tests/No History/Test_No_History_Full.csv", index=False)


create_no_history(singleton)


all_data = "/Formated_All_Valid_Transactions.csv"
all_valid = pd.read_csv(path + all_data)
all_valid.head()


# Create the test data for the with history case
def create_with_history(singleton, all_valid):
    filtered = all_valid[all_valid["name"].isin(singleton["name"])]

    for i in range(5):
        sampled = filtered.sample(n=30)
        expected = pd.concat([singleton, sampled])
        expected.to_csv(
            path + f"/tests/With History/Expected_With_History_{i + 1}.csv", index=False
        )

        sampled = sampled.drop("category", axis=1)
        combined = pd.concat([singleton, sampled])
        combined.to_csv(
            path + f"/tests/With History/Test_With_History_{i + 1}.csv", index=False
        )


create_with_history(singleton, all_valid)
