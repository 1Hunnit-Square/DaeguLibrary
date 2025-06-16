FROM python:3.13 AS builder

ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1
WORKDIR /app

RUN pip install poetry
RUN poetry config virtualenvs.in-project true
COPY pyproject.toml poetry.lock ./
RUN poetry install
FROM python:3.13-slim
WORKDIR /app
COPY --from=builder /app/.venv .venv/
COPY . .
ENV PYTHONPATH=/app
ENV PATH="/app/.venv/bin:$PATH"
CMD ["/app/.venv/bin/python", "-m", "dglib_python.book_main"]
