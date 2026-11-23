FROM nginx:stable-alpine@sha256:caf4e1e032a20f9c3c5e28fc7f25ffd768ad8677b4975c54193075997b3a97e3
ARG VERSION=dev
ARG REVISION=local
LABEL org.opencontainers.image.version=$VERSION \
      org.opencontainers.image.revision=$REVISION \
      org.opencontainers.image.source="https://github.com/Jax-Lifu/lingyi-classroom"
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY docs/ /usr/share/nginx/html/
HEALTHCHECK --interval=30s --timeout=5s --retries=3 CMD wget -q -O /dev/null http://127.0.0.1/resource-version.json || exit 1
