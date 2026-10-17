# Claude Code → tools/otel-view.mjs (127.0.0.1:18972)로 메트릭·로그 보내기. 셸에서 source 하거나 앞에 붙여 실행
export CLAUDE_CODE_ENABLE_TELEMETRY=1
export OTEL_METRICS_EXPORTER=otlp
export OTEL_LOGS_EXPORTER=otlp
export OTEL_EXPORTER_OTLP_PROTOCOL=http/json
export OTEL_EXPORTER_OTLP_ENDPOINT=http://127.0.0.1:18972
export OTEL_METRIC_EXPORT_INTERVAL=5000
