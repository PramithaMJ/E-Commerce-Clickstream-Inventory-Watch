# Custom Airflow Image with Spark Provider
# Base: Apache Airflow 2.8.0
# Additions: Spark provider, PySpark, project dependencies

FROM apache/airflow:2.8.0-python3.11

USER root

# Install Java for Spark integration
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
    openjdk-17-jdk-headless \
    procps \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

ENV JAVA_HOME=/usr/lib/jvm/java-17-openjdk-amd64
ENV PATH="${JAVA_HOME}/bin:${PATH}"

USER airflow

# Install Python dependencies
RUN pip install --no-cache-dir \
    apache-airflow-providers-apache-spark==4.5.0 \
    pyspark==3.5.0 \
    confluent-kafka==2.3.0 \
    pydantic==2.5.0 \
    pydantic-settings==2.1.0 \
    pandas==2.1.0 \
    pyarrow==14.0.0

# Set Python path to include application modules
ENV PYTHONPATH="/opt/airflow/src:/opt/airflow/config:${PYTHONPATH}"
