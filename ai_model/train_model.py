import pandas as pd
from pathlib import Path
from sklearn.model_selection import train_test_split
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.pipeline import Pipeline
from sklearn.metrics import accuracy_score, classification_report
import joblib

MODEL_DIR = Path(__file__).resolve().parent

data = pd.read_csv(
    MODEL_DIR / "SMSSpamCollection",
    sep="\t",
    names=["label", "message"]
)

data = data.dropna()

X = data["message"]
y = data["label"]

y = y.map({
    "ham": 0,
    "spam": 1
})

X_train, X_test, y_train, y_test = train_test_split(
    X,
    y,
    test_size=0.2,
    random_state=42,
    stratify=y
)

model = Pipeline([
    (
        "tfidf",
        TfidfVectorizer(
            lowercase=True,
            stop_words="english",
            ngram_range=(1, 2),
            sublinear_tf=True
        )
    ),
    (
        "classifier",
        LogisticRegression(
            class_weight="balanced",
            max_iter=1000
        )
    )
])

model.fit(X_train, y_train)

predictions = model.predict(X_test)

accuracy = accuracy_score(y_test, predictions)

print("\nModel Accuracy:", accuracy)

print("\nClassification Report:")
print(classification_report(
    y_test,
    predictions,
    target_names=["SAFE", "SPAM"]
))

joblib.dump(model, MODEL_DIR / "model.pkl")

print("\nImproved model saved as model.pkl")
