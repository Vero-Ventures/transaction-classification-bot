import pandas as pd

path = "./data/"
file_path = "data/Accountant_Data.xlsx"
xls = pd.ExcelFile(file_path)

pd.set_option("display.width", 1000)
pd.set_option("display.max_columns", None)

for sheet_name in xls.sheet_names:
    df = pd.read_excel(file_path, sheet_name=sheet_name)

    print(f"\nBefore formatting {sheet_name}:")
    print(df.head())

    df = df.drop(["Unnamed: 0"], axis=1)
    df = df.dropna(subset=["Name", "Split"])

    # rename columns
    df.rename(
        columns={
            "Date": "date",
            "Transaction Type": "transaction_type",
            "Name": "name",
            "Account": "account",
            "Split": "category",
            "Amount": "amount",
        },
        inplace=True,
    )

    # remove leading numbers from Split column
    df["category"] = df["category"].str.replace(r"^\d+", "", regex=True)

    # add transaction_ID
    df["transaction_ID"] = df.index + 1
    # make transaction_ID to first column
    cols = df.columns.tolist()
    cols = cols[-1:] + cols[:-1]
    df = df[cols]

    print(f"\nAfter formatting {sheet_name}:")
    print(df.head())

    csv_file_path = f'./data/{"Formated_" + sheet_name.replace(" ", "_")}.csv'
    df.to_csv(csv_file_path, index=False)
    print(f"Saved {sheet_name} to {csv_file_path}")
