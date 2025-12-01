FROM node:22.21.1-slim AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable
COPY . /app
WORKDIR /app

FROM base AS prod-deps
RUN pnpm install --prod --frozen-lockfile -r --filter api

FROM base
ENV PORT=80 NODE_ENV=production
COPY --from=prod-deps /app/node_modules /app/node_modules
COPY --from=prod-deps /app/apps/api/node_modules /app/apps/api/node_modules
EXPOSE 80

ENTRYPOINT ["pnpm"]
CMD ["run", "-r", "--filter", "api", "start:prod"]

