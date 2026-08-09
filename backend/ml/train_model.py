import os
import joblib
import pandas as pd

from sklearn.model_selection import train_test_split
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.pipeline import Pipeline
from sklearn.metrics import (
    accuracy_score,
    classification_report,
    confusion_matrix
)


# =========================================================
# DATASET PATH
# =========================================================

BASE_DIR = os.path.dirname(
    os.path.abspath(__file__)
)

DATASET_PATH = os.path.join(
    BASE_DIR,
    "SMSSpamCollection"
)


# =========================================================
# LOAD DATASET
# =========================================================

df = pd.read_csv(
    DATASET_PATH,
    sep="\t",
    header=None,
    names=["label", "message"],
    encoding="utf-8"
)


print("Dataset loaded successfully!")
print("Total messages:", len(df))

print("\nClass distribution:")
print(df["label"].value_counts())


# =========================================================
# CONVERT LABELS
# =========================================================

df["label"] = df["label"].map({
    "ham": "safe",
    "spam": "scam"
})


# Remove empty messages
df = df.dropna(
    subset=["message", "label"]
)


X = df["message"]
y = df["label"]


# =========================================================
# TRAIN / TEST SPLIT
# =========================================================

X_train, X_test, y_train, y_test = train_test_split(

    X,
    y,

    test_size=0.20,

    random_state=42,

    stratify=y
)


print("\nTraining messages:", len(X_train))
print("Testing messages:", len(X_test))


# =========================================================
# MACHINE LEARNING PIPELINE
# =========================================================

model = Pipeline([

    (
        "tfidf",

        TfidfVectorizer(

            lowercase=True,

            stop_words="english",

            ngram_range=(1, 2),

            max_features=10000
        )
    ),

    (
        "classifier",

        LogisticRegression(
            max_iter=1000,
            class_weight="balanced"
        )
    )
])


# =========================================================
# TRAIN MODEL
# =========================================================

print("\nTraining model...")

model.fit(
    X_train,
    y_train
)


print("Training completed!")


# =========================================================
# PREDICTION
# =========================================================

predictions = model.predict(
    X_test
)


# =========================================================
# EVALUATION
# =========================================================

accuracy = accuracy_score(
    y_test,
    predictions
)


print("\n===================================")
print("MODEL PERFORMANCE")
print("===================================")

print(
    f"Accuracy: {accuracy * 100:.2f}%"
)


print("\nClassification Report:")

print(
    classification_report(
        y_test,
        predictions
    )
)


print("\nConfusion Matrix:")

print(
    confusion_matrix(
        y_test,
        predictions
    )
)


# =========================================================
# SAVE MODEL
# =========================================================

MODEL_PATH = os.path.join(
    BASE_DIR,
    "scam_model.pkl"
)


joblib.dump(
    model,
    MODEL_PATH
)


print("\n===================================")
print("MODEL SAVED")
print("===================================")

print(
    MODEL_PATH
)