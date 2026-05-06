"""
E-Commerce Daily Segmentation DAG for Apache Airflow.

This DAG orchestrates the daily user segmentation pipeline:
1. Validate that Parquet data exists
2. Run the PySpark user segmentation batch job
3. Generate and save analytics reports
4. Send notification on completion

Schedule: Daily at 2:00 AM
"""

from datetime import datetime, timedelta
from pathlib import Path

from airflow import DAG
from airflow.operators.python import PythonOperator, BranchPythonOperator
from airflow.operators.bash import BashOperator
from airflow.operators.empty import EmptyOperator
from airflow.utils.trigger_rule import TriggerRule


# DAG Configuration

DAG_ID = "ecommerce_daily_segmentation"
DESCRIPTION = "Daily user segmentation and analytics for e-commerce clickstream data"

# Paths (configurable via environment variables in production)
PARQUET_INPUT_PATH = "/opt/airflow/data/parquet"
REPORTS_OUTPUT_PATH = "/opt/airflow/reports"
SPARK_MASTER = "spark://spark-master:7077"

# Default arguments for all tasks
default_args = {
    "owner": "data-engineering",
    "depends_on_past": False,
    "email": ["data-team@example.com"],
    "email_on_failure": True,
    "email_on_retry": False,
    "retries": 2,
    "retry_delay": timedelta(minutes=5),
    "execution_timeout": timedelta(hours=1),
}


# Task Functions

def check_data_exists(**context) -> str:
    """Check if Parquet data exists for processing.

    Returns the appropriate downstream task based on data availability.

    Returns:
        str: Task ID to execute next.
    """
    from pathlib import Path
    import logging

    logger = logging.getLogger(__name__)

    parquet_path = Path(PARQUET_INPUT_PATH)

    if not parquet_path.exists():
        logger.warning(f"Parquet path does not exist: {parquet_path}")
        return "no_data_available"

    parquet_files = list(parquet_path.glob("**/*.parquet"))

    if not parquet_files:
        logger.warning(f"No Parquet files found in: {parquet_path}")
        return "no_data_available"

    logger.info(f"Found {len(parquet_files)} Parquet files")
    context["task_instance"].xcom_push(
        key="parquet_file_count",
        value=len(parquet_files)
    )

    return "run_user_segmentation"


def run_user_segmentation(**context) -> dict:
    """Execute the PySpark user segmentation job.

    This function imports and runs the batch job directly.
    In production, use SparkSubmitOperator for proper resource management.

    Returns:
        dict: Job execution results.
    """
    import sys
    import logging

    logger = logging.getLogger(__name__)

    # Add source paths
    sys.path.insert(0, "/opt/airflow/src")
    sys.path.insert(0, "/opt/airflow/config")

    from pyspark.sql import SparkSession

    # Create Spark session
    spark = SparkSession.builder \
        .appName("AirflowUserSegmentation") \
        .master("local[*]") \
        .config("spark.driver.memory", "2g") \
        .config("spark.sql.shuffle.partitions", "4") \
        .getOrCreate()

    spark.sparkContext.setLogLevel("WARN")

    try:
        from batch.user_segmentation import UserSegmentationJob

        job = UserSegmentationJob(
            spark=spark,
            input_path=PARQUET_INPUT_PATH,
            output_path=REPORTS_OUTPUT_PATH
        )

        results = job.run()
        logger.info(f"Segmentation job completed: {results}")

        # Push results to XCom for downstream tasks
        context["task_instance"].xcom_push(
            key="job_results",
            value=results
        )

        return results

    except Exception as e:
        logger.error(f"Segmentation job failed: {e}")
        raise

    finally:
        spark.stop()


def generate_reports(**context) -> dict:
    """Generate formatted reports from segmentation results.

    Returns:
        dict: Report file paths.
    """
    import sys
    import logging
    from datetime import datetime

    logger = logging.getLogger(__name__)

    sys.path.insert(0, "/opt/airflow/src")

    # Get results from previous task
    job_results = context["task_instance"].xcom_pull(
        task_ids="run_user_segmentation",
        key="job_results"
    )

    if not job_results or job_results.get("status") != "success":
        logger.warning("No successful job results to report")
        return {"status": "skipped"}

    logger.info(f"Generating reports from: {job_results['paths']}")

    # In a full implementation, we would load the CSV files
    # and use ReportFactory to generate additional formats

    report_paths = {
        "text_report": job_results["paths"].get("email_summary"),
        "segment_csv": job_results["paths"].get("segment_summary"),
        "products_csv": job_results["paths"].get("top_products"),
        "conversion_csv": job_results["paths"].get("conversion_rates"),
    }

    context["task_instance"].xcom_push(
        key="report_paths",
        value=report_paths
    )

    return report_paths


def send_notification(**context) -> None:
    """Send completion notification.

    In production, this would send an email or Slack message.
    """
    import logging

    logger = logging.getLogger(__name__)

    job_results = context["task_instance"].xcom_pull(
        task_ids="run_user_segmentation",
        key="job_results"
    )

    report_paths = context["task_instance"].xcom_pull(
        task_ids="generate_reports",
        key="report_paths"
    )

    execution_date = context["execution_date"].strftime("%Y-%m-%d")

    message = f"""
    ╔══════════════════════════════════════════════════════════════╗
    ║     E-COMMERCE DAILY SEGMENTATION COMPLETE                   ║
    ╠══════════════════════════════════════════════════════════════╣
    ║  Execution Date: {execution_date}                            ║
    ║  Status: {'SUCCESS' if job_results else 'NO DATA'}           ║
    ╚══════════════════════════════════════════════════════════════╝
    """

    if job_results and job_results.get("status") == "success":
        message += f"""
    Statistics:
      - Total Events Processed: {job_results['stats']['total_events']}
      - User Segments: {job_results['stats']['segments']}
      - Categories Analyzed: {job_results['stats']['categories']}

    Report Files:
    """
        for name, path in (report_paths or {}).items():
            if path:
                message += f"      - {name}: {path}\n"

    logger.info(message)


def cleanup_old_reports(**context) -> int:
    """Clean up reports older than 30 days.

    Returns:
        int: Number of files deleted.
    """
    import os
    import logging
    from datetime import datetime, timedelta

    logger = logging.getLogger(__name__)

    reports_path = Path(REPORTS_OUTPUT_PATH)
    if not reports_path.exists():
        return 0

    cutoff_date = datetime.now() - timedelta(days=30)
    deleted_count = 0

    for file_path in reports_path.glob("*"):
        if file_path.is_file():
            file_time = datetime.fromtimestamp(file_path.stat().st_mtime)
            if file_time < cutoff_date:
                file_path.unlink()
                deleted_count += 1
                logger.info(f"Deleted old report: {file_path}")

    logger.info(f"Cleanup complete: {deleted_count} files deleted")
    return deleted_count


# DAG Definition

with DAG(
    dag_id=DAG_ID,
    description=DESCRIPTION,
    default_args=default_args,
    schedule_interval="0 2 * * *",  # Daily at 2:00 AM
    start_date=datetime(2024, 1, 1),
    catchup=False,
    max_active_runs=1,
    tags=["e-commerce", "analytics", "batch", "spark"],
    doc_md="""
    # E-Commerce Daily Segmentation Pipeline

    This DAG runs daily to process clickstream data and generate user analytics.

    ## Pipeline Steps

    1. **Data Validation**: Check if Parquet data exists
    2. **User Segmentation**: Run PySpark batch job
    3. **Report Generation**: Create formatted reports
    4. **Notification**: Send completion status
    5. **Cleanup**: Remove old reports (> 30 days)

    ## Outputs

    - User segment CSV (Window Shoppers vs Buyers)
    - Top 5 most viewed products
    - Conversion rates by category
    - Daily summary text report

    ## Configuration

    - Input: `/opt/airflow/data/parquet`
    - Output: `/opt/airflow/reports`
    - Schedule: Daily at 2:00 AM
    """
) as dag:

    # Task: Start marker
    start = EmptyOperator(
        task_id="start",
        doc="Pipeline start marker"
    )

    # Task: Check if data exists
    check_data = BranchPythonOperator(
        task_id="check_data_exists",
        python_callable=check_data_exists,
        doc="Validate Parquet data availability"
    )

    # Task: No data available path
    no_data = EmptyOperator(
        task_id="no_data_available",
        doc="Handle case when no data is available for processing"
    )

    # Task: Run user segmentation
    segmentation = PythonOperator(
        task_id="run_user_segmentation",
        python_callable=run_user_segmentation,
        doc="Execute PySpark user segmentation batch job"
    )

    # Task: Generate reports
    reports = PythonOperator(
        task_id="generate_reports",
        python_callable=generate_reports,
        doc="Generate formatted analytics reports"
    )

    # Task: Send notification
    notify = PythonOperator(
        task_id="send_notification",
        python_callable=send_notification,
        trigger_rule=TriggerRule.NONE_FAILED_MIN_ONE_SUCCESS,
        doc="Send completion notification"
    )

    # Task: Cleanup old reports
    cleanup = PythonOperator(
        task_id="cleanup_old_reports",
        python_callable=cleanup_old_reports,
        trigger_rule=TriggerRule.NONE_FAILED_MIN_ONE_SUCCESS,
        doc="Remove reports older than 30 days"
    )

    # Task: End marker
    end = EmptyOperator(
        task_id="end",
        trigger_rule=TriggerRule.NONE_FAILED_MIN_ONE_SUCCESS,
        doc="Pipeline end marker"
    )

    # Task Dependencies

    # Main flow
    start >> check_data

    # Branch: Data exists
    check_data >> segmentation >> reports >> notify

    # Branch: No data
    check_data >> no_data >> notify

    # Final tasks
    notify >> cleanup >> end
