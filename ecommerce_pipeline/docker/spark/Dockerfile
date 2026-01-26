# Custom Spark Image with Kafka Dependencies
# Base: Official Apache Spark 3.5.0
# Additions: Kafka connector, Python packages for data processing

FROM apache/spark:3.5.0

USER root

# Install Python dependencies
RUN pip install --no-cache-dir \
    pyspark==3.5.0 \
    confluent-kafka==2.3.0 \
    pydantic==2.5.0 \
    pydantic-settings==2.1.0 \
    pandas==2.0.3 \
    pyarrow==14.0.0

# Download Kafka connector JARs for Spark-Kafka integration
RUN mkdir -p /opt/spark/jars && \
    curl -L -o /opt/spark/jars/spark-sql-kafka-0-10_2.12-3.5.0.jar \
    https://repo1.maven.org/maven2/org/apache/spark/spark-sql-kafka-0-10_2.12/3.5.0/spark-sql-kafka-0-10_2.12-3.5.0.jar && \
    curl -L -o /opt/spark/jars/kafka-clients-3.5.0.jar \
    https://repo1.maven.org/maven2/org/apache/kafka/kafka-clients/3.5.0/kafka-clients-3.5.0.jar && \
    curl -L -o /opt/spark/jars/spark-token-provider-kafka-0-10_2.12-3.5.0.jar \
    https://repo1.maven.org/maven2/org/apache/spark/spark-token-provider-kafka-0-10_2.12/3.5.0/spark-token-provider-kafka-0-10_2.12-3.5.0.jar && \
    curl -L -o /opt/spark/jars/commons-pool2-2.11.1.jar \
    https://repo1.maven.org/maven2/org/apache/commons/commons-pool2/2.11.1/commons-pool2-2.11.1.jar

# Set working directory
WORKDIR /opt/spark-apps

# Set Python path to include application modules
ENV PYTHONPATH="/opt/spark-apps:${PYTHONPATH}"

USER 185
